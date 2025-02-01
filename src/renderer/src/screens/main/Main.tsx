import { useProducts } from '../../api/products/useProducts';
import { ActionTypes } from '../../actions/actions';
import { useAppContext } from '../../context/useAppContext';
import { useCustomers } from '../../api/customers/useCustomers';
import { Search } from './search/Search';
import { Products } from './products/Products';
import { Cart } from './cart/Cart';
import { Payment } from './payment/Payment';
import { Loading } from '../../components/modal/loading/Loading';
import WebHidBarcodeScanner from '../../external/@point-of-sale/webhid-barcode-scanner/main';
import { getConfiguration } from '../../configuration/getConfiguration';
import classNames from 'classnames';
import barcode from '../../assets/barcode.svg';

export function Main() {
  const { dispatch } = useAppContext();
  const productsQuery = useProducts();
  const customersQuery = useCustomers();
  const configuration = getConfiguration();

  async function setupScanner() {
    const barcodeScanner = new WebHidBarcodeScanner();
    barcodeScanner.connect();
    barcodeScanner.addEventListener('connected', (device: HIDDevice) => {
      console.log(`Connected to ${device.productName}`);
    });
    barcodeScanner.addEventListener('barcode', handleBarcodeEvent);
  }

  function handleBarcodeEvent(e: BarcodeEvent) {
    dispatch({
      type: ActionTypes.SCANNER_INPUT,
      payload: {
        products: productsQuery.data,
        customers: customersQuery.data,
        scannerInput: e.value
      }
    });
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
            <div className={'bg-white rounded-3xl flex flex-col h-full shadow'}>

              {!loadingData && (
                <button type="button"
                        id="scanner-button"
                        onClick={setupScanner}
                        className={classNames({ 'hidden': configuration.electron })}>
                  <img src={barcode} alt="barcode" className={'h-6 w-6 inline-block'} />
                </button>
              )}
              <Cart />
              <Payment />
            </div>
          </div>
        </div>
      </div>

      {loadingData && <Loading />}
    </>
  );
}
