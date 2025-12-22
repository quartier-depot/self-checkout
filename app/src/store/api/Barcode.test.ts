import { describe, expect, it } from 'vitest';
import { Barcode } from './Barcode.ts';

describe('Barcode', () => {
  describe('isUrl', () => {
    it.each([['M0123456789'],['2981930004000']])('should return false for %s', (code: string) => {
      const actual = Barcode.isUrl(code);
      expect(actual).toBe(false);
    });

    it.each([['https://quartier-depot.ch']])('should return true for %s', (code: string) => {
      const actual = Barcode.isUrl(code);
      expect(actual).toBe(true);
    });
    
  });

  describe('isWeightEncoded', () => {
    it.each([['2981930004000']])('should return false for %s', (code: string) => {
      const actual = Barcode.isWeightEncoded(code);
      expect(actual).toBe(false);
    });

    it.each([['2981930wwwwwc']])('should return true for %s', (code: string) => {
      const actual = Barcode.isWeightEncoded(code);
      expect(actual).toBe(true);
    });
  });

  describe('matches', () => {
    it('should match equal strings', () => {
      const actual = Barcode.matches('0123456789', '0123456789');
      expect(actual).toBe(true);
    });

    it('should match non-equal strings', () => {
      const actual = Barcode.matches('0123456789', '9876543210');
      expect(actual).toBe(false);
    });

    it('should match weight encoded barcodes', () => {
      const actual = Barcode.matches('2981930wwwwwc', '2981930004000');
      expect(actual).toBe(true);
    });
  });

  describe('getQuantity', () => {
    it('should return 1 for non weight encoded barcodes', () => {
      const actual = Barcode.getQuantity('0123456789', '0123456789');
      expect(actual).toBe(1);
    });

    it('should return encoded weight', () => {
      const actual =  Barcode.getQuantity('2981930wwwwwc', '2981930004000');
      expect(actual).toBe(400);
    });
  });
});