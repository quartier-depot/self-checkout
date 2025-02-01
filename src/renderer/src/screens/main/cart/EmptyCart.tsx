import cart from '*.svg';

export function EmptyCart() {
  return (
    <div
      className={
        'flex-1 w-full p-4 opacity-25 select-none flex flex-col flex-wrap content-center justify-center'
      }
    >
      <img alt="cart" src={cart} className={'h-16 inline-block'} />
      <p>CART EMPTY</p>
    </div>
  );
}
