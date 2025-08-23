import { Product as ProductClass } from '../../../store/api/products/Product';
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
                    onClick={() => dispatch(changeCartQuantity({ product: product, quantity: 1, source: viewMode }))}
            >
                <h2 className={'text-2xl font-bold '}>
                    {product.artikel_id}
                </h2>
                <p className={'grow truncate mr-1 relative'}>{product.name}</p>
                <p className={'nowrap text-l'}>{formatPrice(product.price)}</p>
                {quantity > 1 && <Badge className={'absolute top-3 right-35'}>{quantity}</Badge>}
            </div>
    );
}