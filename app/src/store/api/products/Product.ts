import { getMetaData } from '../helper/getMetaData';
import { semicolonSeparatedList } from '../helper/semicolonSeparatedList';
import { Unit, UNIT_MAPPING } from './Unit.ts';
import {decode} from 'html-entities';

export const NO_BARCODE_VALUE = 'KEIN BARCODE';

const BULK_ITEM_REGEX = /(preis\s)?(pro|in)\s+(?<unit>kilogramm|kg|gramm|g|cl|centiliter|rappen)/i;

type ProductData = Partial<{
  id: number;
  name: string;
  slug: string;
  price: number;
  articleId: string;
  barcodes: string[];
  category: string;
  isBulkItem: boolean;
  unit: Unit;
}>;


export class Product {
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
  
  static createFromWooCommerceProduct(dto: any): Product {
    function determineBulkItem(freitext: string): boolean {
      return BULK_ITEM_REGEX.test(freitext);
    }

    function determineUnit(freitext: string): Unit {
      const regexResult = BULK_ITEM_REGEX.exec(freitext);
      const unit = regexResult?.groups?.unit;
      if (!unit) {
        return Unit.NoUnit
      }

      return UNIT_MAPPING[unit.toLowerCase()] ?? Unit.NoUnit;
    }
    
    const freitext = decode(getMetaData('freitext', dto));
    const barcodes = semicolonSeparatedList(getMetaData('barcode', dto));
    const isBulkItem = determineBulkItem(freitext);
    const unit = determineUnit(freitext);
    
    const data: ProductData = {
      id: dto.id,
      name: decode(dto.name),
      slug: dto.slug,
      price: parseFloat(dto.price),
      articleId: getMetaData('artikel-id', dto),
      category: decode(getMetaData('gestell', dto)),
      barcodes,
      isBulkItem,
      unit
    }
    
    return new Product(data);
  }

  constructor(data: ProductData) {
    this.id = data.id ?? 0;
    this.name = data.name ?? '';
    this.slug = data.slug ?? '';
    this.price = data.price ?? 0;
    this.price = data.price ?? 0;
    this.articleId = data.articleId ?? '';
    this.barcodes = data.barcodes ?? [];
    this.hasBarcodes = this.barcodes.length > 0 && !this.barcodes.includes(NO_BARCODE_VALUE);
    this.category = data.category ?? '';
    this.isBulkItem = data.isBulkItem ?? false;
    this.unit = data.unit ?? Unit.NoUnit;
  }
  
  hasMatchingBarcode(barcode: string): boolean {
    return this.barcodes.includes(barcode);
  }
}
