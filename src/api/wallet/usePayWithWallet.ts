import { QueryClient, useMutation } from '@tanstack/react-query';
import { useApi, WooCommerceRestApi } from '../useApi';
import { Customer } from '../customers/Customer';

export function usePayWithWallet(queryClient: QueryClient) {
  const api = useApi();
  return useMutation({
    mutationFn: async (param: { customer: Customer; amount: number; note: string }) => {
      return await payWithWallet(api, param.customer, param.amount, param.note);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

async function payWithWallet(api: WooCommerceRestApi, customer: Customer, amount: number, note: string) {
  const response = await api.post('wallet', {
    email: customer.email,
    type: 'debit',
    amount: amount,
    note: note,
  });

  if (response.data.response === 'error') {
    throw new Error('payment failed');
  }

  return response.data.id;
}
