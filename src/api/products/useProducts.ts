import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Product } from './Product';
import { useApi, WooCommerceRestApi } from '../useApi';

export function useProducts(options?: Omit<UseQueryOptions<Product[], Error>, 'queryKey' | 'queryFn'>) {
  const api = useApi();
  return useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(api),
    ...options
  });
}

async function getProducts(api: WooCommerceRestApi): Promise<Product[]> {
  try {
    const maximumItemsPerPage = 100;

    const initial = await api.get('products', {
      status: 'publish',
      per_page: maximumItemsPerPage,
      page: 1
    });

    if (!initial.headers) {
      throw new Error('No headers received in products API response');
    }

    const totalPages = parseInt(initial.headers.get('x-wp-totalpages') || '0');
    if (totalPages === 0) {
      console.warn('No total pages header found in products API response');
    }

    if (!initial.data) {
      throw new Error('No data received in products API response');
    }

    // Initialize products array with the initial response data
    let products: any[] = [...initial.data];

    // If there are more pages, fetch them
    if (totalPages > 1) {
      const promises: Promise<any>[] = [];
      for (let i = 1; i < totalPages; i++) {
        promises.push(
          api.get('products', {
            status: 'publish',
            per_page: maximumItemsPerPage,
            page: i + 1,
          }),
        );
      }

      try {
        const responses = await Promise.all(promises);
        for (const response of responses) {
          if (!response.data) {
            console.warn('Received product response without data:', response);
            continue;
          }
          products = products.concat(response.data);
        }
      } catch (error) {
        console.error('Error fetching additional product pages:', error);
        throw new Error('Failed to fetch additional product pages');
      }
    }

    if (!products.length) {
      console.warn('No products found in API response');
    }

    return products.map((product, index) => {
      try {
        return new Product(product);
      } catch (error) {
        console.error(`Error creating Product instance at index ${index}:`, error, 'Product data:', product);
        throw new Error(`Failed to create Product instance at index ${index}`);
      }
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw error instanceof Error ? error : new Error('Unknown error in getProducts');
  }
}
