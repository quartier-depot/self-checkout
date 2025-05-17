import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../api/products/Product';
import { startNewOrder } from './appSlice';
import { RootState } from '../store';
import { woocommerceApi } from '../api/woocommerceApi';

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
        builder.addCase(startNewOrder, (state) => {
            console.log('startNewOrder.products');
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
    const products = woocommerceApi.endpoints.getProducts.select()(state).data;

    if (!products) return undefined;

    switch (viewMode) {
        case 'search':
            if (!searchTerm) return [];
            return products.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.artikel_id?.toLowerCase().includes(searchTerm.toLowerCase())
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
            // This will be handled by the favourites query
            return products;

        default:
            return undefined;
    }
};

export const { setViewMode, setSearchTerm, setGestell } = productsSlice.actions;
export default productsSlice.reducer; 