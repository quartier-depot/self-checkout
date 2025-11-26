import { formatPrice } from '../../../format/formatPrice';
import { Button } from '../../../components/button/Button';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { PaymentDialog2 } from './paymentDialog/PaymentDialog2.tsx';
import {
    PaymentRoles,
    PaymentStates,
    selectPaymentMethod,
    selectPaymentRole,
        createOrder as setCreateOrder,
    setOrder,
    setPaymentRole
} from '../../../store/slices/paymentSlice';
import { useCreateOrderMutation } from '../../../store/api/api.ts';


export function Payment2() {
    const dispatch = useAppDispatch();
    const cart = useAppSelector(state => state.cart.cart);
    const customer = useAppSelector(state => state.customer.customer);
    const paymentState: PaymentStates = useAppSelector(state => state.payment.state);
    const [createOrder ] = useCreateOrderMutation();
    
    async function handleStartPayment() {
        if (cart.price <= 0 || !customer) {
            return;
        }

        dispatch(setCreateOrder());
        
        const { orderId, orderTotal } = await createOrder({
            customer: customer,
            cart: cart
        }).unwrap();
        
        dispatch(setOrder({orderId, orderTotal}));
        
        if (customer) {
            dispatch(setPaymentRole({paymentRole: PaymentRoles.customer}));
            dispatch(selectPaymentMethod());
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
                        Bezahlen
                    </Button>
                </div>

                {showPaymentDialog && <PaymentDialog2 />}
            </>
    );
}
