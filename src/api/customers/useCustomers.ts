import { useQuery } from '@tanstack/react-query';
import { Customer } from './Customer';
import { WooCommerceRestApiResponse } from '../WooCommerceRestApiResponse';
import { useApi, WooCommerceRestApi } from '../useApi';

export function useCustomers() {
  const api = useApi();
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => getCustomers(api),
  });
}

async function getCustomers(api: WooCommerceRestApi): Promise<Customer[]> {
  const maximumItemsPerPage = 100;

  const initial = await api.get('customers');
  const totalHeader = initial.headers.get('x-wp-total');
  let total = 0;
  if (totalHeader !== null) {
    total = parseInt(totalHeader, 10);
  }

  if (initial.data.length === total) {
    return initial.data;
  }

  const numberOfRequests = Math.ceil(total / maximumItemsPerPage);
  const promises: Promise<WooCommerceRestApiResponse<any>>[] = [];
  for (let i = 0; i < numberOfRequests; i++) {
    promises.push(
      api.get('customers', {
        per_page: maximumItemsPerPage,
        page: i + 1,
      }),
    );
  }

  let customers: any[] = [];
  const responses = await Promise.all(promises);
  for (const response of responses) {
    customers = customers.concat(response.data);
  }

  return customers.map((customer) => new Customer(customer));
}
