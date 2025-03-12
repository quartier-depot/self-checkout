import { useQuery } from '@tanstack/react-query';
import { Customer } from './Customer';
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

  const initial = await api.get('customers',
    {
      per_page: maximumItemsPerPage,
      page: 1,
    });
  const totalPages = parseInt(initial.headers.get('x-wp-totalpages') || '0');

  let customers: any[] = [];
  if (totalPages === 1) {
    customers = initial.data;
  } else {
    const promises: Promise<any>[] = [];
    for (let i = 1; i < totalPages; i++) {
      promises.push(
        api.get('customers', {
          per_page: maximumItemsPerPage,
          page: i + 1,
        }),
      );
    }

    const responses = await Promise.all(promises);
    for (const response of responses) {
      customers = customers.concat(response.data);
    }
  }

  return customers.map((customer) => new Customer(customer));
}
