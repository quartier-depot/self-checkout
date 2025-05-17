import { EmptySearch } from './EmptySearch';
import { NoProducts } from './NoProducts';
import { Product } from './Product';
import { Menu } from './menu/Menu';
import { useAppSelector } from '../../../store/store';

type ProductProps = {
    className?: string
}

export function Products({ className }: ProductProps) {
    const products = useAppSelector(state => state.browse.products);

    return (
        <>
            <Menu />
            {products === undefined && <NoProducts />}
            {products && products.length === 0 && <EmptySearch />}
            {products && products.length > 0 && (
                <div className={`${className} overflow-scroll`}>
                    <div className={'grid grid-cols-2 gap-2P'}>
                        {products.map((product) => (
                            <Product key={product.id || product.gestell} product={product} />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
