import { useAppDispatch, useAppSelector } from '../../../../store/store.ts';
import { PaymentSpinnerDialog } from '../paymentSpinnerDialog/PaymentSpinnerDialog.tsx';
import { noPayment, PaymentState, setOrder } from '../../../../store/slices/paymentSlice';
import { useEffect } from 'react';
import { useDeleteOrderMutation } from '../../../../store/api/api';
import cartXIcon from '../../../../assets/cart-x.svg';

export function CancellingPaymentDialog() {
    const dispatch = useAppDispatch();
    const payment: PaymentState = useAppSelector(state => state.payment);
    const [deleteOrder] = useDeleteOrderMutation();
    cartXIcon
    
    useEffect(() => {
        async function deleteOrderFunction() {
            if (payment.orderId) {
                await deleteOrder({ orderId: payment.orderId }).unwrap();
            }
            dispatch(setOrder({orderId: undefined, orderTotal: undefined}));
        }
        
        if (payment.orderId) {
            // noinspection JSIgnoredPromiseFromCall
            deleteOrderFunction();
        } else {
            dispatch(noPayment());
        }
    }, [payment])
    

    return (
            <PaymentSpinnerDialog />
    );
} 