import { Unit, UNIT_MAPPING } from './Unit.ts';
import { decode } from 'html-entities';

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

function semicolonSeparatedList(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(';').map(item => item.trim()).filter(item => item.length > 0);
}

function getMetaData(key: string, dto: any): string {
  if (!dto || !dto.meta_data || !Array.isArray(dto.meta_data)) {
    return '';
  }

  return (
    dto.meta_data.find((meta: { key: string; value: string }) => meta.key === key)?.value ?? ''
  );
}
