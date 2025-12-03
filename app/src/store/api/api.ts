import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { createProduct, Product } from './products/Product';
import { createCustomer, Customer } from './customers/Customer';
import { Cart } from './cart/Cart';
import { RootState } from '../store';
import { Abo, createAbo, addOrder } from './abo/Abo';
import Papa from 'papaparse';

export type OrderStatus = 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed' | 'trash';

export interface OrderUpdate {
  id: string;
  payment_method: string;
  transaction_id: string;
  status: string;
}

export interface OrderDelete {
  orderId: string;
}

interface CreateOrderResponse {
  orderId: string;
  orderTotal: number;
  orderStatus: OrderStatus;
}

interface OrderUpdateResponse extends CreateOrderResponse {
}

interface GetOrderResponse extends CreateOrderResponse {
  transactionId: string;
}

interface DeleteOrderResponse extends CreateOrderResponse {
}

interface PayWithWalletResponse {
  response: string;
  isError: boolean;
  transactionId: number;
}

interface OrderLineItem {
  product_id: number;
}

interface Order {
  line_items: OrderLineItem[];
}

export interface WalletBalance {
  balance: number;
  currency: string;
}

interface CreateGateway {
  orderTotal: number,
  customer?: Customer,
  orderId: string
}

interface CreateGatewayResponse {
  status: string;
  message?: string;
  orderId?: string;
  link?: string;
}


export const api = createApi({
  reducerPath: 'woocommerceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/wp-json/wc/v3/',
    prepareHeaders: (headers, { getState }) => {
      headers.set('Content-Type', 'application/json');
      const state = getState() as RootState;
      const config = state.configuration.configuration;
      if (config?.woocommerce?.consumerKey && config?.woocommerce?.consumerSecret) {
        headers.set('Authorization', `Basic ${btoa(`${config.woocommerce.consumerKey}:${config.woocommerce.consumerSecret}`)}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Products', 'Customers', 'Wallet', 'Orders'],
  endpoints: (builder) => ({
    // Products
    getProducts: builder.query<Product[], void>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBaseQuery) {
        const maximumItemsPerPage = 100;
        let allProducts: any[] = [];

        // Get first page
        const initial = await fetchWithBaseQuery({
          url: 'products',
          params: {
            status: 'publish',
            per_page: maximumItemsPerPage,
            page: 1,
          },
        });

        if (initial.error) {
          return { error: initial.error };
        }

        const totalPages = parseInt(initial.meta?.response?.headers.get('x-wp-totalpages') || '0');
        if (totalPages === 0) {
          console.warn('No total pages header found in products API response');
        }

        allProducts = [...(initial.data as any[])];

        // Fetch remaining pages if any
        if (totalPages > 1) {
          const promises = [];
          for (let i = 1; i < totalPages; i++) {
            promises.push(
              fetchWithBaseQuery({
                url: 'products',
                params: {
                  status: 'publish',
                  per_page: maximumItemsPerPage,
                  page: i + 1,
                },
              }),
            );
          }

          const responses = await Promise.all(promises);
          for (const response of responses) {
            if (response.error) {
              console.warn('Error fetching additional product pages:', response.error);
              continue;
            }
            allProducts = allProducts.concat(response.data as any[]);
          }
        }

        return {
          data: allProducts
            .filter(product => product && product.catalog_visibility === 'visible')
            .map(dto => createProduct(dto))
            .sort((a, b) => {
              if (!a.articleId && !b.articleId) {
                return 0;
              }
              if (!a.articleId) {
                return 1;
              }
              if (!b.articleId) {
                return -1;
              }
              return a.articleId.localeCompare(b.articleId);
            }),
        };
      },
      providesTags: ['Products'],
    }),

    // Customers
    getCustomers: builder.query<Customer[], void>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBaseQuery) {
        const maximumItemsPerPage = 100;
        let allCustomers: any[] = [];

        // Get first page
        const initial = await fetchWithBaseQuery({
          url: 'customers',
          params: {
            role: 'all',
            per_page: maximumItemsPerPage,
            page: 1,
          },
        });

        if (initial.error) {
          return { error: initial.error };
        }

        const totalPages = parseInt(initial.meta?.response?.headers.get('x-wp-totalpages') || '0');
        if (totalPages === 0) {
          console.warn('No total pages header found in customers API response');
        }

        allCustomers = [...(initial.data as any[])];

        // Fetch remaining pages if any
        if (totalPages > 1) {
          const promises = [];
          for (let i = 1; i < totalPages; i++) {
            promises.push(
              fetchWithBaseQuery({
                url: 'customers',
                params: {
                  role: 'all',
                  per_page: maximumItemsPerPage,
                  page: i + 1,
                },
              }),
            );
          }

          const responses = await Promise.all(promises);
          for (const response of responses) {
            if (response.error) {
              console.warn('Error fetching additional customer pages:', response.error);
              continue;
            }
            allCustomers = allCustomers.concat(response.data as any[]);
          }
        }

        if (!allCustomers.length) {
          console.warn('No customers found in API response');
        }

        return {
          data: allCustomers.map((customer, index) => {
            try {
              return createCustomer(customer);
            } catch (error) {
              console.error(`Error creating Customer instance at index ${index}:`, error, 'Customer data:', customer);
              throw new Error(`Failed to create Customer instance at index ${index}`);
            }
          }),
        };
      },
      providesTags: ['Customers'],
    }),

    // Wallet
    getWalletBalance: builder.query<WalletBalance, string>({
      query: (customerEmail) => ({
        url: 'wallet/balance',
        params: { email: customerEmail },
      }),
      providesTags: ['Wallet'],
    }),

    payWithWallet: builder.mutation<PayWithWalletResponse, { customer: Customer; amount: number; note: string }>({
      query: ({ customer, amount, note }) => ({
        url: 'wallet',
        method: 'POST',
        body: { email: customer.email, type: 'debit', amount, note },
      }),
      transformResponse: (response: { response: string; id: number }): PayWithWalletResponse => {
        return {
          response: response.response,
          isError: response.response !== 'success',
          transactionId: response.id,
        };
      },
      invalidatesTags: ['Wallet'],
    }),

    // Orders
    createOrder: builder.mutation<CreateOrderResponse, { customer?: Customer; cart: Cart }>({
      query: ({ customer, cart }) => ({
        url: 'orders',
        method: 'POST',
        body: {
          // Note: use processing instead of pending to trigger the same email notification as in the webshop
          status: 'processing',
          customer_id: customer?.id,
          billing: customer?.billing,
          shipping: customer?.shipping,
          payment_method: 'wallet',
          payment_method_title: 'Virtuelles Konto',
          created_via: 'pos-rest-api',
          line_items: cart.items.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
        },
      }),
      transformResponse: (response: any): CreateOrderResponse => {
        return {
          orderId: response.id,
          orderTotal: parseFloat(response.total),
          orderStatus: response.status,
        };
      },
    }),

    updateOrder: builder.mutation<OrderUpdateResponse, OrderUpdate>({
      query: (update) => ({
        url: `orders/${update.id}`,
        method: 'PUT',
        body: update,
      }),
      invalidatesTags: ['Orders'],
      transformResponse: (response: any): OrderUpdateResponse => {
        return {
          orderId: response.id,
          orderTotal: parseFloat(response.total),
          orderStatus: response.status,
        };
      },
    }),

    deleteOrder: builder.mutation<DeleteOrderResponse, OrderDelete>({
      query: (update) => ({
        url: `orders/${update.orderId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Orders'],
      transformResponse: (response: any): DeleteOrderResponse => {
        return {
          orderId: response.id,
          orderTotal: parseFloat(response.total),
          orderStatus: response.status,
        };
      },
    }),

    getOrder: builder.query<GetOrderResponse, string>({
      query: (orderId) => ({
        url: `orders/${orderId}`
      }),
      transformResponse: (response: any): GetOrderResponse => {
        return {
          orderId: response.id,
          orderTotal: parseFloat(response.total),
          orderStatus: response.status,
          transactionId: response.transaction_id
        };
      },
    }),

    getCustomerOrders: builder.query<Order[], number>({
      query: (customerId) => ({
        url: 'orders',
        params: {
          customer: customerId,
          per_page: 20,
          status: 'completed',
        },
      }),
      transformResponse: (response: unknown): Order[] => {
        return response as Order[];
      },
      providesTags: ['Orders'],
    }),
  }),
});

export const aboApi = createApi({
  reducerPath: 'aboApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/docs-google-com/spreadsheets/d/',
    responseHandler: 'text',
  }),
  tagTypes: ['Abo'],
  endpoints: (builder) => ({
    getAbo: builder.query<Abo, void>({
      async queryFn(_arg, queryApi, _extraOptions, fetchWithBaseQuery) {

        const state = queryApi.getState() as RootState;
        const configuration = state.configuration.configuration;
        const documentId = configuration?.abo?.documentId;
        if (!documentId) {
          throw new Error('Missing configuration: abo.documentId');
        }

        const matrixPromise = await fetchWithBaseQuery(`${documentId}/export?format=csv`);
        const basisPromise = await fetchWithBaseQuery(`${documentId}/export?format=csv&gid=0`);

        const descriptionToArticleId = new Map();
        if (basisPromise.data && matrixPromise.data) {
          const abo = createAbo();

          const parsedBasis = Papa.parse<any>(basisPromise.data.toString());
          const descriptionColumn = 0;
          const articleIdColumn = 53;
          parsedBasis.data
            .filter(row => row[descriptionColumn] && row[articleIdColumn])
            .forEach(row => descriptionToArticleId.set(row[descriptionColumn], row[articleIdColumn]),
            );

          const parsedMatrix = Papa.parse<any>(matrixPromise.data.toString(), { skipFirstNLines: 1, header: true });
          abo.description = parsedMatrix.data[0]['Name'] || parsedMatrix.data[0][''];
          parsedMatrix.data.forEach((row: any, index: number) => {
            if (index > 0) {
              const total = row['Alles'];
              if (total !== '0') {
                const customerId = row['User ID'];
                if (customerId) {
                  const articleDescriptions = Object.keys(row);
                  articleDescriptions.forEach((description: string) => {
                    const articleId = descriptionToArticleId.get(description);
                    if (articleId) {
                      const quantity = row[description];
                      if (quantity) {
                        addOrder(abo, customerId, articleId, quantity);
                      }
                    }
                  });
                }
              }
            }
          });
          return { data: abo };
        } else {
          console.log('no abo data');
          return {
            error: {
              status: 'FETCH_ERROR',
              error: 'Failed to fetch Abo data from Google Sheets',
            },
          };
        }
      },
      providesTags: ['Abo'],
    }),
  }),
});

export const payrexxApi = createApi({
  reducerPath: 'payrexxApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/payrexx/v1.13/',
  }),
  tagTypes: ['Payrexx'],
  endpoints: (builder) => ({
    checkSignature: builder.query<boolean, void>({
      query: () => `SignatureCheck`,
      transformResponse: (response: any): boolean => {
        return response?.status === 'success';
      },
    }),
    createGateway: builder.mutation<CreateGatewayResponse, CreateGateway>({
      async queryFn(request, { getState }, _extraOptions, fetchWithBaseQuery) {
        const state = getState() as RootState;
        const config = state.configuration.configuration;
        if (!(config?.payrexx.redirectUrl)) {
          throw new Error("Payrexx redirect url not configured.")
        }

        const params = new URLSearchParams();
        params.append('amount', (request.orderTotal * 100).toString());
        params.append('currency', 'CHF');
        params.append('referenceId', request.orderId);
        params.append('fields[forename][value]', request.customer?.first_name || "");
        params.append('fields[surname][value]', request.customer?.last_name || "Gast");
        params.append('fields[email][value]', request.customer?.email || "");
        params.append('language', 'DE');
        params.append('successRedirectUrl', config.payrexx.redirectUrl);
        params.append('failedRedirectUrl', `${config.payrexx.redirectUrl}?payrexx=failure`);

        const result = await fetchWithBaseQuery({
          url: 'Gateway',
          method: 'POST',
          body: params.toString(),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        if (result.error) {
          return { error: result.error };
        }

        const response = result.data as any;
        return {
          data: {
            status: response.status,
            message: response.message,
            orderId: response.data[0]?.referenceId,
            link: response.data[0]?.link,
          },
        };
      },
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetCustomersQuery,
  useGetWalletBalanceQuery,
  usePayWithWalletMutation,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useGetOrderQuery,
  useGetCustomerOrdersQuery,
} = api;

export const {
  useGetAboQuery,
} = aboApi;

export const {
  useCheckSignatureQuery,
  useCreateGatewayMutation,
} = payrexxApi;