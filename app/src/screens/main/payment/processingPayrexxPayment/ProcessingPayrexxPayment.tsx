import { useAppDispatch, useAppSelector } from '../../../../store/store.ts';
import { PaymentSpinnerDialog } from '../paymentSpinnerDialog/PaymentSpinnerDialog.tsx';
import { useGetOrderQuery } from '../../../../store/api/api.ts';
import { useEffect } from 'react';
import { showSuccess } from '../../../../store/slices/paymentSlice.ts';

export function ProcessingPayrexxPayment() {
    const dispatch = useAppDispatch();
    const payment = useAppSelector(state => state.payment);
    const order = useGetOrderQuery(payment.orderId || "200", { pollingInterval: 3000});

    useEffect(() => {
        if (order.isSuccess && order.data.orderStatus === 'completed') {
            dispatch(showSuccess());
            return;
        }
    }, [order, dispatch]);


    return <PaymentSpinnerDialog />;
}