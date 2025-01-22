import {useAppContext} from "../../../context/useAppContext.ts";

export function Payment() {
    const {state} = useAppContext();

    return (
        <>
            <div className={'select-none h-auto w-full text-center pt-3 pb-4 px-4'}>
                <div className={'flex mb-3 text-lg font-semibold text-blue-gray-700'}>
                    <div>TOTAL</div>
                    <div className={'text-right w-full'}>{state.cart.price}</div>
                </div>
                <button
                    className={'text-white rounded-2xl text-lg w-full py-3 focus:outline-none bg-emerald-700'}>
                    WEITER
                </button>
            </div>
        </>
    )
}