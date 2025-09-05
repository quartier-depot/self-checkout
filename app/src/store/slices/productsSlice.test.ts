import { describe, expect, it } from 'vitest';
import productsReducer, { selectFilteredDisplayItems, setCategory, setSearchTerm, setViewMode } from './displaySlice.ts';
import { startNewSession } from './appSlice';
import { Product } from '../api/products/Product.ts';

type ViewMode = '' | 'browse' | 'search' | 'favourites';

interface ProductsState {
    viewMode: ViewMode;
    searchTerm: string;
    category: string;
}

describe('productsSlice', () => {
    describe('reducers', () => {
        it('should handle initial state', () => {
            expect(productsReducer(undefined, { type: 'unknown' })).toEqual({
                viewMode: '',
                searchTerm: '',
                category: '',
            });
        });

        it('should handle setViewMode', () => {
            const initialState: ProductsState = {
                viewMode: '',
                searchTerm: '',
                category: '',
            };
            expect(productsReducer(initialState, setViewMode('search'))).toEqual({
                ...initialState,
                viewMode: 'search',
            });
        });

        it('should handle setSearchTerm', () => {
            const initialState: ProductsState = {
                viewMode: '',
                searchTerm: '',
                category: '',
            };
            expect(productsReducer(initialState, setSearchTerm('test'))).toEqual({
                ...initialState,
                searchTerm: 'test',
            });
        });

        it('should handle setCategory', () => {
            const initialState: ProductsState = {
                viewMode: '',
                searchTerm: '',
                category: '',
            };
            expect(productsReducer(initialState, setCategory('A1'))).toEqual({
                ...initialState,
                category: 'A1',
            });
        });

        it('should reset state on startNewSession', () => {
            const initialState: ProductsState = {
                viewMode: 'search',
                searchTerm: 'test',
                category: 'A1',
            };
            expect(productsReducer(initialState, startNewSession())).toEqual({
                viewMode: '',
                searchTerm: '',
                category: '',
            });
        });
    });

    describe('selectFilteredProducts', () => {
        const mockProducts: Product[] = Array.from({ length: 15 }, (_, i) => (new Product({
            id: i + 1,
            name: `Product ${i + 1}`,
            artikel_id: `A${i + 1}`,
            category: String.fromCharCode(65 + i), // A, B, C, etc.
            barcodes: [],
            slug: `product-${i + 1}`,
            price: (i + 1) * 10
        })));

        it('should return undefined when viewMode is empty', () => {
            const state = {
                products: {
                    viewMode: '',
                    searchTerm: '',
                    category: '',
                },
                woocommerceApi: {
                    queries: {
                        'getProducts(undefined)': {
                            data: mockProducts,
                        },
                    },
                },
                customer: {
                    customer: null,
                },
            };
            expect(selectFilteredDisplayItems(state as any)).toBeUndefined();
        });

        it('should filter products by search term', () => {
            const state = {
                products: {
                    viewMode: 'search',
                    searchTerm: '5',
                    category: '',
                },
                api: {
                    queries: {
                        'getProducts(undefined)': {
                            data: mockProducts,
                        },
                    },
                },
                customer: {
                    customer: null,
                },
            };
            const result = selectFilteredDisplayItems(state as any);
            expect(result).toHaveLength(2); // A5, A15
            const product1 = result![0] as Product;
            expect(product1.name).toBe('Product 5');
            const product2 = result![1] as Product;
            expect(product2.name).toBe('Product 15');
        });

        it('should filter products by shell', () => {
            const state = {
                products: {
                    viewMode: 'browse',
                    searchTerm: '',
                    category: 'A',
                },
                api: {
                    queries: {
                        'getProducts(undefined)': {
                            data: mockProducts,
                        },
                    },
                },
                customer: {
                    customer: null,
                },
            };
            const result = selectFilteredDisplayItems(state as any);
            expect(result).toHaveLength(1);
            const product = result![0] as Product;
            expect(product.category).toBe('A');
        });

        it('should group products by category when no specific category is selected', () => {
            const state = {
                products: {
                    viewMode: 'browse',
                    searchTerm: '',
                    category: '',
                },
                api: {
                    queries: {
                        'getProducts(undefined)': {
                            data: mockProducts,
                        },
                    },
                },
                customer: {
                    customer: null,
                },
            };
            const result = selectFilteredDisplayItems(state as any);
            expect(result).toHaveLength(15);
            const firstGroup = result![0] as { category: string; products: Product[] };
            const secondGroup = result![1] as { category: string; products: Product[] };
            expect(firstGroup.category).toBe('A');
            expect(secondGroup.category).toBe('B');
        });

        it('should sort favourite products by order frequency', () => {
            const state = {
                products: {
                    viewMode: 'favourites',
                    searchTerm: '',
                    category: '',
                },
                api: {
                    queries: {
                        'getProducts(undefined)': {
                            data: mockProducts,
                        },
                        'getCustomerOrders(42)': {
                            data: [
                                { id: '1', line_items: [{ product_id: 1, quantity: 100 }, { product_id: 2, quantity: 1 }] },
                                { id: '2', line_items: [{ product_id: 2, quantity: 1 }] },
                            ],
                        },
                    },
                },
                customer: {
                    customer: {
                        id: 42,
                    },
                },
            };

            const result = selectFilteredDisplayItems(state as any);

            expect(result).toHaveLength(2);
            expect((result![0] as Product).id).toBe(2);
            expect((result![1] as Product).id).toBe(1);
        });

        it('should slice the first 14 favourite products', () => {
            const state = {
                products: {
                    viewMode: 'favourites',
                    searchTerm: '',
                    category: '',
                },
                api: {
                    queries: {
                        'getProducts(undefined)': {
                            data: mockProducts,
                        },
                        'getCustomerOrders(42)': {
                            data: [
                                { id: '1', line_items: [{ product_id: 1, quantity: 1 }] },
                                { id: '2', line_items: [{ product_id: 2, quantity: 1 }] },
                                { id: '3', line_items: [{ product_id: 3, quantity: 1 }] },
                                { id: '4', line_items: [{ product_id: 4, quantity: 1 }] },
                                { id: '5', line_items: [{ product_id: 5, quantity: 1 }] },
                                { id: '6', line_items: [{ product_id: 6, quantity: 1 }] },
                                { id: '7', line_items: [{ product_id: 7, quantity: 1 }] },
                                { id: '8', line_items: [{ product_id: 8, quantity: 1 }] },
                                { id: '9', line_items: [{ product_id: 9, quantity: 1 }] },
                                { id: '10', line_items: [{ product_id: 10, quantity: 1 }] },
                                { id: '11', line_items: [{ product_id: 11, quantity: 1 }] },
                                { id: '12', line_items: [{ product_id: 12, quantity: 1 }] },
                                { id: '13', line_items: [{ product_id: 13, quantity: 1 }] },
                                { id: '14', line_items: [{ product_id: 14, quantity: 1 }] },
                                { id: '15', line_items: [{ product_id: 15, quantity: 1 }] },
                            ],
                        },
                    },
                },
                customer: {
                    customer: {
                        id: 42,
                    },
                },
            };

            const result = selectFilteredDisplayItems(state as any);
            expect(result).toHaveLength(14);
        });

        it('should return empty array when no customer id is provided in favourites mode', () => {
            const state = {
                products: {
                    viewMode: 'favourites',
                    searchTerm: '',
                    category: '',
                },
                api: {
                    queries: {
                        'getProducts(undefined)': {
                            data: mockProducts,
                        },
                        'getCustomerOrders(42)': {
                            data: [],
                        },
                    },
                },
                customer: {
                    customer: null,
                },
            };
            const result = selectFilteredDisplayItems(state as any);
            expect(result).toHaveLength(0);
        });
    });
}); 