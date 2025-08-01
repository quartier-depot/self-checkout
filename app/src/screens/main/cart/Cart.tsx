import { useEffect, useState } from 'react';
import { Item as ItemType } from '../../../store/api/cart/Cart';
import cartIcon from '../../../assets/cart.svg';
import { Item } from './Item';
import { NumPad } from './numPad/NumPad';
import { Dialog } from '../../../components/modal/dialog/Dialog';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { setCartQuantity } from '../../../store/slices/cartSlice';
import Scrollbar from '../../../components/scrollbar/Scrollbar';
import { removeBulkItem } from '../../../store/slices/bulkItemSlice.ts';
import { ResetDialog } from '../../../components/modal/dialog/resetDialog/ResetDialog.tsx';

export function Cart() {
    const dispatch = useAppDispatch();
    const cart = useAppSelector(state => state.cart.cart);
    const bulkItem = useAppSelector(state => state.bulkItem.bulkItem);
    const applicationInsights = useAppInsightsContext();
    
    const [dialogItem, setDialogItem] = useState<ItemType | null>();
    const [showCartDialog, setShowCartDialog] = useState(false);
    
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
        if (!bulkItem || (bulkItem && quantity >= 0)) {
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

            {showCartDialog && <ResetDialog onClose={() => setShowCartDialog(false)} />}
        </>
    );
}
