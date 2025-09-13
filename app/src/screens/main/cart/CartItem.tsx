import { CartItem as CartItemType } from '../../../store/api/cart/Cart';
import { formatPrice } from '../../../format/formatPrice';
import moreHorizontal from '../../../assets/more-horizontal.svg';

interface ItemProps {
    item: CartItemType;
    onClick: (item: CartItemType) => void;
}

export function CartItem({ item, onClick }: ItemProps) {
    return (
            <tr className={'h-10 border-b-slate-500 border-b-1'} onClick={() => onClick(item)}>
                <td>
                    <img src={moreHorizontal} alt="more" className={'h-4 inline-block'} />
                </td>
                <td className={'text-right pr-3'}>{item.quantity}</td>
                <td className={`truncate`}>
                    {item.product.name} ({item.product.articleId?.substring(0, 3)})
                </td>
                <td className={'text-right'}>{formatPrice(item.product.price * item.quantity)}</td>
            </tr>
    );
}
