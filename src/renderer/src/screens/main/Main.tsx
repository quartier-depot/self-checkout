import { useProducts } from '../../api/products/useProducts';
import { useAppContext } from '../../context/useAppContext';
import { useCustomers } from '../../api/customers/useCustomers';
import { Search } from './search/Search';
import { Products } from './products/Products';
import { Cart } from './cart/Cart';
import { Payment } from './payment/Payment';
import { Loading } from '../../components/modal/loading/Loading';
import KeyboardBarcodeScanner from '../../external/@point-of-sale/keyboard-barcode-scanner/main';
import { getConfiguration } from '../../configuration/getConfiguration';
import classNames from 'classnames';
import barcode from '../../assets/barcode.svg';
import { Customer } from './customer/Customer';
import { Product } from '../../api/products/Product';
import { setCustomer } from '../../state/customer/setCustomer';
import { changeCartQuantity } from '../../state/cart/changeCartQuantity';
import { CustomerActionTypes } from '../../state/customer/customerAction';

export function Main() {
  const { dispatch } = useAppContext();
  const productsQuery = useProducts();
  const customersQuery = useCustomers();
  const configuration = getConfiguration();

  async function setupScanner() {
    const keyboardScanner = new KeyboardBarcodeScanner();
    keyboardScanner.addEventListener('connected', () => {
      console.log(`Connected to barcode scanner(s) in keyboard emulation mode.`);
    });
    keyboardScanner.addEventListener('disconnected', () => {
      console.log(`Disconnected from barcode scanner(s) in keyboard emulation mode.`);
    });
    keyboardScanner.connect();
    keyboardScanner.addEventListener('barcode', handleBarcodeEvent);
  }

  function handleBarcodeEvent(e: BarcodeEvent) {
    if (!(e.value)) {
      return;
    }
    if (e.value.startsWith('qdm')) {
      memberInput(e.value);
    } else {
      barcodeInput(e.value);
    }
  }

  function memberInput(barcode: string) {
    const memberId = barcode.substring('qdm'.length).replaceAll('\'', '-');
    if (!customersQuery.data) {
      return;
    }

    const customer = customersQuery.data.find((customer) => customer.member_id === memberId);
    if (customer) {
      dispatch(setCustomer(customer));
    } else {
      console.log('No customer found with memberId ' + barcode);

    }
  }

  function barcodeInput(barcode: string) {
    if (!productsQuery.data) {
      return;
    }
    const products = productsQuery.data.filter((product: Product) => {
      return product.barcode === barcode;
    });
    switch (products.length) {
      case 0:
        console.log('Nothing found for ' + barcode);
        break;
      case 1:
        dispatch(changeCartQuantity(1, products[0]));
        break;
      default:
        console.log('Found multiple found for ' + barcode);
        break;
    }
  }


  function loginUser() {
    dispatch({ type: CustomerActionTypes.SET_CUSTOMER, payload: customersQuery.data?.find(c => c.id === 213) });
  }


  const loadingData = !productsQuery.isSuccess || !customersQuery.isSuccess;

  return (
    <>
      <div className={'hide-print flex flex-row h-screen antialiased text-blue-gray-800'}>
        <div className={'flex-grow flex'}>
          <div className={'flex flex-col bg-slate-50 h-full w-full py-4'}>
            <Search />
            <Products />
          </div>
          <div className={'w-5/12 flex flex-col bg-slate-50 h-full pr-4 pl-2 py-4'}>
            <Customer />
            <div className={'bg-white rounded-3xl flex flex-col h-full shadow mt-4'}>
              <Cart />
              <Payment />
            </div>
          </div>
        </div>
        {!loadingData && (
          <div className={'absolute bottom-10 left-8'}>
            <button type="button"
                    id="scanner-button"
                    onClick={setupScanner}
                    className={classNames('bg-amber-200 p-1', { 'hidden': configuration.electron })}>
              <img src={barcode} alt="barcode" className={'h-6 w-6 inline-block'} />
            </button>

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
    </>
  );
}
