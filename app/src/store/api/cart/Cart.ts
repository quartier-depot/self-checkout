import { Product } from '../products/Product';

export type Cart = {
  items: CartItem[];
  quantity: number;
  price: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
