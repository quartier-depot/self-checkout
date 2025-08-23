import { useEffect, useState } from 'react';
import { CartItem as ItemType } from '../../../store/api/cart/Cart';
import cartIcon from '../../../assets/cart.svg';
import { CartItem } from './CartItem.tsx';
import { NumPad } from './numPad/NumPad';
import { Dialog } from '../../../components/modal/dialog/Dialog';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { setCartQuantity } from '../../../store/slices/cartSlice';
import Scrollbar from '../../../components/scrollbar/Scrollbar';
import { removeBulkItem } from '../../../store/slices/bulkItemSlice.ts';
import { ResetDialog } from '../../../components/modal/dialog/resetDialog/ResetDialog.tsx';
import { Badge } from '../../../components/badge/Badge.tsx';

export function Cart() {
    const dispatch = useAppDispatch();
    const cart = useAppSelector(state => state.cart.cart);
    const bulkItem = useAppSelector(state => state.bulkItem.bulkItem);
    const session = useAppSelector(state => state.session.session);
    const applicationInsights = useAppInsightsContext();
    
    const [dialogItem, setDialogItem] = useState<ItemType | null>();
    const [showCartDialog, setShowCartDialog] = useState(false);

    useEffect(() => {
        if (session.initialState) {
            setShowCartDialog(false);
            setDialogItem(null);
        }
    }, [session.initialState]);
    
    useEffect(() => {
        if (bulkItem) {
            const quantity = cart.items.find(item => item.product.id === bulkItem.id)?.quantity || 0;
            setDialogItem({product: bulkItem, quantity});
        }
    }, [bulkItem])
    
    function openDialog(item: ItemType): void {
        setDialogItem(item);
    }

    function closeDialog(quantity: number): void {
        if (!bulkItem || (bulkItem && quantity > 0)) {
            dispatch(setCartQuantity({ product: dialogItem!.product, quantity }));
        }
        dispatch(removeBulkItem());
        setDialogItem(null);
    }

    function reportError(item: ItemType): void {
        applicationInsights.getAppInsights().trackEvent({ name: 'product-error' }, { location: 'cart', product: item.product.artikel_id });
    }

    return (
        <>
            <div className={'text-left flex'}>
                <div className={'pl-2 pt-1 pb-2 relative'}>
                    <img src={cartIcon} alt="cart" className={'h-6 inline-block'} />
                    <Badge className={'absolute top-0 left-5'}>{cart.quantity}</Badge>
                </div>
            </div>

            <Scrollbar className="flex-1 font-mono">
                <table className={'table-fixed w-full select-none'}>
                    <colgroup>
                        <col className="w-[25px]" />
                        <col className="w-[45px]" />
                        <col className="truncate" />
                        <col className="w-[60px]" />
                    </colgroup>
                    <tbody>
                        {cart.items.map((item) => (
                            <CartItem key={item.product.id} item={item} onClick={() => openDialog(item)} />
                        ))}
                    </tbody>
                </table>
            </Scrollbar>

            {dialogItem && <Dialog><NumPad
                text={dialogItem.product.name}
                value={dialogItem.quantity}
                unit={dialogItem.product.unit}
                onChange={(quantity) => closeDialog(quantity)}
                onReportError={() => reportError(dialogItem)} />
            </Dialog>}

            {showCartDialog && <ResetDialog onClose={() => setShowCartDialog(false)} />}
        </>
    );
}
