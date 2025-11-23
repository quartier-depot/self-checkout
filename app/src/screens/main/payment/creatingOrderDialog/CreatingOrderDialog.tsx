import { useAppDispatch, useAppSelector } from '../../../../store/store.ts';
import { PaymentSpinnerDialog } from '../paymentSpinnerDialog/PaymentSpinnerDialog';
import { selectPaymentMethod } from '../../../../store/slices/paymentSlice';
import { useEffect } from 'react';
import { useCreateOrderMutation } from '../../../../store/api/api.ts';

export function CreatingOrderDialog() {
    const dispatch = useAppDispatch();
    const payment = useAppSelector(state => state.payment);
    const customer = useAppSelector(state => state.customer.customer);
    const cart = useAppSelector(state => state.cart.cart);
    const [createOrder] = useCreateOrderMutation();
    
    useEffect(() => {
        console.log('creating order');
        async function createOrderEffect() {
            if (customer && cart && payment && !payment.orderId) {
                const { orderId, orderTotal } = await createOrder({
                    customer: customer,
                    cart: cart
                }).unwrap();

                dispatch(selectPaymentMethod({ orderId, orderTotal }));
            }
        }

        // noinspection JSIgnoredPromiseFromCall
        createOrderEffect();
    });


    return (
            <PaymentSpinnerDialog />
    );
} 