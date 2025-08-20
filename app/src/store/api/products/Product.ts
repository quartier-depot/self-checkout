import { getMetaData } from '../helper/getMetaData';
import { semicolonSeparatedList } from '../helper/semicolonSeparatedList';

const NO_BARCODE_VALUE = 'KEIN BARCODE';

const BULK_ITEM_REGEX = /(preis\s)?(pro|in)\s+(gramm|g|cl|centiliter|rappen)/i;

export class Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  external_url: string | undefined;
  artikel_id: string;
  barcodes: string[];
  gestell: string;
  isBulkItem: boolean;
  hasBarcodes: boolean;

  constructor(dto: any) {
    this.id = dto.id;
    this.name = dto.name;
    this.slug = dto.slug;
    this.price = parseFloat(dto.price);
    this.external_url = dto.external_url;
    this.artikel_id = getMetaData('artikel-id', dto);
    this.gestell = getMetaData('gestell', dto);
    
    this.barcodes = semicolonSeparatedList(getMetaData('barcode', dto));
    this.hasBarcodes = this.barcodes.length > 0 && !this.barcodes.includes(NO_BARCODE_VALUE);
    
    const freitext = getMetaData('freitext', dto);
    this.isBulkItem = BULK_ITEM_REGEX.test(freitext);
  }

  hasMatchingBarcode(barcode: string): boolean {
    return this.barcodes.includes(barcode);
  }
}
