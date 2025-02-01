import {Product} from "../products/Product";

export type Cart = {
    items: Item[];
    quantity: number;
    price: number;
}

export type Item = {
    product: Product;
    quantity: number;
}
