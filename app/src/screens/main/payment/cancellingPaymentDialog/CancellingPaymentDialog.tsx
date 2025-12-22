import { useAppDispatch, useAppSelector } from '../../../../store/store.ts';
import { PaymentSpinnerDialog } from '../paymentSpinnerDialog/PaymentSpinnerDialog.tsx';
import { noPayment, PaymentState, setOrder } from '../../../../store/slices/sessionSlice';
import { useEffect } from 'react';
import { useDeleteOrderMutation } from '../../../../store/api/woocommerceApi/woocommerceApi';
import cartXIcon from '../../../../assets/cart-x.svg';

export function CancellingPaymentDialog() {
    const dispatch = useAppDispatch();
    const payment: PaymentState = useAppSelector(state => state.session.session.payment);
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