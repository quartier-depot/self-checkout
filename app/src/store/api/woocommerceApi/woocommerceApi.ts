import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { createProduct, Product } from '../products/Product';
import { createCustomer, Customer } from '../customers/Customer';
import { Cart } from '../cart/Cart';
import { RootState } from '../../store';

export type OrderStatus =
  'pending'
  | 'processing'
  | 'on-hold'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'failed'
  | 'trash';

export interface OrderUpdate {
  id: string;
  payment_method: string;
  payment_method_title: string,
  transaction_id: string;
  status: string,
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



export const woocommerceApi = createApi({
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
          created_via: 'pos-rest-api',
          line_items: cart.items.map((item: any) => ({
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
        url: `orders/${orderId}`,
      }),
      transformResponse: (response: any): GetOrderResponse => {
        return {
          orderId: response.id,
          orderTotal: parseFloat(response.total),
          orderStatus: response.status,
          transactionId: response.transaction_id,
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
} = woocommerceApi;