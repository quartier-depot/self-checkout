import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Product } from '../../api/products/Product';
import { Customer } from '../../api/customers/Customer';
import { Cart } from '../../api/orders/Cart';
import { OrderUpdate } from '../../api/orders/OrderUpdate';
import { RootState } from '../../store/store';

interface CreateOrderResponse {
  orderId: string;
  orderTotal: number;
}

interface PayWithWalletResponse {
  transactionId: number;
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
  tagTypes: ['Products', 'Customers', 'Wallet', 'Favourites'],
  endpoints: (builder) => ({
    // Products
    getProducts: builder.query<Product[], void>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const maximumItemsPerPage = 100;
        let allProducts: any[] = [];

        // Get first page
        const initial = await fetchWithBQ({
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
              fetchWithBQ({
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
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const maximumItemsPerPage = 100;
        let allCustomers: any[] = [];

        // Get first page
        const initial = await fetchWithBQ({
          url: 'customers',
          params: {
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
              fetchWithBQ({
                url: 'customers',
                params: {
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
    getWalletBalance: builder.query<number, string>({
      query: (customerEmail) => ({
        url: 'wallet',
        params: { customer_email: customerEmail },
      }),
      providesTags: ['Wallet'],
    }),

    payWithWallet: builder.mutation<PayWithWalletResponse, { customer: Customer; amount: number; note: string }>({
      query: ({ customer, amount, note }) => ({
        url: 'wallet/pay',
        method: 'POST',
        body: { customer_id: customer.id, amount, note },
      }),
      invalidatesTags: ['Wallet'],
    }),

    // Orders
    createOrder: builder.mutation<CreateOrderResponse, { customer: Customer; cart: Cart }>({
      query: ({ customer, cart }) => ({
        url: 'orders',
        method: 'POST',
        body: { customer_id: customer.id, ...cart },
      }),
    }),

    updateOrder: builder.mutation<void, OrderUpdate>({
      query: (update) => ({
        url: `orders/${update.id}`,
        method: 'PUT',
        body: update,
      }),
    }),

    // Favourites
    getFavourites: builder.query<Product[], { customerId: string; products: Product[] }>({
      query: ({ customerId }) => ({
        url: 'orders',
        params: { customer: customerId, status: 'completed' },
      }),
      transformResponse: (response: any[], _, { products }) => {
        // Transform the response to get favourite products
        const productFrequency = new Map<number, number>();
        
        response.forEach(order => {
          order.line_items.forEach((item: any) => {
            const count = productFrequency.get(item.product_id) || 0;
            productFrequency.set(item.product_id, count + 1);
          });
        });

        return products
          .filter(product => productFrequency.has(product.id))
          .sort((a, b) => {
            const freqA = productFrequency.get(a.id) || 0;
            const freqB = productFrequency.get(b.id) || 0;
            return freqB - freqA;
          })
          .slice(0, 14);
      },
      providesTags: ['Favourites'],
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
  useGetFavouritesQuery,
} = woocommerceApi; 