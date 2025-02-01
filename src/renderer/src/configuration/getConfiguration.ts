type Configuration = {
  woocommerce: {
    url: string,
    consumerKey: string,
    consumerSecret: string,
  }
}

export function getConfiguration(): Configuration {
  const WOOCOMMERCE_URL = import.meta.env.VITE_WOOCOMMERCE_URL
  const WOOCOMMERCE_CONSUMER_KEY = import.meta.env.VITE_WOOCOMMERCE_CONSUMER_KEY
  const WOOCOMMERCE_CONSUMER_SECRET = import.meta.env.VITE_WOOCOMMERCE_CONSUMER_SECRET

  return {
    woocommerce: {
      url: WOOCOMMERCE_URL,
      consumerKey: WOOCOMMERCE_CONSUMER_KEY,
      consumerSecret: WOOCOMMERCE_CONSUMER_SECRET
    }
  }
}
