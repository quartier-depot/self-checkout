import { describe, it, expect } from 'vitest';
import { Product } from './Product';

describe('Product', () => {
  describe('hasBarcode', () => {
    it('should return false for empty barcode array', () => {
      const product = new Product({
        id: 1,
        name: 'Test Product',
        slug: 'test-product',
        price: '10.00',
        meta_data: [],
      });

      expect(product.hasBarcodes()).toBe(false);
    });

    it('should return false when barcode array contains "KEIN BARCODE"', () => {
      const product = new Product({
        id: 1,
        name: 'Test Product',
        slug: 'test-product',
        price: '10.00',
        meta_data: [
          { key: 'barcode', value: 'KEIN BARCODE' },
        ],
      });

      expect(product.hasBarcodes()).toBe(false);
    });

    it('should return true when barcode array contains valid barcode', () => {
      const product = new Product({
        id: 1,
        name: 'Test Product',
        slug: 'test-product',
        price: '10.00',
        meta_data: [
          { key: 'barcode', value: '123456789' },
        ],
      });

      expect(product.hasBarcodes()).toBe(true);
    });

    it('should return true when barcode array contains valid barcodes', () => {
      const product = new Product({
        id: 1,
        name: 'Test Product',
        slug: 'test-product',
        price: '10.00',
        meta_data: [
          { key: 'barcode', value: '123456789;123456789' },
        ],
      });

      expect(product.hasBarcodes()).toBe(true);
    });
  });
  describe('isBulkItem', () => {
    it.each([['Preis pro gramm'], ['Preis pro g'], ['Preis pro Gramm'], ['Preis in Gramm'], ['pro cl'], ['in cl'], ['Preis in Rappen']])
    ('should return true for "%s"', (freitext: string) => {
      const product = new Product({
        id: 1,
        name: 'Test Product',
        slug: 'test-product',
        price: '10.00',
        meta_data: [
          {
            key: 'freitext',
            value: freitext,
          },
        ],
      });

      expect(product.isBulkItem()).toBe(true);
    });

    it.each([[''], ['Preis pro kg'], ['in kilogramm'], ['Preis in Stück'], ['Depot -.30']])
    ('should return false for "%s"', (freitext: string) => {
      const product = new Product({
        id: 1,
        name: 'Test Product',
        slug: 'test-product',
        price: '10.00',
        meta_data: [
          {
            key: 'freitext',
            value: freitext,
          },
        ],
      });

      expect(product.isBulkItem()).toBe(false);
    });

    it('should return false for product without freitext', () => {
      const product = new Product({
        id: 1,
        name: 'Test Product',
        slug: 'test-product',
        price: '10.00',
        meta_data: [
        ],
      });

      expect(product.isBulkItem()).toBe(false);
    });
  });
}); 