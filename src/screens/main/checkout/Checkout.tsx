import {Payment} from "./payment/Payment";
import {Cart} from "./cart/Cart";

export function Checkout() {

    // const productsQuery = useProducts();

    return (
        <>
            <div className={'w-5/12 flex flex-col bg-blue-gray-50 h-full bg-white pr-4 pl-2 py-4'}>
                <div className={'bg-white rounded-3xl flex flex-col h-full shadow'}>
                    <Cart />

                    <Payment />
                </div>
            </div>
        </>
    )
}
