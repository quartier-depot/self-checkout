import { useQuery } from '@tanstack/react-query';
import { useApi } from '../useApi';
import { WooRestApiEndpoint } from 'woocommerce-rest-ts-api';

export function useWalletBalance(customerEmail: string | undefined) {
  return useQuery({
    queryKey: ['wallet', customerEmail ? customerEmail : 'undefined'],
    queryFn: async () => await getWalletBalance(customerEmail)
  });
}

async function getWalletBalance(customerEmail: string | undefined): Promise<number | undefined> {
  if (customerEmail) {
    const api = useApi();
    const response = await api.get('wallet/balance' as WooRestApiEndpoint, {
      email: customerEmail
    });
    return Number.parseFloat(response.data.balance);
  } else {
    return 0;
  }
}
