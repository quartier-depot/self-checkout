import { useState } from 'react';
import { Item as ItemType } from '../../../store/api/cart/Cart';
import cartIcon from '../../../assets/cart.svg';
import { Item } from './Item';
import { NumPad } from './numPad/NumPad';
import { Dialog } from '../../../components/modal/dialog/Dialog';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { Button } from '../../../components/button/Button';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { setCartQuantity } from '../../../store/slices/cartSlice';
import { startNewSession } from '../../../store/slices/appSlice';
import Scrollbar from '../../../components/scrollbar/Scrollbar';

export function Cart() {
    const dispatch = useAppDispatch();
    const cart = useAppSelector(state => state.cart.cart);
    const applicationInsights = useAppInsightsContext();

    const [dialogItem, setDialogItem] = useState<ItemType | null>(null);
    const [showCartDialog, setShowCartDialog] = useState(false);

    function openDialog(item: ItemType): void {
        setDialogItem(item);
    }

    function closeDialog(quantity: number): void {
        dispatch(setCartQuantity({ product: dialogItem!.product, quantity }));
        setDialogItem(null);
    }

    function reportError(item: ItemType): void {
        applicationInsights.getAppInsights().trackEvent({ name: 'product-error' }, { location: 'cart', product: item.product.artikel_id });
    }

    function restartCart() {
        dispatch(startNewSession());
        setShowCartDialog(false);
    }

    function restartApplication() {
        window.location.reload();
    }

    return (
        <>
            <div className={'h-12 text-left flex'}>
                <div className={'pl-2 py-2 relative'}>
                    <img src={cartIcon} alt="cart" className={'h-6 inline-block'} />
                    <div
                        onClick={() => setShowCartDialog(true)}
                        className={
                            'text-center absolute bg-emerald-700 text-white w-5 h-5 text-xs p-0 leading-5 rounded-full -right-2 top-3 cursor-pointer'
                        }
                    >
                        {cart.quantity}
                    </div>
                </div>
            </div>

            <Scrollbar className="flex-1 font-mono">
                <table className={'table-fixed w-full select-none'}>
                    <colgroup>
                        <col className="w-[45px]" />
                        <col className="truncate" />
                        <col className="w-1/6" />
                    </colgroup>
                    <tbody>
                        {cart.items.map((item) => (
                            <Item key={item.product.id} item={item} onClick={() => openDialog(item)} />
                        ))}
                    </tbody>
                </table>
            </Scrollbar>

            {dialogItem && <Dialog><NumPad
                text={dialogItem.product.name}
                value={dialogItem.quantity}
                onChange={(quantity) => closeDialog(quantity)}
                onReportError={() => reportError(dialogItem)} />
            </Dialog>}

            {showCartDialog && (
                <Dialog title="Was möchtest du tun?" onBackdropClick={() => setShowCartDialog(false)}>
                    <div className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Button type="secondary" onClick={restartCart} className="aspect-square"><b>Einkauf</b> neu starten</Button>
                            <Button type="secondary" onClick={restartApplication} className="aspect-square"><b>Kasse</b> neu starten</Button>
                        </div>
                        <Button type="primary" onClick={() => setShowCartDialog(false)} className="mt-4">Abbrechen</Button>
                    </div>
                </Dialog>
            )}
        </>
    );
}
