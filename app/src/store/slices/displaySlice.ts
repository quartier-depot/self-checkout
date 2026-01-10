import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product as ProductType } from '../api/Product.ts';
import { startNewSession } from './sessionSlice';
import { RootState } from '../store';
import { woocommerceApi } from '../api/woocommerceApi/woocommerceApi';
import { List, PickUp } from '../api/PickUp.ts';

type ViewMode = '' | 'browse' | 'search' | 'favourites' | 'abo';

interface DisplayState {
  viewMode: ViewMode;
  searchTerm: string;
  category: string;
}

const initialState: DisplayState = {
  viewMode: '',
  searchTerm: '',
  category: ''
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
  }
});

// Selectors
export const selectViewMode = (state: RootState) => state.display.viewMode;
export const selectSearchTerm = (state: RootState) => state.display.searchTerm;

export type ProductDisplayItemType = { key: string; type: 'product', product: ProductType; quantity: number };
export type CategoryDisplayItemType = { key: string; type: 'category' };
export type ListDisplayItemType = { key: string; type: 'list', delivery: string, title: string};
export type DisplayItemType = ProductDisplayItemType | CategoryDisplayItemType | ListDisplayItemType;

export const selectFilteredDisplayItems = (state: RootState): DisplayItemType[] | undefined => {
  const { viewMode, searchTerm } = state.display;
  const products = woocommerceApi.endpoints.getProducts.select()(state).data;
  const pickUp = woocommerceApi.endpoints.getPickUp.select()(state).data;
  const customerId = state.customer.customer?.id;

  if (!products) return undefined;

  switch (viewMode) {
    case 'search':
      if (!searchTerm) return [];
      return products.filter(product =>
        product.articleId?.endsWith(searchTerm)
      ).map(product => createProductDisplayItem(product, 1));

    case 'browse':
      if (state.display.category) {
        return products
          .filter(product => product.category === state.display.category)
          .filter(product => !product.hasBarcodes)
          .map(product => createProductDisplayItem(product, 1));
      } else {
        const categories = products
          .filter(product => !product.hasBarcodes)
          .filter(product => product.category)
          .map(product => product.category);
        const distinctCategories = [...new Set(categories)];
        return distinctCategories.map(category => createCategoryDisplayItem(category));
      }

    case 'favourites':
      if (!customerId) return [];

      const orders = woocommerceApi.endpoints.getCustomerOrders.select(customerId)(state).data;
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
        .slice(0, 14)
        .map(product => createProductDisplayItem(product, 1));
            
    case 'abo':
      if (!customerId || !pickUp || !customerHasPickUp(customerId, pickUp)) return [];
      
      const lists: List[] = [];
      for (const list of pickUp.lists) {
        for (const customer of list.customers) {
          if (customer.customer_id === customerId) {
            lists.push(list);
           }
        }
      }
      
      lists.sort((a, b) => Date.parse(a.delivery) - Date.parse(b.delivery));
      
      const items: DisplayItemType[] = [];
      for (const list of lists) {
        for (const customer of list.customers) {
          items.push({ key: list.id.toString(), type: 'list', delivery: list.delivery, title: list.title });
          items.push(...customer.preorders.map(preorder => {
            const productId = Number(preorder.product_id);
            const product = products.find(product => product.id === productId);
            if (!product) {
              throw new Error('Product not found for preorder: ' + preorder.product_id);
            }
            return createProductDisplayItem(product, Number(preorder.amount));
          }));
        }
      }
      return items;

    default:
      return undefined;
  }
};

function createProductDisplayItem(product: ProductType, quantity: number = 0): DisplayItemType {
  return {
    key: product.id.toString(),
    type: 'product',
    product,
    quantity: quantity
  };
}

function createCategoryDisplayItem(category: string): DisplayItemType {
  return {
    key: category,
    type: 'category'
  };
}

export function customerHasPickUp(customerId: number | undefined, pickUp: PickUp | undefined) {
  if (!customerId || !pickUp) {
    return false;
  }

  return pickUp.lists.some(list =>
    list.customers.some(c => c.customer_id === customerId)
  );
}

export const { setViewMode, setSearchTerm, setCategory } = displaySlice.actions;
export default displaySlice.reducer; 