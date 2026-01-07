import {
    useGetProductsQuery,
    useGetCustomersQuery
} from '../../store/api/woocommerceApi/woocommerceApi';
import {
    useIsRestartQuery, useSetRestartedMutation
} from '../../store/api/restartApi/restartApi';
import {
    useCheckSignatureQuery
} from '../../store/api/payrexxApi/payrexxApi';
import { Cart } from './cart/Cart';
import { Payment } from './payment/Payment';
import { Loading } from '../../components/modal/loading/Loading';
import { Barcode } from './barcode/Barcode';
import { useInactivityTimer } from '../../hooks/useInactivityTimer.ts';
import { InactivityDialog } from '../../components/modal/dialog/inactivityDialog/InactivityDialog.tsx';
import { Display } from './display/Display.tsx';
import { useEffect } from 'react';
import { restartApplication } from '../../restartAplication.ts';

export function Main() {
    const { isSuccess: isProductsSuccess, isFetching: isProductsFetching } = useGetProductsQuery();
    const { isSuccess: isCustomersSuccess, isFetching: isCustomersFetching } = useGetCustomersQuery();
    const { isSuccess: isCheckSignatureSuccess, isFetching: isCheckSignatureFetching } = useCheckSignatureQuery();
    const { data: isRestartData, isFetching: isRestartFetching } = useIsRestartQuery();
    const [setRestartedMutation] = useSetRestartedMutation();
    
    useEffect(() => {
        if (isRestartData) {
            setRestartedMutation();
            // noinspection JSIgnoredPromiseFromCall
            restartApplication();
        }
    }, [isRestartData]);
    
    const loadingData = isProductsFetching || isCustomersFetching || isCheckSignatureFetching || isRestartFetching || !isProductsSuccess || !isCustomersSuccess || !isCheckSignatureSuccess;

    const { showInactivityDialog, resetTimer } = useInactivityTimer();

    return (
            <>
                <div className={'bg-slate-950 text-slate-950 h-screen flex flex-row hide-print'}>
                    <div className={'w-3/5 bg-slate-50 pb-2 pl-2 pr-2 flex flex-col'}>
                        <Display />
                    </div>
                    <div className={'w-2/5 flex flex-col'}>
                        <div className={'bg-slate-50 p-3 ml-3 mb-3 mt-0 mr-0 grow overflow-hidden' } >
                            <Cart />
                        </div>
                        <div className={'bg-slate-50 ml-3 mb-0 mt-0 mr-0 p-2 flex flex-col '}>
                            <Payment />
                        </div>
                    </div>
                </div>

                {loadingData && <Loading text={''} />}
                {showInactivityDialog && <InactivityDialog onConfirm={resetTimer} />}
                <Barcode />
            </>
    );
}