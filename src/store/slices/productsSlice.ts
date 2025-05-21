import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../store/api/products/Product';
import { startNewSession } from './appSlice';
import { RootState } from '../store';
import { api } from '../api/api';

type ViewMode = '' | 'browse' | 'search' | 'favourites';

interface ProductsState {
    viewMode: ViewMode;
    searchTerm: string;
    gestell: string;
}

const initialState: ProductsState = {
    viewMode: '',
    searchTerm: '',
    gestell: '',
};

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setViewMode: (state, action: PayloadAction<ViewMode>) => {
            state.viewMode = action.payload;
        },
        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.searchTerm = action.payload;
        },
        setGestell: (state, action: PayloadAction<string>) => {
            state.gestell = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(startNewSession, (state) => {
            state.viewMode = initialState.viewMode;
            state.searchTerm = initialState.searchTerm;
            state.gestell = initialState.gestell;
        });
    },
});

// Selectors
export const selectViewMode = (state: RootState) => state.products.viewMode;
export const selectSearchTerm = (state: RootState) => state.products.searchTerm;
export const selectGestell = (state: RootState) => state.products.gestell;

export const selectFilteredProducts = (state: RootState) => {
    const { viewMode, searchTerm } = state.products;
    const products = api.endpoints.getProducts.select()(state).data;

    if (!products) return undefined;

    switch (viewMode) {
        case 'search':
            if (!searchTerm) return [];
            return products.filter(product =>
                product.artikel_id?.endsWith(searchTerm)
            );

        case 'browse':
            if (state.products.gestell) {
                return products.filter(product => product.gestell === state.products.gestell);
            } else {
                // Group products by gestell
                const gestelleMap = new Map<string, Product[]>();
                products.forEach(product => {
                    if (product.gestell) {
                        const products = gestelleMap.get(product.gestell) || [];
                        products.push(product);
                        gestelleMap.set(product.gestell, products);
                    }
                });
                return Array.from(gestelleMap.entries()).map(([gestell, products]) => ({
                    gestell,
                    products
                }));
            };

        case 'favourites':
            const customerId = state.customer.customer?.id;
            if (!customerId) return [];
            
            const orders = api.endpoints.getCustomerOrders.select(customerId)(state).data;
            if (!orders) return [];

            // Calculate product frequency
            const productFrequency = new Map<string, number>();
            orders.forEach(order => {
                order.line_items.forEach(item => {
                    const key = item.product_id.toString();
                    const count = productFrequency.get(key) || 0;
                    productFrequency.set(key, count + 1);
                });
            });

            return products
                .filter(product => productFrequency.has(product.id.toString()))
                .sort((a, b) => {
                    const freqA = productFrequency.get(a.id.toString()) || 0;
                    const freqB = productFrequency.get(b.id.toString()) || 0;
                    return freqB - freqA;
                })
                .slice(0, 14);

        default:
            return undefined;
    }
};

export const { setViewMode, setSearchTerm, setGestell } = productsSlice.actions;
export default productsSlice.reducer; 