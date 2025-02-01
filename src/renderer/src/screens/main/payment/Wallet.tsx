import { useAppContext } from '../../../context/useAppContext';
import { useWalletBalance } from '../../../api/wallet/useWalletBalance';
import { formatPrice } from '../../../format/formatPrice';

export function Wallet() {
  const { state } = useAppContext();
  const walletQuery = useWalletBalance(state.customer?.email);

  return (
    <div className="mb-3 bg-emerald-100 rounded-lg py-2 px-3">
      <div className="text-emerald-900 font-semibold text-left">Virtuelles Konto</div>
      <div className="flex">
        <div className="text-emerald-900">
          {state.customer?.first_name} {state.customer?.last_name}
        </div>
        <div className="text-right flex-grow ">
          {walletQuery.isSuccess && formatPrice(walletQuery.data)}
        </div>
      </div>
    </div>
  );
}
