import { useAppContext } from '../../../context/useAppContext';
import { useWalletBalance } from '../../../api/wallet/useWalletBalance';
import { formatPrice } from '../../../format/formatPrice';

export function Wallet() {
  const { state } = useAppContext();
  const walletQuery = useWalletBalance(state.customer?.email);
  const loggedIn = Boolean(state.customer);
  const name = loggedIn ? `${state.customer?.first_name} ${state.customer?.last_name}` : 'Bitte einloggen';

  return (
    <div className="flex h-16 bg-white rounded-3xl p-4 w-full shadow">
      <div>
        {name}
      </div>
      <div className="text-right flex-grow ">
        {loggedIn && walletQuery.isSuccess && formatPrice(walletQuery.data)}
      </div>
    </div>
  );
}
