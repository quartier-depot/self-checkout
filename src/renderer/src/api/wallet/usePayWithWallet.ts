import { QueryClient, useMutation } from '@tanstack/react-query';
import { getApi } from '../getApi';
import { Customer } from '../customers/Customer';
import { WooRestApiEndpoint } from 'woocommerce-rest-ts-api';

export function usePayWithWallet(queryClient: QueryClient) {
  return useMutation({
    mutationFn: async (param: { customer: Customer; amount: number; note: string }) => {
      return await payWithWallet(param.customer, param.amount, param.note)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries( {queryKey: ['wallet'] });
    }
  });
}

async function payWithWallet(customer: Customer, amount: number, note: string) {
  const api = getApi();

  const response = await api.post('wallet' as WooRestApiEndpoint, {
    email: customer.email,
    type: 'debit',
    amount: amount,
    note: note
  });

  if (response.data.response === 'error') {
    throw new Error('payment failed');
  }

  return response.data.id;
}
