import {useAppContext} from "../../../context/useAppContext";
import {formatPrice} from "../../../format/formatPrice";
import {Wallet} from "./Wallet";
import {useWalletBalance} from "../../../api/wallet/useWalletBalance";
import classNames from "classnames";
import {useCreateOrder} from "../../../api/orders/useCreateOrder";
import {usePayWithWallet} from "../../../api/wallet/usePayWithWallet";
import {useUpdateOrder} from "../../../api/orders/useUpdateOrder";
import {ActionTypes} from "../../../actions/actions";
import {useState} from "react";
import {Loading} from "../../../components/modal/loading/Loading";

export function Payment() {
    const {state, dispatch} = useAppContext();
    const walletQuery = useWalletBalance(state.customer?.email);
    const [showModal, setShowModal] = useState(false);
    const paymentEnabled = walletQuery.isSuccess && walletQuery.data != undefined && walletQuery.data >= state.cart.price;

    const createOrderMutation = useCreateOrder();
    const payWithWalletMutation = usePayWithWallet();
    const updateOrderMutation = useUpdateOrder();


    async function handlePayment() {
        setShowModal(true);
        const {id, total} = await createOrderMutation.mutateAsync({customer: state.customer!, cart: state.cart});
        const walletTransactionId = await payWithWalletMutation.mutateAsync({customer: state.customer!, amount: total, note: `For self-checkout-order payment #${id}`});
        await updateOrderMutation.mutateAsync({id, payment_method: "wallet", payment_method_title: "Virtuelles Konto", status: "completed", transaction_id: walletTransactionId.toString()});
        dispatch({type: ActionTypes.START_NEW_ORDER});
        setShowModal(false);
    }

    return (
        <>
            <div className={'select-none h-auto w-full text-center pt-3 pb-4 px-4'}>
                <div className={'flex mb-3 text-lg font-semibold text-blue-gray-700'}>
                    <div>TOTAL</div>
                    <div className={'text-right w-full'}>CHF {formatPrice(state.cart.price)}</div>
                </div>
                <Wallet/>
                <button
                    disabled={!paymentEnabled}
                    onClick={handlePayment}
                    className={classNames('rounded-2xl text-lg w-full py-3 focus:outline-none bg-bg-emerald-700',
                        {'text-white bg-orange-900': !paymentEnabled},
                        {'text-white bg-emerald-700': paymentEnabled})}>
                    {paymentEnabled ? "BEZAHLEN" : "Nicht genügend Kredit"}
                </button>
            </div>

            {showModal && <Loading />}
        </>
    )
}
