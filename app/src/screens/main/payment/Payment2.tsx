import { formatPrice } from '../../../format/formatPrice';
import { Button } from '../../../components/button/Button';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { PaymentDialog2 } from './paymentDialog/PaymentDialog2.tsx';
import { createOrder, PaymentRoles, PaymentStates, selectPaymentRole } from '../../../store/slices/paymentSlice';

export function Payment2() {
    const dispatch = useAppDispatch();
    const cart = useAppSelector(state => state.cart.cart);
    const customer = useAppSelector(state => state.customer.customer);
    const paymentState: PaymentStates = useAppSelector(state => state.payment.state);
    
    function handleStartPayment() {
        if (cart.price <= 0) {
            return;
        }
        
        if (customer) {
            dispatch(createOrder({
                paymentRole: PaymentRoles.customer
            }));
        } else {
            dispatch(selectPaymentRole());
        }
    }

    const paymentEnabled = cart.price > 0;
    const showPaymentDialog = paymentState !== 'NoPayment';
    
    return (
            <>
                <div className={'w-full text-center mt-2 '}>
                    <div className={'flex font-mono'}>
                        <div>TOTAL</div>
                        <div className={'text-right w-full text-xl'}>{formatPrice(cart.price)} CHF</div>
                    </div>
                    <Button disabled={!paymentEnabled} withDisabledLock={true} onClick={handleStartPayment} type={'primary'}>
                        Bezahlen...
                    </Button>
                </div>

                {showPaymentDialog && <PaymentDialog2 />}
            </>
    );
}
