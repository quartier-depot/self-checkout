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
  try {
    const maximumItemsPerPage = 100;

    const initial = await api.get('customers',
      {
        per_page: maximumItemsPerPage,
        page: 1,
      });

    if (!initial.headers) {
      throw new Error('No headers received in API response');
    }

    const totalPages = parseInt(initial.headers.get('x-wp-totalpages') || '0');
    if (totalPages === 0) {
      console.warn('No total pages header found in API response');
    }

    if (!initial.data) {
      throw new Error('No data received in API response');
    }

    let customers = [...initial.data];

    if (totalPages > 1) {
      const promises: Promise<any>[] = [];
      // Start from page 2 since we already have page 1
      for (let i = 1; i < totalPages; i++) {
        promises.push(
          api.get('customers', {
            per_page: maximumItemsPerPage,
            page: i + 1,
          }),
        );
      }

      try {
        const responses = await Promise.all(promises);
        for (const response of responses) {
          if (!response.data) {
            console.warn('Received response without data:', response);
            continue;
          }
          customers = customers.concat(response.data);
        }
      } catch (error) {
        console.error('Error fetching additional customer pages:', error);
        throw new Error('Failed to fetch additional customer pages');
      }
    }

    if (!customers.length) {
      console.warn('No customers found in API response');
    }

    return customers.map((customer, index) => {
      try {
        return new Customer(customer);
      } catch (error) {
        console.error(`Error creating Customer instance at index ${index}:`, error, 'Customer data:', customer);
        throw new Error(`Failed to create Customer instance at index ${index}`);
      }
    });
  } catch (error) {
    console.error('Error in getCustomers:', error);
    throw error instanceof Error ? error : new Error('Unknown error in getCustomers');
  }
}
