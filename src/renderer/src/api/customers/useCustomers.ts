import { useQuery } from '@tanstack/react-query';
import { Customer } from './Customer';
import { WooCommerceRestApiResponse } from '../WooCommerceRestApiResponse';
import { getApi } from '../getApi';

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers
  });
}

async function getCustomers(): Promise<Customer[]> {
  const maximumItemsPerPage = 100;
  const api = getApi();

  const initial = await api.get('customers');
  const total = initial.headers['x-wp-total'];

  if (initial.data.length === total) {
    return initial.data;
  }

  const numberOfRequests = Math.ceil(total / maximumItemsPerPage);
  const promises: Promise<WooCommerceRestApiResponse<any>>[] = [];
  for (let i = 0; i < numberOfRequests; i++) {
    promises.push(
      api.get('customers', {
        per_page: maximumItemsPerPage,
        page: i + 1
      })
    );
  }

  let customers: any[] = [];
  const responses = await Promise.all(promises);
  for (const response of responses) {
    customers = customers.concat(response.data);
  }

  return customers.map((customer) => new Customer(customer));
}
