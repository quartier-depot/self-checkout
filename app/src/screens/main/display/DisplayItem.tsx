import { Product as ProductClass } from '../../../store/api/products/Product';
import { formatPrice } from '../../../format/formatPrice';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { changeCartQuantity } from '../../../store/slices/cartSlice';
import { setCategory } from '../../../store/slices/displaySlice.ts';

interface DisplayItemProps {
    product: ProductClass | { category: string; products: ProductClass[] };
}

export function DisplayItem({ product }: DisplayItemProps) {
    const dispatch = useAppDispatch();  
    const viewMode = useAppSelector(state => state.display.viewMode);
    const isCategory = product.hasOwnProperty('products');

    if (isCategory) {
        const item = product as { category: string; products: ProductClass[] };
        const identifier = item.category.substring(0, item.category.indexOf(' '));
        const title = item.category.substring(item.category.indexOf('-') + 1);
        return (
            <div
                role="button"
                className={
                    'select-none cursor-pointer overflow-hidden rounded-lg bg-slate-50 p-2 text-center'
                }
                onClick={() => dispatch(setCategory(item.category))}
            >
                <h2 className={'text-xl font-bold truncate'}>{title}</h2>
                <p className={'grow truncate mr-1'}>{identifier}</p>
            </div>
        );
    } else {
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
}