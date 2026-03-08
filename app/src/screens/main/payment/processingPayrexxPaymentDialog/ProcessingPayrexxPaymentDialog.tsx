import { useAppDispatch, useAppSelector } from '../../../../store/store.ts';
import { useGetOrderQuery } from '../../../../store/api/woocommerceApi/woocommerceApi';
import { useEffect } from 'react';
import { setTransactionId, showFailure, showSuccess } from '../../../../store/slices/sessionSlice.ts';
import { formatPrice } from '../../../../format/formatPrice.ts';
import { Spinner } from '../../../../components/spinner/Spinner.tsx';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';

export function ProcessingPayrexxPaymentDialog() {
    const dispatch = useAppDispatch();
    const payment = useAppSelector(state => state.session.session.payment);
    const order = useGetOrderQuery(payment.orderId!, { pollingInterval: 3000, skip: !payment.orderId });
    const customer = useAppSelector(state => state.customer.customer);
    const applicationInsights = useAppInsightsContext();

    useEffect(() => {
        if (order.isSuccess) {
            dispatch(setTransactionId({ transactionId: order.data.transactionId }));
            let trackName = 'neither-success-nor-failure';
            switch(order.data.orderStatus) {
                case 'completed':
                    dispatch(showSuccess());
                    trackName = 'success';
                    break;
                case 'cancelled':
                    dispatch(showFailure());
                    trackName = 'failure';
                    break;
            }

            applicationInsights.getAppInsights().trackEvent({ name: trackName }, {
                customer: customer?.id,
                orderId: order.data.orderId,
                transactionId: order.data.transactionId,
                paymentMethod: "payrexx",
            });

            return;
        }
    }, [order, dispatch]);

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