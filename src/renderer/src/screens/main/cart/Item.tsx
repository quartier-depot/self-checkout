import { Product } from '../../../api/products/Product';
import { formatPrice } from '../../../format/formatPrice';

interface ItemProps {
  item: { product: Product; quantity: number };
}

export function Item({ item }: ItemProps) {
  return (
    <tr>
      <td className={'pr-4'} >{item.quantity}</td>
      <td >
        {item.product.name} ({item.product.artikel_id?.substring(0, 3)})
      </td>
      <td className={'text-right'}>{formatPrice(item.product.price * item.quantity)}</td>
    </tr>
  );
}
