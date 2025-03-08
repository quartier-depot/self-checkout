import { useProducts } from '../../api/products/useProducts';
import { useCustomers } from '../../api/customers/useCustomers';
import { Search } from './search/Search';
import { Products } from './products/Products';
import { Cart } from './cart/Cart';
import { Payment } from './payment/Payment';
import { Loading } from '../../components/modal/loading/Loading';
import { Customer } from './customer/Customer';
import { Barcode } from './barcode/Barcode';

export function Main() {
    const productsQuery = useProducts();
    const customersQuery = useCustomers();

    const loadingData = !productsQuery.isSuccess || !customersQuery.isSuccess;

    return (
            <>
                <div className={'text-slate-950 text-xl h-screen flex flex-row hide-print bg-slate-100'}>
                    <div className={'w-3/5 bg-white rounded-3xl m-2 shadow p-1 flex flex-col'}>
                        <Search />
                        <Products className={'grow'} />
                    </div>
                    <div className={'w-2/5 flex flex-col'}>
                        <Customer className={'bg-white rounded-3xl shadow p-3'} />
                        <div className={'bg-white rounded-3xl m-2 shadow p-2 grow flex flex-col overflow-hidden'}>
                            <Cart />
                            <Payment />
                        </div>
                    </div>
                </div>

                {loadingData && <Loading />}
                <Barcode />
            </>
    );
}