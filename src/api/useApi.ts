export interface WooCommerceRestApi {
  get: (path: string, params?: any) => Promise<{ status: number, headers: Headers, data: any}>;
  post: (path: string, data: any, params?: any) => Promise<{ status: number, headers: Headers, data: any }>;
  put: (path: string, data: any, params?: any) => Promise<{ status: number, headers: Headers, data: any }>;
}

/**
 * The intention was to use @woocommerce/woocommerce-rest-api but there are problems with the crypto create HMAC functionality used internally.
 */
export function useApi(): WooCommerceRestApi {
  const options = {
    url: '.',
    version: 'wc/v3',
    queryStringAuth: false,
  };

  return {
    async get(path: string, params?: any) {
      const url = `${options.url}/wp-json/${options.version}/${path}`;
      const query = getQueryString(params);

      const response = await fetch(`${url}${query}`);

      return await handleResponse(response);
    },

    async post(path: string, data: any, params?: any) {
      const url = `${options.url}/wp-json/${options.version}/${path}`;
      const query = getQueryString(params);

      const response = await fetch(`${url}${query}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return await handleResponse(response);
    },

    async put(path: string, data: any, params?: any) {
      const url = `${options.url}/wp-json/${options.version}/${path}`;
      const query = getQueryString(params);

      const response = await fetch(`${url}${query}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      return await handleResponse(response);
    }
  }
}

function getQueryString(params?: any) {
  let query = '';
  if (params) {
    query += '?';
    query += Object.keys(params).map((name:string) => `${name}=${encodeURIComponent(params[name])}`).join('&');
  }
  return query;
}

async function handleResponse(response: Response) {
  if (response.status !== 200) {
    console.log(response.status);
    throw Error("NOK response status: "+response.status);
  }

  try {
    const json = await response.json();
    return {
      status: response.status,
      headers: response.headers,
      data: json,
    }
  } catch (error) {
    throw Error("Error parsing response: "+error);
  }
}