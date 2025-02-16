import cart from '../../../assets/cart.svg';
import { useAppContext } from '../../../context/useAppContext';
import { Item } from './Item';


export function Cart() {
  const { state } = useAppContext();

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
                <col className="w-[45px]" /> { /* 500 */ }
                <col className="truncate" />
                <col className="w-1/6" /> { /* 111.11 */ }
              </colgroup>
              <tbody>

            {state.cart.items.map((item) => (
              <Item key={item.product.id} item={item} />
            ))}
              </tbody>
          </table>
        </div>
    </>
  );
}
