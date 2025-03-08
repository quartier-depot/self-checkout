import WooCommerceRestApi, { WooRestApiOptions } from 'woocommerce-rest-ts-api';
import { useConfiguration } from '../state/configuration/useConfiguration';

export function useApi() {
  const configuration = useConfiguration();

  const options: WooRestApiOptions = {
    url: configuration.woocommerce.url,
    consumerKey: configuration.woocommerce.consumerKey,
    consumerSecret: configuration.woocommerce.consumerSecret,
    version: 'wc/v3',
    queryStringAuth: false,
    axiosConfig: {
      insecureHTTPParser: true,
    },
  };

  return new WooCommerceRestApi(options);
}
