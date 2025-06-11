import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Product } from './products/Product';
import { Customer } from './customers/Customer';
import { Cart } from './cart/Cart';
import { RootState } from '../store';

export interface OrderUpdate {
  id: string;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  status: string;
} 

interface CreateOrderResponse {
  orderId: string;
  orderTotal: number;
}

interface PayWithWalletResponse {
  transactionId: number;
}

interface OrderLineItem {
  product_id: number;
}

interface Order {
  line_items: OrderLineItem[];
}


export const api = createApi({
  reducerPath: 'api',
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
            page: 1
          }
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
                  page: i + 1
                }
              })
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
            .map(dto => new Product(dto))
            .sort((a, b) => {
              if (!a.artikel_id && !b.artikel_id) return 0;
              if (!a.artikel_id) return 1;
              if (!b.artikel_id) return -1;
              return a.artikel_id.localeCompare(b.artikel_id);
            })
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
            page: 1
          }
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
                  page: i + 1
                }
              })
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
              return new Customer(customer);
            } catch (error) {
              console.error(`Error creating Customer instance at index ${index}:`, error, 'Customer data:', customer);
              throw new Error(`Failed to create Customer instance at index ${index}`);
            }
          })
        };
      },
      providesTags: ['Customers'],
    }),

    // Wallet
    getWalletBalance: builder.query<{ balance: number , currency: string }, string>({
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
          transactionId: response.id
        };
      },
      invalidatesTags: ['Wallet'],
    }),

    // Orders
    createOrder: builder.mutation<CreateOrderResponse, { customer: Customer; cart: Cart }>({
      query: ({ customer, cart }) => ({
        url: 'orders',
        method: 'POST',
        body: {
          status: 'pending',
          customer_id: customer.id,
          billing: {
            first_name: customer.first_name,
            last_name: customer.last_name || 'Kunde',
            email: customer.email,
          },
          payment_method: 'wallet',
          payment_method_title: 'Virtuelles Konto',
          line_items: cart.items.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
        }
      }),
      transformResponse: (response: any): CreateOrderResponse => {
        return {
          orderId: response.id,
          orderTotal: parseFloat(response.total)
        };
      }
    }),

    updateOrder: builder.mutation<void, OrderUpdate>({
      query: (update) => ({
        url: `orders/${update.id}`,
        method: 'PUT',
        body: update,
      }),
      invalidatesTags: ['Orders'],
    }),

    getCustomerOrders: builder.query<Order[], number>({
      query: (customerId) => ({
        url: 'orders',
        params: { customer: customerId, status: 'completed' },
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
  useGetCustomerOrdersQuery,
} = api; 