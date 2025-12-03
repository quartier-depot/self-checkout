import { formatPrice } from '../../../format/formatPrice';
import { Button } from '../../../components/button/Button';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { PaymentDialog } from './paymentDialog/PaymentDialog.tsx';
import {
    PaymentRoles,
    selectPaymentMethod,
    selectPaymentRole,
    createOrder as setCreateOrder,
    setOrder,
    setPaymentRole, showFailure, PaymentState
} from '../../../store/slices/paymentSlice';
import { useCreateOrderMutation } from '../../../store/api/api.ts';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';


export function Payment() {
    const dispatch = useAppDispatch();
    const applicationInsights = useAppInsightsContext();
    const cart = useAppSelector(state => state.cart.cart);
    const customer = useAppSelector(state => state.customer.customer);
    const payment: PaymentState = useAppSelector(state => state.payment);
    const [createOrder ] = useCreateOrderMutation();
    
    async function handleStartPayment() {
        try {
            if (cart.price <= 0) {
                return;
            }

            dispatch(setCreateOrder());

            const { orderId, orderTotal } = await createOrder({
                customer: customer,
                cart: cart
            }).unwrap();

            dispatch(setOrder({ orderId, orderTotal }));

            if (customer) {
                dispatch(setPaymentRole({ paymentRole: PaymentRoles.customer }));
                dispatch(selectPaymentMethod());
            } else {
                dispatch(selectPaymentRole());
            }
        } catch (error: any) {
            applicationInsights.getAppInsights().trackException({
                exception: error as Error,
                properties: { ...payment}
            });
            dispatch(showFailure());
        }
    }

    const paymentEnabled = cart.price > 0;
    const showPaymentDialog = payment.state !== 'NoPayment';
    
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

                {showPaymentDialog && <PaymentDialog />}
            </>
    );
}
