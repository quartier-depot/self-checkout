import { useAppDispatch, useAppSelector } from '../../../../store/store.ts';
import { PaymentSpinnerDialog } from '../paymentSpinnerDialog/PaymentSpinnerDialog.tsx';
import {  useGetOrderQuery } from '../../../../store/api/api.ts';
import { useEffect, useState } from 'react';
import { setTransactionId, showSuccess } from '../../../../store/slices/sessionSlice.ts';
import { useSearchParams } from 'react-router';
import { ProcessingPaymentFailed } from './ProcessingPayrexxPaymentFailed.tsx';

export function ProcessingPayrexxPayment() {
    const dispatch = useAppDispatch();
    const payment = useAppSelector(state => state.session.session.payment);
    const order = useGetOrderQuery(payment.orderId || "200", { pollingInterval: 3000});
    const [searchParams, _] = useSearchParams();
    const [paymentFailed, setPaymentFailed] = useState(false);

    useEffect(() => {
        if (searchParams.get('payrexx') === 'failure') {
            setPaymentFailed(true);
        }
        if (order.isSuccess && order.data.orderStatus === 'completed') {
            dispatch(setTransactionId({ transactionId: order.data.transactionId }));
            dispatch(showSuccess());
            return;
        }
    }, [order, dispatch, searchParams]);
    
    return <>
        {!paymentFailed && <PaymentSpinnerDialog />}
        {paymentFailed && <ProcessingPaymentFailed />}
    </>;
}