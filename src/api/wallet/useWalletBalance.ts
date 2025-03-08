import { useQuery } from '@tanstack/react-query';
import { useApi, WooCommerceRestApi } from '../useApi';

export function useWalletBalance(customerEmail: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: ['wallet', customerEmail ? customerEmail : 'undefined'],
    queryFn: async () => await getWalletBalance(api, customerEmail),
  });
}

async function getWalletBalance(api: WooCommerceRestApi, customerEmail: string | undefined): Promise<number | undefined> {
  if (customerEmail) {
    const response = await api.get('wallet/balance', {
      email: customerEmail,
    });
    return Number.parseFloat(response.data.balance);
  } else {
    return 0;
  }
}
