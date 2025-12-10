import { useAppDispatch, useAppSelector } from '../../../../store/store.ts';
import { PaymentSpinnerDialog } from '../paymentSpinnerDialog/PaymentSpinnerDialog.tsx';
import { useGetOrderQuery } from '../../../../store/api/api.ts';
import { useEffect } from 'react';
import { setTransactionId, showFailure, showSuccess } from '../../../../store/slices/sessionSlice.ts';
import { useSearchParams } from 'react-router';

export function ProcessingPayrexxPaymentDialog() {
    const dispatch = useAppDispatch();
    const payment = useAppSelector(state => state.session.session.payment);
    const order = useGetOrderQuery(payment.orderId || "200", { pollingInterval: 3000});
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get('payrexx') === 'failure') {
            setSearchParams({});
            dispatch(showFailure());
            return;
        }
        if (order.isSuccess && order.data.orderStatus === 'completed') {
            dispatch(setTransactionId({ transactionId: order.data.transactionId }));
            dispatch(showSuccess());
            return;
        }
    }, [order, dispatch, searchParams]);
    
    return <PaymentSpinnerDialog />
}