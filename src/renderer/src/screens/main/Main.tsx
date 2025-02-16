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
      barcodeInput(e);
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

  function barcodeInput(barcodeEvent: BarcodeEvent) {
    if (!productsQuery.data) {
      return;
    }

    let products: Product[] = [];
    switch (barcodeEvent.symbology) {
      case 'qr-code':
        const id = getProductId(barcodeEvent.value);
        if (id) {
          products = productsQuery.data.filter((product: Product) => {
            return product.id === id;
          });
          break;
        }

        const slug = getProductSlug(barcodeEvent.value);
        if (slug) {
          products = productsQuery.data.filter((product: Product) => {
            return product.slug === slug;
          });
          break;
        }

        console.error('Unknown QR code for product search: ' + barcodeEvent.value);
        break;

      default:
        products = productsQuery.data.filter((product: Product) => {
          return product.barcode === barcodeEvent.value;
        });
    }

    switch (products.length) {
      case 0:
        console.log('Nothing found for ' + barcodeEvent.value);
        break;
      case 1:
        dispatch(changeCartQuantity(1, products[0]));
        break;
      default:
        console.log('Found multiple found for ' + barcodeEvent.value);
        break;
    }
  }

  function getProductSlug(url: String) {
    const regex = /.*\/produkt\/(.*)/;
    const match = url.match(regex);
    if (match) {
      return match[1].replace(/\//g, '');
    }
    return undefined;
  }

  function getProductId(url: String) {
    const regex = /.*\/?p=(\d*)/;
    const match = url.match(regex);
    if (match) {
      return Number.parseInt(match[1]);
    }
    return undefined;
  }


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
