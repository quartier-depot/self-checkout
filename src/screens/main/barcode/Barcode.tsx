import { useEffect } from 'react';
import KeyboardBarcodeScanner from '../../../external/@point-of-sale/keyboard-barcode-scanner/main';
import { useProducts } from '../../../api/products/useProducts';
import { useCustomers } from '../../../api/customers/useCustomers';
import { useAppContext } from '../../../context/useAppContext';
import { setCustomer } from '../../../state/customer/setCustomer';
import { changeCartQuantity } from '../../../state/cart/changeCartQuantity';
import { Product } from '../../../api/products/Product';
import { Customer } from '../../../api/customers/Customer.ts';

interface BarcodeEvent {
    value: string;
    symbology: string;
}

export function Barcode() {
    const { dispatch } = useAppContext();
    const productsQuery = useProducts();
    const customersQuery = useCustomers();

    useEffect(() => {
        if (productsQuery.isSuccess && customersQuery.isSuccess) {
            const keyboardScanner = new KeyboardBarcodeScanner();
            keyboardScanner.addEventListener('connected', () => {
                console.log(`Connected to barcode scanner(s) in keyboard emulation mode.`);
            });
            keyboardScanner.addEventListener('disconnected', () => {
                console.log(`Disconnected from barcode scanner(s) in keyboard emulation mode.`);
            });
            keyboardScanner.connect();
            keyboardScanner.addEventListener('barcode', (e: BarcodeEvent) => handleBarcodeEvent(e, customersQuery.data, productsQuery.data));

            return () => {
                keyboardScanner.disconnect();
            };
        }
    }, [productsQuery.status, customersQuery.status]);

    function handleBarcodeEvent(e: BarcodeEvent, customers: Customer[], products: Product[]) {
        if (!(e.value)) {
            return;
        }
        if (isMemberBarcode(e.value)) {
            memberInput(e.value, customers);
        } else {
            barcodeInput(e, products);
        }
    }

    function isMemberBarcode(barcode: string) {
        // starts with M and is 11 characters long
        return barcode.startsWith('M') && barcode.length === 11;
    }

    function memberInput(barcode: string, customers: Customer[]) {
        if (!customers || customers.length === 0) {
            console.log('Member barcode not processed because customersQuery.data is ' + customers);
            return;
        }

        const customer = customers.find((customer) => customer.member_id === barcode);
        if (customer) {
            dispatch(setCustomer(customer));
        } else {
            console.log('No customer found with memberId ' + barcode);
        }
    }

    function barcodeInput(barcodeEvent: BarcodeEvent, products: Product[]) {
        if (!products || products.length === 0) {
            console.log('Products barcode not processed because products is ' + products);
            return;
        }

        let matchingProducts: Product[] = [];
        switch (barcodeEvent.symbology) {
            case 'qr-code':
                const id = getProductId(barcodeEvent.value);
                if (id) {
                    matchingProducts = products.filter((product: Product) => {
                        return product.id === id;
                    });
                    break;
                }

                const slug = getProductSlug(barcodeEvent.value);
                if (slug) {
                    matchingProducts = products.filter((product: Product) => {
                        return product.slug === slug;
                    });
                    break;
                }

                console.error('Unknown QR code for product search: ' + barcodeEvent.value);
                break;

            default:
                matchingProducts = products.filter((product: Product) => {
                    return product.barcode === barcodeEvent.value;
                });
        }

        switch (matchingProducts.length) {
            case 0:
                console.log('Nothing found for ' + barcodeEvent.value);
                break;
            case 1:
                dispatch(changeCartQuantity(1, matchingProducts[0]));
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