import { Dialog } from '../../../../components/modal/dialog/Dialog.tsx';
import { PaymentStates } from '../../../../store/slices/paymentSlice.ts';
import { useAppSelector } from '../../../../store/store.ts';
import { SelectMemberDialog } from '../selectMemberDialog/SelectMemberDialog.tsx';
import { CancellingPaymentDialog } from '../canellingPaymentDialog/CancellingPaymentDialog.tsx';
import { SelectPaymentMethodDialog } from '../selectPaymentMethodDialog/SelectPaymentMethodDialog.tsx';
import { CreatingOrderDialog } from '../creatingOrderDialog/CreatingOrderDialog.tsx';

export function PaymentDialog2() {
    const paymentState: PaymentStates = useAppSelector(state => state.payment.state);
    
    let title = 'Bezahlvorgang';
    let component = <p>aoin</p>;
    
    switch (paymentState) {
        case 'SelectPaymentRole':
            title = 'Bezahlen...';
            component = <SelectMemberDialog />
            break;
            
        case 'CreatingOrder':
            title = 'Bezahlvorgang vorbereiten... (CreatingOrder)';
            component = <CreatingOrderDialog />;
            break;
            
        case 'SelectPaymentMethod':
            title = 'Bezahlvorgang';
            component = <SelectPaymentMethodDialog />;
            break;
            
            
        case 'TopUpWallet':
            title = 'Kontostand aufladen';
            break;
            
        case 'ProcessingWalletPayment': 
            break;
            
        case 'ProcessingPayrexxPayment': 
            break;
            
        case 'CancellingPayment':
            title = 'Bezahlvorgang abbrechen...';
            component = <CancellingPaymentDialog />;
            break;
            
        case 'Success': 
            title = 'Einkauf erfolgreich';
            break;
            
        case 'Failure':
            title = 'Bezahlvorgang fehlgeschlagen';
            break;
    }

    return (
            <Dialog title={title} onBackdropClick={() => {}} className={'size-7/8'}>
                {component}
            </Dialog>
    )
}