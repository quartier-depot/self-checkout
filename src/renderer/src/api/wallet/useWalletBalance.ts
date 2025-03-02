import { useQuery } from '@tanstack/react-query';
import { useApi } from '../useApi';
import WooCommerceRestApi, { WooRestApiEndpoint, WooRestApiOptions } from 'woocommerce-rest-ts-api';

export function useWalletBalance(customerEmail: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: ['wallet', customerEmail ? customerEmail : 'undefined'],
    queryFn: async () => await getWalletBalance(api, customerEmail)
  });
}

async function getWalletBalance(api: WooCommerceRestApi<WooRestApiOptions>, customerEmail: string | undefined): Promise<number | undefined> {
  if (customerEmail) {
    const response = await api.get('wallet/balance' as WooRestApiEndpoint, {
      email: customerEmail
    });
    return Number.parseFloat(response.data.balance);
  } else {
    return 0;
  }
}
