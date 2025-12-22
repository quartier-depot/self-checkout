import { Dialog } from '../../../../components/modal/dialog/Dialog.tsx';
import { PaymentState } from '../../../../store/slices/sessionSlice.ts';
import { useAppSelector } from '../../../../store/store.ts';
import { SelectPaymentMethodDialog } from '../selectPaymentMethodDialog/SelectPaymentMethodDialog.tsx';
import { PaymentSpinnerDialog } from '../paymentSpinnerDialog/PaymentSpinnerDialog.tsx';
import { formatPrice } from '../../../../format/formatPrice.ts';
import { Cart } from '../../../../store/api/Cart.ts';
import { ConfirmationDialog } from '../confirmationDialog/ConfirmationDialog.tsx';
import { FailureDialog } from '../failureDialog/FailureDialog';
import { CancellingPaymentDialog } from '../cancellingPaymentDialog/CancellingPaymentDialog.tsx';
import { ProcessingPayrexxPaymentDialog } from '../processingPayrexxPaymentDialog/ProcessingPayrexxPaymentDialog.tsx';

export function PaymentDialog() {
    const payment: PaymentState = useAppSelector(state => state.session.session.payment);
    const cart: Cart = useAppSelector(state => state.cart.cart);
    
    let title = 'Bezahlen '+formatPrice(cart.price);
    let component = <PaymentSpinnerDialog />;
    
    switch (payment.state) {
        case 'CreatingOrder':
            title = 'Bezahlen vorbereiten...';
            break;
            
        case 'SelectPaymentMethod':
            component = <SelectPaymentMethodDialog />;
            break;
            
        case 'ProcessingPayrexxPayment':
            component = <ProcessingPayrexxPaymentDialog />;
            break;
            
        case 'CancellingPayment':
            title = 'Bezahlen abbrechen...';
            component = <CancellingPaymentDialog />;
            break;
            
        case 'Success': 
            title = 'Bezahlen erfolgreich';
            component = <ConfirmationDialog />
            break;
            
        case 'Failure':
            title = 'Bezahlen fehlgeschlagen';
            component = <FailureDialog />
            break;
    }

    return (
            <Dialog title={title} onBackdropClick={() => {}} className={'size-7/8'}>
                {component}
            </Dialog>
    )
}