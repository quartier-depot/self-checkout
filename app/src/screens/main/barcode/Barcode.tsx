import { useEffect, useMemo, useState } from 'react';
import KeyboardBarcodeScanner from '../../../external/@point-of-sale/keyboard-barcode-scanner/main';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { setCustomer } from '../../../store/slices/customerSlice';
import { changeCartQuantity } from '../../../store/slices/cartSlice';
import { Product } from '../../../store/api/Product';
import { Customer } from '../../../store/api/Customer';
import { useGetProductsQuery, useGetCustomersQuery } from '../../../store/api/woocommerceApi/woocommerceApi';
import { Dialog } from '../../../components/modal/dialog/Dialog';
import { Button } from '../../../components/button/Button';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { Barcode as ProductBarcode } from '../../../store/api/Barcode.ts';
import { formatCustomer } from '../../../format/formatCustomer.ts';

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
    const [showDifferentCustomerLoggedIn, setShowDifferentCustomerLoggedIn] = useState(false);
    const [newCustomer, setNewCustomer] = useState<Customer | null>(null);
    const [barcode, setBarcode] = useState('');
    const loggedInCustomer = useAppSelector(state => state.customer.customer);
    const session = useAppSelector(state => state.session.session);
    const isPaymentInProgress = useAppSelector(state => state.session.session.payment.state) !== 'NoPayment';
    const productByBarcode = useMemo<Map<string, Product>>(createProductByBarcodeMap, [products]);
    const productsWithWeightEncoding = useMemo<Map<string, Product>>(createProductsWithWeightEncodingMap, [products]);
    
    useEffect(() => {
        if (session.initialState) {
            setShowNoProductFound(false);
            setShowNoCustomerFound(false);
        }
    }, [session.initialState]);
    
    useEffect(() => {
        if (isProductsSuccess && isCustomersSuccess) {
            const keyboardScanner = new KeyboardBarcodeScanner();
            keyboardScanner.addEventListener('connected', () => {
                console.log(`Connected to barcode scanner(s) in keyboard emulation mode.`);
            });
            keyboardScanner.addEventListener('disconnected', () => {
                console.log(`Disconnected from barcode scanner(s) in keyboard emulation mode.`);
            });
            // noinspection JSIgnoredPromiseFromCall
            keyboardScanner.connect();
            keyboardScanner.addEventListener('barcode', (e: BarcodeEvent) => handleBarcodeEvent(e, customers, products, isPaymentInProgress, loggedInCustomer));

            return () => {
                // noinspection JSIgnoredPromiseFromCall
                keyboardScanner.disconnect();
            };
        }
    }, [isProductsSuccess, isCustomersSuccess, isPaymentInProgress, loggedInCustomer]);
    
    function createProductByBarcodeMap(): Map<string, Product> {
        const map = new Map();
        if (products && products.length) {
            products.forEach((product) => {
                product.barcodes.forEach((barcode) => {
                    map.set(barcode, product);
                })
            })
        }
        return map;
    }
    
    function createProductsWithWeightEncodingMap(): Map<string, Product> {
        const map = new Map();
        if (products && products.length) {
            products.forEach((product) => {
                product.barcodes.filter(barcode => ProductBarcode.isWeightEncoded(barcode))
                        .forEach((barcode) => {
                    map.set(barcode, product);
                })
            })
        }
        return map;
    }
    
    function handleBarcodeEvent(e: BarcodeEvent, customers: Customer[], products: Product[], isPaymentInProgress: boolean, loggedInCustomer: Customer | undefined) {
        if (!(e.value)) {
            return;
        }
        if (isMemberBarcode(e.value)) {
            memberInput(e.value, customers, isPaymentInProgress, loggedInCustomer);
        } else {
            barcodeInput(e, products, isPaymentInProgress);
        }
    }

    function isMemberBarcode(barcode: string) {
        // starts with M and is 11 characters long
        return barcode.startsWith('M') && barcode.length === 11;
    }

    function memberInput(barcode: string, customers: Customer[], isPaymentInProgress: boolean, loggedInCustomer: Customer | undefined) {
        if (isPaymentInProgress) {
            console.log('Member barcode not processed product scanning is not allowed at the moment');
            // noinspection JSIgnoredPromiseFromCall
            alertSound.play();
            return;
        }
        
        if (!customers || customers.length === 0) {
            console.log('Member barcode not processed because customersQuery.data is ' + customers);
            return;
        }

        const customer = customers.find((customer) => customer.member_id === barcode);
        if (customer && loggedInCustomer && loggedInCustomer.id !== customer.id) {
            // noinspection JSIgnoredPromiseFromCall
            alertSound.play();
            setNewCustomer(customer);
            setShowDifferentCustomerLoggedIn(true);
        } else if (customer && loggedInCustomer && loggedInCustomer.id === customer.id) {
            // no operation
        } else if (customer) {
            dispatch(setCustomer(customer));
        } else {
            console.log('No customer found with memberId ' + barcode);
            // noinspection JSIgnoredPromiseFromCall
            alertSound.play();
            appInsights.getAppInsights().trackEvent({ name: 'customer-not-found' }, { barcode: barcode });
            setBarcode(barcode);
            setShowNoCustomerFound(true);
        }
    }

    function barcodeInput(e: BarcodeEvent, products: Product[], isNoPaymentInProgress: boolean) {
        if (isNoPaymentInProgress) {
            console.log('Product barcode not processed product scanning is not allowed at the moment');
            // noinspection JSIgnoredPromiseFromCall
            alertSound.play();
            return;
        }
        
        if (!products || products.length === 0) {
            console.log('Product barcode not processed because productsQuery.data is ' + products);
            return;
        }

        let product: Product | undefined = productByBarcode.get(e.value);
        let quantity = 1;
        
        if (!product && ProductBarcode.isUrl(e.value)) {
            product = products.find((product) => e.value.endsWith(product.id.toString()));
        }

        if (!product) {
            for (const [barcode, weightEncodedProduct] of productsWithWeightEncoding) {
                if (ProductBarcode.matches(barcode, e.value)) {
                    product = weightEncodedProduct;
                    quantity = ProductBarcode.getQuantity(barcode, e.value);
                    break;
                }
            }
        }
        
        if (product) {
            dispatch(changeCartQuantity({ product, quantity: quantity, source: 'scan' }));
        } else {
            console.log('No product found with barcode ' + e.value);
            // noinspection JSIgnoredPromiseFromCall
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
    
    function chooseCustomer(customer: Customer | null | undefined) {
        if (!customer) {
            throw new Error('Customer must not be null');
        }
        dispatch(setCustomer(customer));
        setShowDifferentCustomerLoggedIn(false);
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

    if (showDifferentCustomerLoggedIn) {
        return (
                <Dialog title="Jemand anderes kauft gerade ein" onBackdropClick={closeDialog}>
                    <div className={'p-4 flex-grow'}>
                        Mit wem möchtest du weiter einkaufen?
                    </div>
                    <div className={'p-4'}>
                        <Button type="primary" onClick={() => chooseCustomer(loggedInCustomer)}>{ formatCustomer(loggedInCustomer)  }</Button>
                        <Button type="primary" onClick={() => chooseCustomer(newCustomer)}>{ formatCustomer(newCustomer)  }</Button>
                    </div>
                </Dialog>
        )
    }

    return null;
}