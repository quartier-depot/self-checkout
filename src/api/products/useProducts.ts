import { useQuery } from '@tanstack/react-query';
import { Product } from './Product';
import { useApi, WooCommerceRestApi } from '../useApi';

export function useProducts() {
  const api = useApi();
  return useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(api),
  });
}

async function getProducts(api: WooCommerceRestApi): Promise<Product[]> {
  const maximumItemsPerPage = 100;

  const initial = await api.get('products', {
    status: 'publish',
    per_page: maximumItemsPerPage,
    page: 1
  });
  const totalPages =  parseInt(initial.headers.get('x-wp-totalpages') || '0');

  let products: any[] = [];
  if (totalPages === 1) {
    products = initial.data;
  } else {
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

    const responses = await Promise.all(promises);
    for (const response of responses) {
      products = products.concat(response.data);
    }
  }

  return products.map((product) => new Product(product));
}
