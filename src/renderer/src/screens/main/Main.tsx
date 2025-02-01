
import {useBarcode} from "../../barcode/useBarcode";
import {useProducts} from "../../api/products/useProducts";
import {ActionTypes} from "../../actions/actions";
import {useAppContext} from "../../context/useAppContext";
import {useCustomers} from "../../api/customers/useCustomers";
import {Search} from "./search/Search";
import {Products} from "./products/Products";
import {Cart} from "./cart/Cart";
import {Payment} from "./payment/Payment";
import {Loading} from "../../components/modal/loading/Loading";


export function Main() {
    const {dispatch} = useAppContext();
    const productsQuery = useProducts();
    const customersQuery = useCustomers();

    useBarcode((barcode) => {
        dispatch({type: ActionTypes.SCANNER_INPUT, payload: {products: productsQuery.data, customers: customersQuery.data, scannerInput: barcode}});
    });

    const showModal = !productsQuery.isSuccess || !customersQuery.isSuccess;

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

            {showModal && <Loading />}
        </>

    )
}


