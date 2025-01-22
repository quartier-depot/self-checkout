import minus from "../../../assets/minus.svg";
import plus from "../../../assets/plus.svg";
import {Product} from "../../../api/products/Product.ts";
import {useAppContext} from "../../../context/useAppContext.ts";
import {ActionTypes} from "../../../actions/actions.ts";
import {ChangeEvent} from "react";

interface ItemProps {
    item: { product: Product; quantity: number }
}

export function Item({item}: ItemProps) {
    const {dispatch} = useAppContext();

    function handleChangeQuantity(quantity: number) {
            dispatch({
                type: ActionTypes.CHANGE_CART_QUANTITY,
                payload: {product: item.product, quantity: quantity}
            })
    }

    function handleSetQuantity(quantity: number) {
        dispatch({
            type: ActionTypes.SET_CART_QUANTITY,
            payload: {product: item.product, quantity: quantity}
        })
    }

    return (
        <div
            className={'select-none mb-3 bg-gray-200 rounded-lg w-full text-gray-700 py-2 px-2 flex justify-center'}>
            <div
                className="rounded-lg h-10 w-10 bg-white shadow mr-2 text-center pt-2">{item.product.artikel_id?.substring(0, 3)}</div>
            <div className={'flex-grow'}>
                <h5 className={'text-sm'}>{item.product.name}</h5>
                <p className={'text-xs block'}>{item.product.price}</p>
            </div>
            <div className={'py-1'}>
                <div className={'w-28 grid grid-cols-3 gap-2 ml-2'}>
                    <button
                        className={'rounded-lg text-center py-1 text-white bg-gray-400 hover:bg-gray-500 focus:outline-none'}
                        onClick={() => handleChangeQuantity(-1)}>
                        <img src={minus} alt={'line'} className={'h-6 w-3 inline-block'}/>
                    </button>
                    <input type="text"
                           className={'bg-white rounded-lg text-center shadow focus:outline-none focus:shadow-lg text-sm'}
                           value={item.quantity}
                           onChange={(event: ChangeEvent<HTMLInputElement>) => handleSetQuantity(Number.parseFloat(event.currentTarget.value))}
                    />
                    <button
                        className={'rounded-lg text-center py-1 text-white bg-gray-400 hover:bg-gray-500 focus:outline-none'}
                        onClick={() => handleChangeQuantity(1)}>
                        <img src={plus} alt='plus' className={'h-6 w-3 inline-block'}/>
                    </button>
                </div>
            </div>
        </div>
    )
}