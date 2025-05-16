import { getMetaData } from '../getMetaData';
import { semicolonSeparatedList } from '../semicolonSeparatedList';

const NO_BARCODE_VALUE = 'KEIN BARCODE';

export class Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  external_url: string | undefined;
  artikel_id: string | undefined;
  barcodes: string[];
  gestell: string | undefined;

  constructor(dto: any) {
    this.id = dto.id;
    this.name = dto.name;
    this.slug = dto.slug;
    this.price = parseFloat(dto.price);
    this.external_url = dto.external_url;
    this.artikel_id = getMetaData('artikel-id', dto);
    this.barcodes = semicolonSeparatedList(getMetaData('barcode', dto));
    this.gestell = getMetaData('gestell', dto);
  }

  hasMatchingBarcode(barcode: string): boolean {
    return this.barcodes.includes(barcode);
  }

  hasBarcodes(): boolean {
    return !this.barcodes.includes(NO_BARCODE_VALUE) && this.barcodes.length > 0
  }
}
