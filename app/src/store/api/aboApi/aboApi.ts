import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../store';
import { Abo, createAbo, addOrder } from '../Abo';
import Papa from 'papaparse';


export const aboApi = createApi({
  reducerPath: 'aboApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/docs-google-com/spreadsheets/d/',
    responseHandler: 'text',
  }),
  tagTypes: ['Abo'],
  endpoints: (builder) => ({
    getAbo: builder.query<Abo, void>({
      async queryFn(_arg, queryApi, _extraOptions, fetchWithBaseQuery) {

        const state = queryApi.getState() as RootState;
        const configuration = state.configuration.configuration;
        const documentId = configuration?.abo?.documentId;
        if (!documentId) {
          throw new Error('Missing configuration: abo.documentId');
        }

        const matrixPromise = await fetchWithBaseQuery(`${documentId}/export?format=csv`);
        const basisPromise = await fetchWithBaseQuery(`${documentId}/export?format=csv&gid=0`);

        const descriptionToArticleId = new Map();
        if (basisPromise.data && matrixPromise.data) {
          const abo = createAbo();

          const parsedBasis = Papa.parse<any>(basisPromise.data.toString());
          const descriptionColumn = 0;
          const articleIdColumn = 53;
          parsedBasis.data
            .filter(row => row[descriptionColumn] && row[articleIdColumn])
            .forEach(row => descriptionToArticleId.set(row[descriptionColumn], row[articleIdColumn]),
            );

          const parsedMatrix = Papa.parse<any>(matrixPromise.data.toString(), { skipFirstNLines: 1, header: true });
          abo.description = parsedMatrix.data[0]['Name'] || parsedMatrix.data[0][''];
          parsedMatrix.data.forEach((row: any, index: number) => {
            if (index > 0) {
              const total = row['Alles'];
              if (total !== '0') {
                const customerId = row['User ID'];
                if (customerId) {
                  const articleDescriptions = Object.keys(row);
                  articleDescriptions.forEach((description: string) => {
                    const articleId = descriptionToArticleId.get(description);
                    if (articleId) {
                      const quantity = row[description];
                      if (quantity) {
                        addOrder(abo, customerId, articleId, quantity);
                      }
                    }
                  });
                }
              }
            }
          });
          return { data: abo };
        } else {
          console.log('no abo data');
          return {
            error: {
              status: 'FETCH_ERROR',
              error: 'Failed to fetch Abo data from Google Sheets',
            },
          };
        }
      },
      providesTags: ['Abo'],
    }),
  }),
});

export const {
  useGetAboQuery,
} = aboApi;

