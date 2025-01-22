import cart from "../../../assets/cart.svg";
import trash from "../../../assets/trash.svg";
import {useAppContext} from "../../../context/useAppContext";
import {ActionTypes} from "../../../actions/actions";
import {Item} from "./Item";

export function Cart() {
    const {state, dispatch} = useAppContext();

    return (
        <>
            <div className={'flex-1 flex flex-col overflow-auto'}>
                <div className={'h-16 text-center flex justify-center'}>
                    <div className={'pl-8 text-left text-lg py-4 relative'}>
                        <img src={cart} alt="cart" className={'h-6 inline-block'}/>
                        <div
                            className={'text-center absolute bg-emerald-700 text-white w-5 h-5 text-xs p-0 leading-5 rounded-full -right-2 top-3'}
                        >{state.cart.quantity}</div>
                    </div>
                    <div className={'flex-grow px-8 text-right text-lg py-4 relative'}>
                        <button
                            className={'text-blue-gray-300 hover:text-pink-500 focus:outline-none'}
                            onClick={() => dispatch({type: ActionTypes.EMPTY_CART})}>
                            <img src={trash} alt="trash" className={'h-6 w-6 inline-block'}/>
                        </button>
                    </div>
                </div>

                <div className={'flex-1 w-full px-4 overflow-auto'}>
                    {state.cart.items.map(item => <Item key={item.product.id} item={item} />)}
                </div>
            </div>
        </>
    )
}