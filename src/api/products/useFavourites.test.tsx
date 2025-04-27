import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFavourites } from './useFavourites';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { server } from '../../testing/setup';
import { http, HttpResponse } from 'msw';
import { Product } from './Product';


describe('useFavourites', () => {

    it('returns empty array when no customer id is provided', async () => {
        const { result } = renderHook(() => useFavourites(undefined, []), {
            wrapper: createWrapper(),
        });

        expect(result.current.data).toBeUndefined();
    });

    it('returns customers array when customer id is provided', async () => {
        mockServer([1]);

        const { result } = renderHook(() => useFavourites(42, mockProducts(1)), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toHaveLength(1);
    });

    it('sorts favourite products by order frequency', async () => {
        mockServer([3, 5, 4]);

        const { result } = renderHook(() => useFavourites(42, mockProducts(3)), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toHaveLength(3);

        // Verify products are sorted by frequency
        const products = result.current.data;
        expect(products![0].name).toBe('Index 1');
        expect(products![1].name).toBe('Index 2');
        expect(products![2].name).toBe('Index 0');
    });

    it('sorts favourite products by order frequency and slices the first 14', async () => {
        const mockedProducts = [4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1];
        expect(mockedProducts.length).toBe(15);
        mockServer(mockedProducts);

        const { result } = renderHook(() => useFavourites(42, mockProducts(mockedProducts.length)), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toHaveLength(14);

        const products = result.current.data;
        expect(products![0].name).toBe('Index 0');
        expect(products![13].name).toBe('Index 13');
    });

    it('handles empty orders response', async () => {
        mockServer([]);

        const { result } = renderHook(() => useFavourites(42, []), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toHaveLength(0);
    });
});

// i.e. [1, 5] results in total 5 orders: 1 order with product 0, 5 orders with product 1
function mockServer(products: number[]) {
    server.use(
        http.get('*/wp-json/wc/v3/orders', ({ request }) => {
            const url = new URL(request.url);
            const customerId = url.searchParams.get('customer');

            if (!customerId) {
                return new HttpResponse(null, { status: 400 });
            }

            if (!(customerId === '42')) {
                return HttpResponse.json([]);
            }

            const numberOfOrders = Math.max(...products);

            const mockOrders = [];
            for (let i = 1; i <= numberOfOrders; i++) {
                mockOrders.push({
                    line_items: products.map((p, index) => {
                        if (p >= i) {
                            return { product_id: index, name: `Index ${index}`, price: index };
                        } else {
                            return undefined;
                        }
                    }).filter(Boolean)
                });
            }

            return HttpResponse.json(mockOrders);
        })
    );
}

function mockProducts(numberOfProducts: number): Product[] {
    return Array.from({ length: numberOfProducts }, (_, i) => ({
        id: i,
        slug: `index-${i}`,
        artikel_id: `A${i}`,
        product_id: i,
        name: `Index ${i}`,
        price: i,
        gestell: '',
        barcode: '',
        external_url: '',
    }));
}

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}