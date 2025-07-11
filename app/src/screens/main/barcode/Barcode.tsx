import { useEffect, useState } from 'react';
import KeyboardBarcodeScanner from '../../../external/@point-of-sale/keyboard-barcode-scanner/main';
import { useAppDispatch } from '../../../store/store';
import { setCustomer } from '../../../store/slices/customerSlice';
import { changeCartQuantity } from '../../../store/slices/cartSlice';
import { Product } from '../../../store/api/products/Product';
import { Customer } from '../../../store/api/customers/Customer';
import { useGetProductsQuery, useGetCustomersQuery } from '../../../store/api/api';
import { Dialog } from '../../../components/modal/dialog/Dialog';
import { Button } from '../../../components/button/Button';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';

interface BarcodeEvent {
    value: string;
    symbology: string;
}

const alertSound = new Audio('/assets/sounds/alert.mp3');

export function Barcode() {
    const dispatch = useAppDispatch();
    const appInsights = useAppInsightsContext();
    const { data: products, isSuccess: isProductsSuccess } = useGetProductsQuery();
    const { data: customers, isSuccess: isCustomersSuccess, refetch: refetchCustomers } = useGetCustomersQuery();
    const [showNoProductFound, setShowNoProductFound] = useState(false);
    const [showNoCustomerFound, setShowNoCustomerFound] = useState(false);
    const [barcode, setBarcode] = useState('');
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
            alertSound.play();
            appInsights.getAppInsights().trackEvent({ name: 'customer-not-found' }, { barcode: barcode });
            setBarcode(barcode);
            setShowNoCustomerFound(true);
        }
    }

    function barcodeInput(e: BarcodeEvent, products: Product[]) {
        if (!products || products.length === 0) {
            console.log('Product barcode not processed because productsQuery.data is ' + products);
            return;
        }

        let product: Product | undefined;
        if (e.value.startsWith('https://')) {
            product = products.find((product) => e.value.endsWith(product.id.toString()));
        } else {
            product = products.find((product) => product.hasMatchingBarcode(e.value));
        }

        if (product) {
            dispatch(changeCartQuantity({ product, quantity: 1, source: 'scan' }));
        } else {
            console.log('No product found with barcode ' + e.value);
            alertSound.play();
            appInsights.getAppInsights().trackEvent({ name: 'product-not-found' }, { barcode: e.value });
            setBarcode(e.value);
            setShowNoProductFound(true);
        }
    }

    function closeDialog() {
        setShowNoProductFound(false);
        setShowNoCustomerFound(false);
        setBarcode('');
    }
    
    function refetchCustomersAndCloseDialog() {
        refetchCustomers();
        closeDialog();
    }

    if (showNoProductFound) {
        return (
            <Dialog title="Kein Produkt gefunden" onBackdropClick={closeDialog}>
                    <div className={'p-4 flex-grow'}>
                        Es konnte kein Produkt mit dem Barcode <span className="font-mono">{barcode}</span> gefunden werden.
                        <p className="mt-4">
                        Bitte suche den Artikel unter "NUMMER" oder "FAVORITEN".
                        </p>
                    </div>
                    <div className={'p-4'}>
                        <Button type="primary" onClick={closeDialog}>OK</Button>
                    </div>
            </Dialog>
        )
    }

    if (showNoCustomerFound) {
        return (
            <Dialog title="Kunde nicht gefunden" onBackdropClick={closeDialog}>
                    <div className={'p-4 flex-grow'}>
                        Es konnte kein Kunde mit dem Barcode <span className="font-mono">{barcode}</span> gefunden werden.
                        <p className="mt-4">
                        Bitte klicke auf OK und zeige deinen Barcode erneut.        
                        </p>              
                    </div>
                    <div className={'p-4'}>
                        <Button type="primary" onClick={refetchCustomersAndCloseDialog}>OK</Button>
                    </div>
            </Dialog>
        )
    }

    return null;
}