import {Product as ProductClass} from "../../../api/products/Product";
import {useAppContext} from "../../../context/useAppContext.ts";
import {ActionTypes} from "../../../actions/actions.ts";
import {formatPrice} from "../../../format/formatPrice.ts";

interface ProductProps {
    product: ProductClass
}

export function Product({product}: ProductProps) {
    const {dispatch} = useAppContext();

    function handleAddToCart() {
        dispatch({type: ActionTypes.CHANGE_CART_QUANTITY, payload: {product: product, quantity: 1}});
    }

    return (
        <div role="button"
             className={'select-none cursor-pointer transition-shadow overflow-hidden rounded-2xl bg-white shadow hover:shadow-lg p-8 text-center'}
            onClick={handleAddToCart}
        >
            <h2 className={'text-4xl'}>
                {product.artikel_id}
            </h2>
                <p className={'flex-grow truncate mr-1'}>{product.name}</p>
                <p className={'nowrap font-semibold'}>{formatPrice(product.price)}</p>
        </div>
    )
}