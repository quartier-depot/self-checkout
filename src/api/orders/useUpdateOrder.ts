import { useMutation } from '@tanstack/react-query';
import { useApi, WooCommerceRestApi } from '../useApi';

export function useUpdateOrder() {
  const api = useApi();
  return useMutation({
    mutationFn: async (update: OrderUpdate) => updateOrder(api, update),
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

async function updateOrder(api: WooCommerceRestApi, update: OrderUpdate) {
  return await api.put(`orders/${update.id}`, update);
}
