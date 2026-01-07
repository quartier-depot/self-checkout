import { useAppDispatch, useAppSelector } from '../../../../store/store.ts';
import { useGetOrderQuery } from '../../../../store/api/woocommerceApi/woocommerceApi';
import { useEffect } from 'react';
import { setTransactionId, showFailure, showSuccess } from '../../../../store/slices/sessionSlice.ts';
import { useSearchParams } from 'react-router';
import { formatPrice } from '../../../../format/formatPrice.ts';
import { Spinner } from '../../../../components/spinner/Spinner.tsx';

export function ProcessingPayrexxPaymentDialog() {
    const dispatch = useAppDispatch();
    const payment = useAppSelector(state => state.session.session.payment);
    const order = useGetOrderQuery(payment.orderId || '200', { pollingInterval: 3000 });
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get('payrexx') === 'failure') {
            setSearchParams({});
            dispatch(showFailure());
            return;
        }
        if (order.isSuccess && order.data.orderStatus === 'completed') {
            dispatch(setTransactionId({ transactionId: order.data.transactionId }));
            dispatch(showSuccess());
            return;
        }
    }, [order, dispatch, searchParams]);

    return (
            <>
                <div className={'flex-1 grid grid-cols-2 grid-rows-1 gap-4 overflow-y-auto'}>
                    <div className={'p-4 border-r border-gray-300'}>
                        <div className={'grid grid-cols-2 gap-2 my-4'}>
                            <div>Betrag:</div>
                            <span className="text-right">{formatPrice(payment.orderTotal)} CHF</span>
                            <div>Bestellnummer:</div>
                            <span className="text-right">{payment.orderId}</span>
                            <div>Bezahlt mit:</div>
                            <span className="text-right">Twint</span>
                            <div>Twint Gebühren:</div>
                            <span className="text-right">{formatPrice(payment.charges)} CHF</span>
                            <div>Transaktionsnummer:</div>
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