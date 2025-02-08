import { Product as ProductClass } from '../../../api/products/Product';
import { useAppContext } from '../../../context/useAppContext';
import { formatPrice } from '../../../format/formatPrice';
import { changeCartQuantity } from '../../../state/cart/changeCartQuantity';

interface ProductProps {
  product: ProductClass;
}

export function Product({ product }: ProductProps) {
  const { dispatch } = useAppContext();

  function handleAddToCart() {
    dispatch(changeCartQuantity(1, product));
  }

  return (
    <div
      role="button"
      className={
        'select-none cursor-pointer transition-shadow overflow-hidden rounded-2xl bg-white shadow hover:shadow-lg p-8 text-center'
      }
      onClick={handleAddToCart}
    >
      <h2 className={'text-4xl'}>{product.artikel_id}</h2>
      <p className={'flex-grow truncate mr-1'}>{product.name}</p>
      <p className={'nowrap font-semibold'}>{formatPrice(product.price)}</p>
    </div>
  );
}
