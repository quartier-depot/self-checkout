import { useEffect } from 'react';
import KeyboardBarcodeScanner from '../../../external/@point-of-sale/keyboard-barcode-scanner/main';
import { useProducts } from '../../../api/products/useProducts';
import { useCustomers } from '../../../api/customers/useCustomers';
import { useAppContext } from '../../../context/useAppContext';
import { setCustomer } from '../../../state/customer/setCustomer';
import { changeCartQuantity } from '../../../state/cart/changeCartQuantity';
import { Product } from '../../../api/products/Product';

interface BarcodeEvent {
  value: string;
  symbology: string;
}

export function Barcode() {
  const { dispatch } = useAppContext();
  const productsQuery = useProducts();
  const customersQuery = useCustomers();

  useEffect(() => {
    const keyboardScanner = new KeyboardBarcodeScanner();
    keyboardScanner.addEventListener('connected', () => {
      console.log(`Connected to barcode scanner(s) in keyboard emulation mode.`);
    });
    keyboardScanner.addEventListener('disconnected', () => {
      console.log(`Disconnected from barcode scanner(s) in keyboard emulation mode.`);
    });
    keyboardScanner.connect();
    keyboardScanner.addEventListener('barcode', handleBarcodeEvent);

    return () => {
      keyboardScanner.disconnect();
    };
  }, []);

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

  return null;
}