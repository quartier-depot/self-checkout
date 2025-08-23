import { describe, expect, it } from 'vitest';
import displayReducer, {
  CategoryDisplayItemType,
  ProductDisplayItemType,
  selectFilteredDisplayItems,
  setCategory,
  setSearchTerm,
  setViewMode
} from './displaySlice.ts';
import { startNewSession } from './appSlice';
import { Product } from '../api/products/Product.ts';

type ViewMode = '' | 'browse' | 'search' | 'favourites';

interface ProductsState {
  viewMode: ViewMode;
  searchTerm: string;
  category: string;
}

describe('displaySlice', () => {
  describe('reducers', () => {
    it('should handle initial state', () => {
      expect(displayReducer(undefined, { type: 'unknown' })).toEqual({
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
      expect(displayReducer(initialState, setViewMode('search'))).toEqual({
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
      expect(displayReducer(initialState, setSearchTerm('test'))).toEqual({
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
      expect(displayReducer(initialState, setCategory('A1'))).toEqual({
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
      expect(displayReducer(initialState, startNewSession())).toEqual({
        viewMode: '',
        searchTerm: '',
        category: '',
      });
    });
  });

  describe('selectFilteredDisplayItems', () => {
    const mockProducts: Product[] = Array.from({ length: 15 }, (_, i) => (new Product({
      id: i + 1,
      name: `Product ${i + 1}`,
      artikel_id: `A${i + 1}`,
      category: String.fromCharCode(65 + i), // A, B, C, etc.
      barcodes: [],
      slug: `product-${i + 1}`,
      price: (i + 1) * 10,
    })));

    it('should return undefined when viewMode is empty', () => {
      const state = {
        display: {
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

    it.only('should filter display items by search term', () => {
      const state = {
        display: {
          viewMode: 'search',
          searchTerm: '5',
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
      const result = selectFilteredDisplayItems(state as any);
      expect(result).toHaveLength(2); // A5, A15
      const item1 = result![0] as ProductDisplayItemType;
      expect(item1.product.name).toBe('Product 5');
      const item2 = result![1] as ProductDisplayItemType;
      expect(item2.product.name).toBe('Product 15');
    });

    it('should filter display items by shell', () => {
      const state = {
        display: {
          viewMode: 'browse',
          searchTerm: '',
          category: 'A',
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
      const result = selectFilteredDisplayItems(state as any);
      expect(result).toHaveLength(1);
      const category = result![0] as CategoryDisplayItemType;
      expect(category.key).toBe('A');
    });

    it('should group display items by category when no specific category is selected', () => {
      const state = {
        display: {
          viewMode: 'browse',
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
      const result = selectFilteredDisplayItems(state as any);
      expect(result).toHaveLength(15);
      const firstGroup = result![0] as CategoryDisplayItemType;
      const secondGroup = result![1] as CategoryDisplayItemType;
      expect(firstGroup.key).toBe('A');
      expect(secondGroup.key).toBe('B');
    });

    it('should sort favourite display items by order frequency', () => {
      const state = {
        display: {
          viewMode: 'favourites',
          searchTerm: '',
          category: '',
        },
        woocommerceApi: {
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
      expect((result![0] as ProductDisplayItemType).product.id).toBe(2);
      expect((result![1] as ProductDisplayItemType).product.id).toBe(1);
    });

    it('should slice the first 14 display items products', () => {
      const state = {
        display: {
          viewMode: 'favourites',
          searchTerm: '',
          category: '',
        },
        woocommerceApi: {
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
        display: {
          viewMode: 'favourites',
          searchTerm: '',
          category: '',
        },
        woocommerceApi: {
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