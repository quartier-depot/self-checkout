import cart from "../../../../assets/cart.svg";
import trash from "../../../../assets/trash.svg";
import minus from "../../../../assets/minus.svg";
import plus from "../../../../assets/plus.svg";

export function Cart() {

    return (
        <>
            <div
                className={'flex-1 w-full p-4 opacity-25 select-none flex flex-col flex-wrap content-center justify-center'}>
                <img alt='cart' src={cart} className={'h-16 inline-block'}/>
                <p>
                    CART EMPTY
                </p>
            </div>

            <div className={'flex-1 flex flex-col overflow-auto'}>
                <div className={'h-16 text-center flex justify-center'}>
                    <div className={'pl-8 text-left text-lg py-4 relative'}>
                        <img src={cart} alt="cart" className={'h-6 inline-block'}/>
                        <div
                            className={'text-center absolute bg-cyan-500 text-white w-5 h-5 text-xs p-0 leading-5 rounded-full -right-2 top-3'}
                        ></div>
                    </div>
                    <div className={'flex-grow px-8 text-right text-lg py-4 relative'}>
                        <button
                            className={'text-blue-gray-300 hover:text-pink-500 focus:outline-none'}>
                            <img src={trash} alt="trash" className={'h-6 w-6 inline-block'}/>
                        </button>
                    </div>
                </div>

                <div className={'flex-1 w-full px-4 overflow-auto'}>
                    <div
                        className={'select-none mb-3 bg-blue-gray-50 rounded-lg w-full text-blue-gray-700 py-2 px-2 flex justify-center'}>
                        <div className={'flex-grow'}>
                            <h5 className={'text-sm'}></h5>
                            <p className={'text-xs block'}></p>
                        </div>
                        <div className={'py-1'}>
                            <div className={'w-28 grid grid-cols-3 gap-2 ml-2'}>
                                <button
                                    className={'rounded-lg text-center py-1 text-white bg-blue-gray-600 hover:bg-blue-gray-700 focus:outline-none'}>
                                    <img src={minus} alt={'line'} className={'h-6 w-3 inline-block'}/>
                                </button>
                                <input type="text"
                                       className={'bg-white rounded-lg text-center shadow focus:outline-none focus:shadow-lg text-sm'}/>
                                <button
                                    className={'rounded-lg text-center py-1 text-white bg-blue-gray-600 hover:bg-blue-gray-700 focus:outline-none'}>
                                    <img src={plus} alt='plus' className={'h-6 w-3 inline-block'}/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}