import { formatPrice } from '../../../../format/formatPrice';
import { Cart } from '../../../../store/api/Cart';
import { Spinner } from '../../../../components/spinner/Spinner';
import { useAppSelector } from '../../../../store/store';

export function CreatingOrderDialog() {
    const cart: Cart = useAppSelector(state => state.cart.cart);
    
    return (
            <>
                <div className={'flex-1 grid grid-cols-2 grid-rows-1 gap-4 overflow-y-auto'}>
                    <div className={'p-4 border-r border-gray-300'}>
                        <div className={'grid grid-cols-2 gap-2 my-4'}>
                            <div>Betrag:</div>
                            <span className="text-right">{formatPrice(cart.price)} CHF</span>
                            <div>Bestellnummer:</div>
                            <span className="text-right"><Spinner className={'ml-2 h-4 w-4 inline-block'} /></span>
                        </div>
                    </div>
                    <div className={'p-4 flex justify-center items-center'}>
                        <Spinner className={'w-72 h-72'} />
                    </div>
                </div>
            </>
    );
}