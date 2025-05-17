import { useEffect } from 'react';
import KeyboardBarcodeScanner from '../../../external/@point-of-sale/keyboard-barcode-scanner/main';
import { useAppDispatch } from '../../../store/store';
import { setCustomer } from '../../../store/slices/customerSlice';
import { changeCartQuantity } from '../../../store/slices/cartSlice';
import { Product } from '../../../api/products/Product';
import { Customer } from '../../../api/customers/Customer';
import { useGetProductsQuery, useGetCustomersQuery } from '../../../store/api/woocommerceApi';

interface BarcodeEvent {
    value: string;
    symbology: string;
}

export function Barcode() {
    const dispatch = useAppDispatch();
    const { data: products, isSuccess: isProductsSuccess } = useGetProductsQuery();
    const { data: customers, isSuccess: isCustomersSuccess } = useGetCustomersQuery();

    useEffect(() => {
        if (isProductsSuccess && isCustomersSuccess) {
            const keyboardScanner = new KeyboardBarcodeScanner();
            keyboardScanner.addEventListener('connected', () => {
                console.log(`Connected to barcode scanner(s) in keyboard emulation mode.`);
            });
            keyboardScanner.addEventListener('disconnected', () => {
                console.log(`Disconnected from barcode scanner(s) in keyboard emulation mode.`);
            });
            keyboardScanner.connect();
            keyboardScanner.addEventListener('barcode', (e: BarcodeEvent) => handleBarcodeEvent(e, customers, products));

            return () => {
                keyboardScanner.disconnect();
            };
        }
    }, [isProductsSuccess, isCustomersSuccess]);

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

    function barcodeInput(e: BarcodeEvent, products: Product[]) {
        if (!products || products.length === 0) {
            console.log('Product barcode not processed because productsQuery.data is ' + products);
            return;
        }

        const product = products.find((product) => product.hasMatchingBarcode(e.value));
        if (product) {
            dispatch(changeCartQuantity({ product, quantity: 1 }));
        } else {
            console.log('No product found with barcode ' + e.value);
        }
    }

    return null;
}