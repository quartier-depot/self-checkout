import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {  Customer } from '../Customer';
import { RootState } from '../../store';

interface CreateGateway {
  orderTotal: number,
  customer?: Customer,
  orderId: string
}

interface CreateGatewayResponse {
  status: string;
  message?: string;
  orderId?: string;
  link?: string;
}

export const payrexxApi = createApi({
  reducerPath: 'payrexxApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/payrexx/v1.13/',
  }),
  tagTypes: ['Payrexx'],
  endpoints: (builder) => ({
    checkSignature: builder.query<boolean, void>({
      query: () => `SignatureCheck`,
      transformResponse: (response: any): boolean => {
        return response?.status === 'success';
      },
    }),
    createGateway: builder.mutation<CreateGatewayResponse, CreateGateway>({
      async queryFn(request, { getState }, _extraOptions, fetchWithBaseQuery) {
        const state = getState() as RootState;
        const config = state.configuration.configuration;
        if (!(config?.payrexx.redirectUrl)) {
          throw new Error('Payrexx redirect url not configured.');
        }

        const params = new URLSearchParams();
        var amount = (request.orderTotal * 100).toString();
        params.append('amount', amount);
        params.append('currency', 'CHF');
        params.append('referenceId', `self-checkout-${request.orderId}`);
        params.append('fields[forename][value]', request.customer?.first_name || '');
        params.append('fields[surname][value]', request.customer?.last_name || 'Unbekannt');
        params.append('fields[email][value]', request.customer?.email || '');
        params.append('pm[0]', 'twint');
        params.append('language', 'DE');
        params.append('successRedirectUrl', config.payrexx.redirectUrl);
        params.append('failedRedirectUrl', `${config.payrexx.redirectUrl}?payrexx=failure`);
        params.append('basket[0][name]', `Bestellung ${request.orderId}`);
        params.append('basket[0][amount]', amount);

        const result = await fetchWithBaseQuery({
          url: 'Gateway',
          method: 'POST',
          body: params.toString(),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        if (result.error) {
          return { error: result.error };
        }

        const response = result.data as any;
        return {
          data: {
            status: response.status,
            message: response.message,
            orderId: response.data[0]?.referenceId,
            link: response.data[0]?.link,
          },
        };
      },
    }),
  }),
});

export const {
  useCheckSignatureQuery,
  useCreateGatewayMutation,
} = payrexxApi;
