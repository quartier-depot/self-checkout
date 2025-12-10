import { formatPrice } from '../../../format/formatPrice';
import { Button } from '../../../components/button/Button';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { PaymentDialog } from './paymentDialog/PaymentDialog.tsx';
import {
    selectPaymentMethod,
    createOrder as setCreateOrder,
    setOrder,
    showFailure, PaymentState
} from '../../../store/slices/sessionSlice';
import { useCreateOrderMutation } from '../../../store/api/api.ts';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { useState } from 'react';
import { MemberDialog } from '../../../components/modal/dialog/memberDialog/MemberDialog.tsx';


export function Payment() {
    const dispatch = useAppDispatch();
    const applicationInsights = useAppInsightsContext();
    const cart = useAppSelector(state => state.cart.cart);
    const customer = useAppSelector(state => state.customer.customer);
    const payment: PaymentState = useAppSelector(state => state.session.session.payment);
    const [createOrder ] = useCreateOrderMutation();
    const [showMemberDialog, setShowMemberDialog] = useState(false);
    
    async function handleClick() {
        if (!customer) {
            setShowMemberDialog(true);
            return;
        }

        if (cart.price <= 0) {
            return;
        }
        
        try {
            dispatch(setCreateOrder());

            const { orderId, orderTotal } = await createOrder({
                customer: customer,
                cart: cart
            }).unwrap();

            dispatch(setOrder({ orderId, orderTotal }));
            dispatch(selectPaymentMethod());
        } catch (error: any) {
            applicationInsights.getAppInsights().trackException({
                exception: error as Error,
                properties: { ...payment}
            });
            dispatch(showFailure());
        }
    }

    const paymentEnabled = cart.price > 0 && customer;
    const showPaymentDialog = payment.state !== 'NoPayment';
    
    return (
            <>
                <div className={'w-full text-center mt-2 '}>
                    <div className={'flex font-mono'}>
                        <div>TOTAL</div>
                        <div className={'text-right w-full text-xl'}>{formatPrice(cart.price)} CHF</div>
                    </div>
                    <Button disabled={!paymentEnabled} withDisabledLock={true} onClick={handleClick} type={'primary'}>
                        Bezahlen
                    </Button>
                </div>

                {showPaymentDialog && <PaymentDialog />}

                {showMemberDialog && <MemberDialog onClose={() => setShowMemberDialog(false)} /> }
            </>
    );
}
