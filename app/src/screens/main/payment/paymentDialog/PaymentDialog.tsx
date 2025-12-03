import { Dialog } from '../../../../components/modal/dialog/Dialog.tsx';
import { PaymentState } from '../../../../store/slices/paymentSlice.ts';
import { useAppSelector } from '../../../../store/store.ts';
import { SelectMemberDialog } from '../selectMemberDialog/SelectMemberDialog.tsx';
import { SelectPaymentMethodDialog } from '../selectPaymentMethodDialog/SelectPaymentMethodDialog.tsx';
import { PaymentSpinnerDialog } from '../paymentSpinnerDialog/PaymentSpinnerDialog.tsx';
import { formatPrice } from '../../../../format/formatPrice.ts';
import { Cart } from '../../../../store/api/cart/Cart.ts';
import { ProcessingPayrexxPayment } from '../processingPayrexxPayment/ProcessingPayrexxPayment.tsx';
import { ConfirmationDialog } from '../confirmationDialog/ConfirmationDialog.tsx';
import { ErrorDialog } from '../errorDialog/ErrorDialog.tsx';
import { CancellingPaymentDialog } from '../cancellingPaymentDialog/CancellingPaymentDialog.tsx';

export function PaymentDialog() {
    const payment: PaymentState = useAppSelector(state => state.payment);
    const cart: Cart = useAppSelector(state => state.cart.cart);
    
    let title = 'Bezahlen '+formatPrice(cart.price);
    let component = <p></p>;
    
    switch (payment.state) {
        case 'SelectPaymentRole':
            component = <SelectMemberDialog />
            break;
            
        case 'CreatingOrder':
            title = 'Bezahlen vorbereiten...';
            component = <PaymentSpinnerDialog />;
            break;
            
        case 'SelectPaymentMethod':
            component = <SelectPaymentMethodDialog />;
            break;

        case 'ProcessingPayrexxPayment':
            component = <ProcessingPayrexxPayment />;
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
            component = <ErrorDialog />
            break;
    }

    return (
            <Dialog title={title} onBackdropClick={() => {}} className={'size-7/8'}>
                {component}
            </Dialog>
    )
}