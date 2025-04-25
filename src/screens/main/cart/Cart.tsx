import { useState } from 'react';
import { Item as ItemType } from '../../../api/orders/Cart';
import cart from '../../../assets/cart.svg';
import { useAppContext } from '../../../context/useAppContext';
import { Item } from './Item';
import { Numpad } from '../../../components/numpad/Numpad';
import { Dialog } from '../../../components/modal/dialog/Dialog';
import { setCartQuantity } from '../../../state/cart/setCartQuantity';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';

export function Cart() {
    const { state } = useAppContext();
    const { dispatch } = useAppContext();
    const applicationInsights = useAppInsightsContext();

    const [dialogItem, setDialogItem] = useState<ItemType | null>(null);

    function openDialog(item: ItemType): void {
        setDialogItem(item);
    }

    function closeDialog(quantity: number): void {
        dispatch(setCartQuantity(quantity, dialogItem!.product));
        setDialogItem(null);
    }

    function reportError(item: ItemType): void {
        applicationInsights.getAppInsights().trackEvent({ name: 'product-error' }, { location: 'cart', product: item.product.artikel_id });
    }

    return (
        <>
            <div className={'h-12 text-left flex'}>
                <div className={'pl-2 py-2 relative'}>
                    <img src={cart} alt="cart" className={'h-6 inline-block'} />
                    <div
                        className={
                            'text-center absolute bg-emerald-700 text-white w-5 h-5 text-xs p-0 leading-5 rounded-full -right-2 top-3'
                        }
                    >
                        {state.cart.quantity}
                    </div>
                </div>
            </div>

            <div className={'overflow-y-auto overflow-x-hidden flex-1 font-mono'}>
                <table className={'table-fixed w-full'}>

                    <colgroup>
                        <col className="w-[45px]" />
                        <col className="truncate" />
                        <col className="w-1/6" />
                    </colgroup>
                    <tbody>

                        {state.cart.items.map((item) => (
                            <Item key={item.product.id} item={item} onClick={() => openDialog(item)} />
                        ))}
                    </tbody>
                </table>
            </div>

            {dialogItem && <Dialog><Numpad
                text={dialogItem.product.name}
                value={dialogItem.quantity}
                onChange={(quantity) => closeDialog(quantity)}
                onReportError={() => reportError(dialogItem)} />
            </Dialog>}
        </>
    );
}
