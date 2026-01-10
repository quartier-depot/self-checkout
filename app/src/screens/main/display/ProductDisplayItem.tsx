import { Product as ProductClass } from '../../../store/api/Product';
import { formatPrice } from '../../../format/formatPrice';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { changeCartQuantity } from '../../../store/slices/cartSlice';
import { Badge } from '../../../components/badge/Badge.tsx';

interface ProductDisplayItemProps {
    product: ProductClass,
    quantity: number,
}

export function ProductDisplayItem({ product, quantity }: ProductDisplayItemProps) {
    const dispatch = useAppDispatch();
    const viewMode = useAppSelector(state => state.display.viewMode);
    
    return (
            <div
                    role="button"
                    className={
                        'relative select-none cursor-pointer overflow-hidden rounded-lg bg-slate-50 p-2 text-center'
                    }
                    onClick={() => dispatch(changeCartQuantity({ product: product, quantity: quantity, source: viewMode }))}
            >
                <h2 className={'text-2xl font-bold '}>
                    {product.articleId}
                </h2>
                <p className={'grow truncate mr-1 relative'}>
                    {quantity > 1 && <Badge className={'mr-2'}>{quantity}x</Badge>}{product.name}
                </p>
                <p className={'nowrap text-l'}>{formatPrice(product.price)}</p>

            </div>
    );
}