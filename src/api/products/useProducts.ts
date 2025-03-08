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
  });
  const totalHeader = initial.headers.get('x-wp-total');
  let total = 0;
  if (totalHeader !== null) {
    total = parseInt(totalHeader, 10);
  }

  if (initial.data.length === total) {
    return initial.data;
  }

  const numberOfRequests = 1; // Math.ceil(total / maximumItemsPerPage);
  const promises: Promise<any>[] = [];
  for (let i = 0; i < numberOfRequests; i++) {
    promises.push(
      api.get('products', {
        status: 'publish',
        per_page: maximumItemsPerPage,
        page: i + 1,
      }),
    );
  }

  let products: any[] = [];
  const responses = await Promise.all(promises);
  for (const response of responses) {
    products = products.concat(response.data);
  }

  return products.map((product) => new Product(product));
}
