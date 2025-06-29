import { Item as ItemType } from '../../../store/api/cart/Cart';
import { formatPrice } from '../../../format/formatPrice';

interface ItemProps {
    item: ItemType;
    onClick: (item: ItemType) => void;
}

export function Item({ item, onClick }: ItemProps) {
    return (
            <tr onClick={() => onClick(item)}>
                <td>{item.quantity}</td>
                <td className={`truncate`}>
                    {item.product.name} ({item.product.artikel_id?.substring(0, 3)})
                </td>
                <td className={'text-right'}>{formatPrice(item.product.price * item.quantity)}</td>
            </tr>
    );
}
