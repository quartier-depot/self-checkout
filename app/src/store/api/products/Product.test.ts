import { describe, expect, it } from 'vitest';
import { Product } from './Product';
import { Unit } from './Unit.ts';

describe('Product', () => {
  describe('createFromWooCommerceProduct', () => {
    describe('hasBarcode', () => {
      it('should return false for empty barcode array', () => {
        const product = Product.createFromWooCommerceProduct({
          id: 1,
          name: 'Test Product',
          slug: 'test-product',
          price: '10.00',
          meta_data: [],
        });

        expect(product.hasBarcodes).toBe(false);
      });

      it('should return false when barcode array contains "KEIN BARCODE"', () => {
        const product = Product.createFromWooCommerceProduct({
          id: 1,
          name: 'Test Product',
          slug: 'test-product',
          price: '10.00',
          meta_data: [
            { key: 'barcode', value: 'KEIN BARCODE' },
          ],
        });

        expect(product.hasBarcodes).toBe(false);
      });

      it('should return true when barcode array contains valid barcode', () => {
        const product = Product.createFromWooCommerceProduct({
          id: 1,
          name: 'Test Product',
          slug: 'test-product',
          price: '10.00',
          meta_data: [
            { key: 'barcode', value: '123456789' },
          ],
        });

        expect(product.hasBarcodes).toBe(true);
      });

      it('should return true when barcode array contains valid barcodes', () => {
        const product = Product.createFromWooCommerceProduct({
          id: 1,
          name: 'Test Product',
          slug: 'test-product',
          price: '10.00',
          meta_data: [
            { key: 'barcode', value: '123456789;123456789' },
          ],
        });

        expect(product.hasBarcodes).toBe(true);
      });
    });

    describe('isBulkItem', () => {
      it.each([['Preis pro gramm'], ['Preis pro g'], ['Preis pro Gramm'], ['Preis in Gramm'], ['pro cl'], ['in cl'], ['Preis in Rappen'], ['Preis pro kg'], ['in kilogramm']])
      ('should return true for "%s"', (freitext: string) => {
        const product = Product.createFromWooCommerceProduct({
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

        expect(product.isBulkItem).toBe(true);
      });

      it.each([[''], ['Preis in Stück'], ['Depot -.30']])
      ('should return false for "%s"', (freitext: string) => {
        const product = Product.createFromWooCommerceProduct({
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

        expect(product.isBulkItem).toBe(false);
      });

      it('should return false for product without freitext', () => {
        const product = Product.createFromWooCommerceProduct({
          id: 1,
          name: 'Test Product',
          slug: 'test-product',
          price: '10.00',
          meta_data: [],
        });

        expect(product.isBulkItem).toBe(false);
      });
    });

    describe('unit', () => {
      it.each([[Unit.Gram, 'Preis pro gramm'], [Unit.Gram, 'Preis pro g'], [Unit.Gram, 'Preis pro Gramm'], [Unit.Gram, 'Preis in Gramm'], [Unit.Centiliter, 'pro cl'], [Unit.Centiliter, 'in cl'], [Unit.Centime, 'Preis in Rappen'], [Unit.Kilogram, 'Preis pro kg'], [Unit.Kilogram, 'in kilogramm']])
      ('should return %s for "%s"', (expectedUnit: Unit, freitext: string) => {
        const product = Product.createFromWooCommerceProduct({
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

        expect(product.unit).toBe(expectedUnit);
      });

      it.each([[''], ['Preis in Stück'], ['Depot -.30']])
      ('should return no unit for "%s"', (freitext: string) => {
        const product = Product.createFromWooCommerceProduct({
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

        expect(product.unit).toBe(Unit.NoUnit);
      });

      it('should return no unit for product without freitext', () => {
        const product = Product.createFromWooCommerceProduct({
          id: 1,
          name: 'Test Product',
          slug: 'test-product',
          price: '10.00',
          meta_data: [],
        });

        expect(product.unit).toBe(Unit.NoUnit);
      });
    });
  });
});