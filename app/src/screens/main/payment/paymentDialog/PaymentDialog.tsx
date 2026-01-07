import { Dialog } from '../../../../components/modal/dialog/Dialog.tsx';
import { PaymentState } from '../../../../store/slices/sessionSlice.ts';
import { useAppSelector } from '../../../../store/store.ts';
import { ConfirmationDialog } from '../confirmationDialog/ConfirmationDialog.tsx';
import { FailureDialog } from '../failureDialog/FailureDialog';
import { ProcessingPayrexxPaymentDialog } from '../processingPayrexxPaymentDialog/ProcessingPayrexxPaymentDialog.tsx';
import { CreatingOrderDialog } from '../creatingOrderDialog/CreatingOrderDialog.tsx';
import { ProcessingWalletPaymentDialog } from '../processingWalletPaymentDialog/ProcessingWalletPaymentDialog.tsx';

export function PaymentDialog() {
    const payment: PaymentState = useAppSelector(state => state.session.session.payment);
    
    let title = 'Bezahlung';
    let component = <p />;
    
    switch (payment.state) {
        case 'CreatingOrder':
            component = <CreatingOrderDialog />;
            break;
            
        case 'ProcessingPayrexxPayment':
            component = <ProcessingPayrexxPaymentDialog />;
            break;

        case 'ProcessingWalletPayment':
            component = <ProcessingWalletPaymentDialog />;
            break;
            
        case 'Success': 
            title = 'Bezahlung erfolgreich';
            component = <ConfirmationDialog />
            break;
            
        case 'Failure':
            title = 'Bezahlung fehlgeschlagen';
            component = <FailureDialog />
            break;
    }

    return (
            <Dialog title={title} onBackdropClick={() => {}} className={'size-7/8'}>
                {component}
            </Dialog>
    )
}