import { useAppDispatch } from '../../../../store/store.ts';
import { PaymentSpinnerDialog } from '../paymentSpinnerDialog/PaymentSpinnerDialog.tsx';
import { noPayment } from '../../../../store/slices/paymentSlice.ts';

export function CancellingPaymentDialog() {
    const dispatch = useAppDispatch();
    
    setTimeout(() => handleCancel(), 100);

    function handleCancel() {
        dispatch(noPayment());
    }

    return (
            <PaymentSpinnerDialog />
    );
} 