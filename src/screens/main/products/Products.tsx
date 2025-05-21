import { EmptySearch } from './EmptySearch';
import { Instructions } from './Instructions';
import { Product } from './Product';
import { Menu } from './menu/Menu';
import { useAppSelector } from '../../../store/store';
import { selectFilteredProducts } from "../../../store/slices/productsSlice";
import { Product as ProductType } from "../../../store/api/products/Product";

type ProductProps = {
    className?: string
}

type ProductOrGroup = ProductType | { gestell: string; products: ProductType[] };

export function Products({ className }: ProductProps) {
    const products = useAppSelector(selectFilteredProducts);

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
                <div className={`${className} overflow-scroll`}>
                    <div className={'grid grid-cols-2 gap-2P'}>
                        {products.map((product: ProductOrGroup) => (
                            <Product 
                                key={getProductKey(product)} 
                                product={product} 
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
