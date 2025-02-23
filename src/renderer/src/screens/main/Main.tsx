import { useProducts } from '../../api/products/useProducts';
import { useAppContext } from '../../context/useAppContext';
import { useCustomers } from '../../api/customers/useCustomers';
import { Search } from './search/Search';
import { Products } from './products/Products';
import { Cart } from './cart/Cart';
import { Payment } from './payment/Payment';
import { Loading } from '../../components/modal/loading/Loading';
import { getConfiguration } from '../../configuration/getConfiguration';
import classNames from 'classnames';
import barcode from '../../assets/barcode.svg';
import { Customer } from './customer/Customer';
import { CustomerActionTypes } from '../../state/customer/customerAction';
import { Barcode } from './barcode/Barcode';

export function Main() {
  const { dispatch } = useAppContext();
  const productsQuery = useProducts();
  const customersQuery = useCustomers();
  const configuration = getConfiguration();

  function loginUser() {
    dispatch({ type: CustomerActionTypes.SET_CUSTOMER, payload: customersQuery.data?.find(c => c.id === 213) });
  }

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
        {!loadingData && (
          <div className={'absolute bottom-10 left-8'}>
            <button type="button"
                    id="scanner-button"
                    onClick={loginUser}
                    className={classNames('bg-amber-200 p-1', { 'hidden': configuration.electron })}>
              <img src={barcode} alt="user" className={'h-6 w-6 inline-block'} />
            </button>
          </div>
        )}
      </div>

      {loadingData && <Loading />}
      <Barcode />
    </>
  );
}