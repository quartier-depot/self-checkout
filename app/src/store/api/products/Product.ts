import { getMetaData } from '../helper/getMetaData';
import { semicolonSeparatedList } from '../helper/semicolonSeparatedList';
import { Unit, UNIT_MAPPING } from './Unit.ts';
import { decode } from 'html-entities';
import { Barcode } from './Barcode.ts';

export const NO_BARCODE_VALUE = 'KEIN BARCODE';

const BULK_ITEM_REGEX = /(preis\s)?(pro|in)\s+(?<unit>kilogramm|kg|gramm|g|cl|centiliter|rappen)/i;

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  articleId: string;
  barcodes: string[];
  category: string;
  isBulkItem: boolean;
  hasBarcodes: boolean;
  unit: Unit;
}

export function createProduct(dto: any): Product {
  function determineBulkItem(freitext: string): boolean {
    return BULK_ITEM_REGEX.test(freitext);
  }

  function determineUnit(freitext: string): Unit {
    const regexResult = BULK_ITEM_REGEX.exec(freitext);
    const unit = regexResult?.groups?.unit;
    if (!unit) {
      return Unit.NoUnit;
    }

    return UNIT_MAPPING[unit.toLowerCase()] ?? Unit.NoUnit;
  }

  const freitext = decode(getMetaData('freitext', dto));
  const barcodes = semicolonSeparatedList(getMetaData('barcode', dto));
  const hasBarcodes = barcodes.length > 0 && !hasMatchingBarcode(barcodes, NO_BARCODE_VALUE);
  const isBulkItem = determineBulkItem(freitext);
  const unit = determineUnit(freitext);

  return {
    id: dto.id,
    name: decode(dto.name),
    slug: dto.slug,
    price: parseFloat(dto.price),
    articleId: getMetaData('artikel-id', dto),
    category: decode(getMetaData('gestell', dto)),
    barcodes,
    hasBarcodes,
    isBulkItem,
    unit,
  };
}

export function hasMatchingBarcode(product: Product | string[], code: string): boolean {
  let barcodes = product as string[];
  if (!Array.isArray(product)) {
    barcodes = product.barcodes;
  }
  return barcodes.some(barcode => barcode === code);
}

