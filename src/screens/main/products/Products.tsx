import { EmptySearch } from './EmptySearch';
import { useAppContext } from '../../../context/useAppContext';
import { NoProducts } from './NoProducts';
import { Product } from './Product';

type ProductProps = {
  className?: string
}

export function Products({className}: ProductProps) {
  const { state } = useAppContext();

  return (
    <>
      <div className={`p-2 ${className} overflow-scroll`}>
        {state.products === undefined && <NoProducts />}
        {state.products && state.products.length === 0 && <EmptySearch />}
        {state.products && state.products.length > 0 && (
          <div className={'grid grid-cols-2 gap-2P'}>
            {state.products!.map((product) => (
              <Product key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
