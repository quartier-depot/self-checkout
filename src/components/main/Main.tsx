import {Products} from "./products/Products.tsx";
import {Checkout} from "./checkout/Checkout.tsx";

export function Main() {

    // const productsQuery = useProducts();

    return (
        <>
            <div className={'bg-blue-gray-50 hide-print flex flex-row h-screen antialiased text-blue-gray-800'}>
                <div className={'flex-grow flex'}>
                    <Products/>
                    <Checkout/>
                </div>
            </div>
        </>)
}


