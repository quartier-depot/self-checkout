import {Products} from "./products/Products.tsx";
import {Checkout} from "./checkout/Checkout.tsx";
import {Search} from "./search/Search.tsx";

export function Main() {

    // const productsQuery = useProducts();

    return (
        <>
            <div className={'bg-blue-gray-50 hide-print flex flex-row h-screen antialiased text-blue-gray-800'}>
                <div className={'flex-grow flex'}>
                    <div className={'flex flex-col bg-slate-50 h-full w-full py-4'}>
                        <Search />
                        <Products />
                    </div>
                    <Checkout/>
                </div>
            </div>
        </>)
}


