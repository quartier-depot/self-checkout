import { getConfiguration } from '../configuration/getConfiguration'
import WooCommerceRestApi, { WooRestApiOptions } from 'woocommerce-rest-ts-api'

export function getApi() {
  const configuration = getConfiguration()

  const options: WooRestApiOptions = {
    url: configuration.woocommerce.url,
    consumerKey: configuration.woocommerce.consumerKey,
    consumerSecret: configuration.woocommerce.consumerSecret,
    version: 'wc/v3',
    queryStringAuth: false,
    axiosConfig: {
      insecureHTTPParser: true
    }
  }

  return new WooCommerceRestApi(options)
}
