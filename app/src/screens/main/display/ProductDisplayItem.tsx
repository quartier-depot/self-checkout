import { Product as ProductClass } from '../../../store/api/products/Product';
import { formatPrice } from '../../../format/formatPrice';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { changeCartQuantity } from '../../../store/slices/cartSlice';

interface ProductDisplayItemProps {
    product: ProductClass,
    quantity: number,
}

export function ProductDisplayItem({ product }: ProductDisplayItemProps) {
    const dispatch = useAppDispatch();
    const viewMode = useAppSelector(state => state.display.viewMode);

    const item = product as ProductClass;
    return (
            <div
                    role="button"
                    className={
                        'select-none cursor-pointer overflow-hidden rounded-lg bg-slate-50 p-2 text-center'
                    }
                    onClick={() => dispatch(changeCartQuantity({ product: item, quantity: 1, source: viewMode }))}
            >
                <h2 className={'text-2xl font-bold'}>{item.artikel_id}</h2>
                <p className={'grow truncate mr-1'}>{item.name}</p>
                <p className={'nowrap text-l'}>{formatPrice(item.price)}</p>
            </div>
    );
}