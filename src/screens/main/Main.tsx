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

    if (productsQuery.isError) {
        throw new Error('Error loading products: ' + productsQuery.error?.message);
    }

    if (customersQuery.isError) {
        throw new Error('Error loading customers: ' + customersQuery.error?.message);
    }

    return (
            <>
                <div className={'bg-slate-950 text-slate-950 h-screen flex flex-row hide-print'}>
                    <div className={'w-3/5 bg-slate-50 p-2 flex flex-col'}>
                        <Search />
                        <Products className={'grow'} />
                    </div>
                    <div className={'w-2/5 flex flex-col'}>
                        <Customer className={'bg-slate-50 p-3 ml-3 mb-3 mt-0 mr-0'} />
                        <div className={'bg-slate-50 ml-3 mb-0 mt-0 mr-0 p-2 grow flex flex-col overflow-hidden'}>
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