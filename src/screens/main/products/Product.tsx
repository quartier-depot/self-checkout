import { Product as ProductClass } from '../../../api/products/Product';
import { formatPrice } from '../../../format/formatPrice';
import { useAppDispatch } from '../../../store/store';
import { changeCartQuantity } from '../../../store/slices/cartSlice';
import { setGestell } from '../../../store/slices/productsSlice';

interface ProductProps {
    product: ProductClass | { gestell: string; products: ProductClass[] };
}

export function Product({ product }: ProductProps) {
    const dispatch = useAppDispatch();

    const isGestell = product.hasOwnProperty('products');

    if (isGestell) {
        const item = product as { gestell: string; products: ProductClass[] };
        const identifier = item.gestell.substring(0, item.gestell.indexOf(' '));
        const title = item.gestell.substring(item.gestell.indexOf('-') + 1);
        const text = item.products.length > 1 ? `${item.products.length} Produkte` : '1 Produkt';
        return (
            <div
                role="button"
                className={
                    'select-none cursor-pointer overflow-hidden rounded-lg bg-slate-50 p-2 text-center'
                }
                onClick={() => dispatch(setGestell(item.gestell))}
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
                onClick={() => dispatch(changeCartQuantity({ product: item, quantity: 1 }))}
            >
                <h2 className={'text-2xl font-bold'}>{item.artikel_id}</h2>
                <p className={'grow truncate mr-1'}>{item.name}</p>
                <p className={'nowrap text-l'}>{formatPrice(item.price)}</p>
            </div>
        );
    }
}