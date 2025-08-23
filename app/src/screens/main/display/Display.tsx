import { EmptySearch } from './EmptySearch';
import { Instructions } from './Instructions';
import { DisplayItem } from './DisplayItem.tsx';
import { Menu } from './menu/Menu';
import { useAppSelector } from '../../../store/store';
import { Product as ProductType } from "../../../store/api/products/Product";
import Scrollbar from '../../../components/scrollbar/Scrollbar';
import { selectFilteredDisplayItems } from '../../../store/slices/displaySlice.ts';

type ProductOrGroup = ProductType | { gestell: string; products: ProductType[] };

export function Display() {
    const products = useAppSelector(selectFilteredDisplayItems);

    const getProductKey = (product: ProductOrGroup): string => {
        if ('products' in product) {
            return product.gestell;
        }
        return product.id.toString();
    };

    return (
        <>
            <Menu />
            {products === undefined && <Instructions />}
            {products && products.length === 0 && <EmptySearch />}
            {products && products.length > 0 && (
            <Scrollbar>
                <div className={'grid grid-cols-2 gap-2P'}>
                    {products.map((product: ProductOrGroup) => (
                        <DisplayItem 
                            key={getProductKey(product)} 
                            product={product} 
                        />
                    ))}
                </div>
            </Scrollbar>
            )}
        </>
    );
}
