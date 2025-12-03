import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../../../components/button/Button';
import { useAppDispatch, useAppSelector } from '../../../../store/store.ts';
import { cancel, PaymentRoles, selectPaymentMethod, setPaymentRole } from '../../../../store/slices/sessionSlice.ts';
import { useEffect } from 'react';

export function SelectMemberDialog() {
    const dispatch = useAppDispatch();
    const customer = useAppSelector(state => state.customer.customer);

    useEffect(() => {
        if (customer) {
            dispatch(setPaymentRole({paymentRole: PaymentRoles.customer}));
            dispatch(selectPaymentMethod());
        }
    }, [customer, dispatch]);

    function handleAsGuest() {
        dispatch(setPaymentRole({paymentRole: PaymentRoles.guest}));
        dispatch(selectPaymentMethod());
    }

    function handleCancel() {
        dispatch(cancel());
    }

    return (
            <>
                <div className={'flex-1 grid grid-cols-2 grid-rows-1 gap-4 overflow-y-auto'}>
                    <div className={'p-4 border-r border-gray-300'}>
                        <h2 className={'font-semibold'}>Als Mitglied einkaufen</h2>
                        <ol className={'py-8 p-4 list-decimal'}>
                            <li>Scanne den QR-Code unten mit deinem Smartphone.</li>
                            <li>Scanne den Barcode auf deinem Smartphone mit der Kasse.</li>
                        </ol>
                        <div className={'flex justify-center justify-left items-center mt-2'}>
                            <QRCodeSVG value="https://webshop.quartier-depot.ch/mein-konto/memberid"
                                       className="h-72 w-72" />
                        </div>
                    </div>
                    <div className={'p-4'}>
                        <h2 className={'font-semibold'}>Als Gast einkaufen</h2>
                        <p className={'py-8 list-decimal'}>
                            Du kannst auch als Gast einkaufen.<br />
                            Deine Einkäufe werden nicht mit deinem Konto verknüpft.
                        </p>
                        <div className={'flex justify-center justify-left items-center'}>
                            <div className="w-72">
                                <Button type="primary" onClick={handleAsGuest}>Als Gast einkaufen</Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={'p-4'}>
                    <Button type="secondary" onClick={handleCancel}>Abbrechen</Button>
                </div>
            </>

    );
} 