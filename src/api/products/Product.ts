export class Product {
    id: number;
    product_id: string
    name: string;
    permalink: string | undefined;
    price: number;
    external_url: string | undefined;
    artikel_id: string | undefined;

    constructor(dto: any) {
        this.id = dto.id;
        this.product_id = dto.product_id;
        this.name = dto.name;
        this.permalink = dto.permalink;
        this.price = parseFloat(dto.price);
        this.external_url = dto.external_url;
        this.artikel_id = dto.meta_data.find((meta: {
            key: string,
            value: string
        }) => meta.key === 'artikel-id')?.value;
    }
}