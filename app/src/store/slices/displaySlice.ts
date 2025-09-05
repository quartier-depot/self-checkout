import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../api/products/Product.ts';
import { startNewSession } from './sessionSlice';
import { RootState } from '../store';
import { api } from '../api/api';

type ViewMode = '' | 'browse' | 'search' | 'favourites';

interface DisplayState {
    viewMode: ViewMode;
    searchTerm: string;
    category: string;
}

const initialState: DisplayState = {
    viewMode: '',
    searchTerm: '',
    category: '',
};

const displaySlice = createSlice({
    name: 'display',
    initialState,
    reducers: {
        setViewMode: (state, action: PayloadAction<ViewMode>) => {
            state.viewMode = action.payload;
        },
        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.searchTerm = action.payload;
        },
        setCategory: (state, action: PayloadAction<string>) => {
            state.category = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(startNewSession, (state) => {
            state.viewMode = initialState.viewMode;
            state.searchTerm = initialState.searchTerm;
            state.category = initialState.category;
        });
    },
});

// Selectors
export const selectViewMode = (state: RootState) => state.display.viewMode;
export const selectSearchTerm = (state: RootState) => state.display.searchTerm;
export const selectFilteredDisplayItems = (state: RootState) => {
    const { viewMode, searchTerm } = state.display;
    const products = api.endpoints.getProducts.select()(state).data;
    
    if (!products) return undefined;

    console.log(viewMode);
    switch (viewMode) {
      case 'search':
        if (!searchTerm) return [];
        return products.filter(product =>
          product.artikel_id?.endsWith(searchTerm)
        );

      case 'browse':
        if (state.display.category) {
          return products
            .filter(product => product.category === state.display.category)
            .filter(product => !product.hasBarcodes);
        } else {
          // Group products by category
          const categoryeMap = new Map<string, Product[]>();
          products
            .filter(product => !product.hasBarcodes)
            .forEach(product => {
              if (product.category) {
                const products = categoryeMap.get(product.category) || [];
                products.push(product);
                categoryeMap.set(product.category, products);
              }
            });
          return Array.from(categoryeMap.entries()).map(([category, products]) => ({
            category,
            products
          }));
        }

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

export const { setViewMode, setSearchTerm, setCategory } = displaySlice.actions;
export default displaySlice.reducer; 