import { Dialog } from '../../../../components/modal/dialog/Dialog.tsx';
import { PaymentState } from '../../../../store/slices/paymentSlice.ts';
import { useAppSelector } from '../../../../store/store.ts';
import { SelectMemberDialog } from '../selectMemberDialog/SelectMemberDialog.tsx';
import { CancellingPaymentDialog } from '../canellingPaymentDialog/CancellingPaymentDialog.tsx';
import { SelectPaymentMethodDialog } from '../selectPaymentMethodDialog/SelectPaymentMethodDialog.tsx';
import { PaymentSpinnerDialog } from '../paymentSpinnerDialog/PaymentSpinnerDialog.tsx';
import { ConfirmationDialog2 } from '../confirmationDialog/ConfirmationDialog2.tsx';
import { formatPrice } from '../../../../format/formatPrice.ts';
import { Cart } from '../../../../store/api/cart/Cart.ts';

export function PaymentDialog2() {
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
        case 'ProcessingWalletPayment':
            component = <PaymentSpinnerDialog />;
            break;
            
        case 'CancellingPayment':
            title = 'Bezahlen abbrechen...';
            component = <CancellingPaymentDialog />;
            break;
            
        case 'Success': 
            title = 'Bezahlen erfolgreich';
            component = <ConfirmationDialog2 />
            break;
            
        case 'Failure':
            title = 'Bezahlen fehlgeschlagen';
            break;
    }

    return (
            <Dialog title={title} onBackdropClick={() => {}} className={'size-7/8'}>
                {component}
            </Dialog>
    )
}