import {useCustomers} from "../../../api/customers/useCustomers.ts";
import {ActionTypes} from "../../../actions/actions.ts";
import {ChangeEvent} from "react";
import {useAppContext} from "../../../context/useAppContext.ts";
import {useWalletBalance} from "../../../api/wallet/useWalletBalance.ts";
import {formatPrice} from "../../../format/formatPrice.ts";

export function Wallet() {
    const {state, dispatch} = useAppContext();
    const customersQuery = useCustomers();
    const walletQuery = useWalletBalance(state.customer.email);

    return (
        <div
            className="flex mb-3 text-lg font-semibold bg-emerald-100 rounded-lg py-2 px-3">
            <div className="text-emerald-900">Virtuelles Konto
                <select onChange={(event: ChangeEvent<HTMLSelectElement>) => dispatch({
                        type: ActionTypes.SET_CUSTOMER,
                        payload: {
                            email: event.currentTarget.value
                        }
                    }
                )}
                >
                    {customersQuery.data!.map((item) => <option key={item.id}
                                                                value={item.email}>{item.first_name + " " + item.last_name}</option>)}
                </select>
            </div>
            <div className="text-right flex-grow ">{walletQuery.isSuccess && formatPrice(walletQuery.data)}</div>
        </div>
    )
}