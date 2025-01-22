import {Products} from "./products/Products";
import {Payment} from "./payment/Payment";
import {Search} from "./search/Search";
import {Cart} from "./cart/Cart.tsx";

export function Main() {

    // const productsQuery = useProducts();

    return (
        <>
            <div className={'hide-print flex flex-row h-screen antialiased text-blue-gray-800'}>
                <div className={'flex-grow flex'}>
                    <div className={'flex flex-col bg-slate-50 h-full w-full py-4'}>
                        <Search />
                        <Products />
                    </div>
                    <div className={'w-5/12 flex flex-col bg-slate-50 h-full pr-4 pl-2 py-4'}>
                        <div className={'bg-white rounded-3xl flex flex-col h-full shadow'}>
                            <Cart/>
                            <Payment />
                        </div>
                    </div>
                </div>
            </div>
        </>)
}


