import { useMutation } from '@tanstack/react-query';
import { useApi } from '../useApi';
import { WooRestApiEndpoint } from 'woocommerce-rest-ts-api';

export function useUpdateOrder() {
  return useMutation({
    mutationFn: async (update: OrderUpdate) => updateOrder(update)
  });
}

type Status =
  | 'pending'
  | 'processing'
  | 'on-hold'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'failed'
  | 'trash';
type OrderUpdate = {
  id: string;
  status?: Status;
  payment_method?: string;
  payment_method_title?: string;
  transaction_id?: string;
};

async function updateOrder(update: OrderUpdate) {
  const api = useApi();
  return await api.put(`orders/${update.id}` as WooRestApiEndpoint, update);
}
