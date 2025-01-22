import thumbsUp from "../../assets/thumbs-up.svg";

export function PaymentInfo() {
    return (
        <>
            <div className={'select-none h-auto w-full text-center pt-3 pb-4 px-4'}>
                <div className={'flex mb-3 text-lg font-semibold text-blue-gray-700'}>
                    <div>TOTAL</div>
                    <div className={'text-right w-full'}></div>
                </div>
                <div className={'mb-3 text-blue-gray-700 px-3 pt-2 pb-3 rounded-lg bg-blue-gray-50'}>
                    <div className={'flex text-lg font-semibold'}>
                        <div className={'flex-grow text-left'}>CASH</div>
                        <div className={'flex text-right'}>
                            <div className={'mr-2'}>Rp</div>
                            <input type="text"
                                   className={'w-28 text-right bg-white shadow rounded-lg focus:bg-white focus:shadow-lg px-2 focus:outline-none'}/>
                        </div>
                    </div>
                    <hr className={'my-2'}/>
                    <div className={'grid grid-cols-3 gap-2 mt-2'}>
                            <button
                                className={'bg-white rounded-lg shadow hover:shadow-lg focus:outline-none inline-block px-2 py-1 text-sm'}>+<span
                                ></span></button>
                    </div>
                </div>
                <div
                    className={'flex mb-3 text-lg font-semibold bg-cyan-50 text-blue-gray-700 rounded-lg py-2 px-3'}
                >
                    <div className={'text-cyan-800'}>CHANGE</div>
                    <div
                        className={'text-right flex-grow text-cyan-600'}>
                    </div>
                </div>
                <div
                    className={'flex mb-3 text-lg font-semibold bg-pink-100 text-blue-gray-700 rounded-lg py-2 px-3'}
                >
                    <div
                        className={'text-right flex-grow text-pink-600'}
                    >
                    </div>
                </div>
                <div
                    className={'flex justify-center mb-3 text-lg font-semibold bg-cyan-50 text-cyan-700 rounded-lg py-2 px-3'}
                >
                    <img alt='thumbs up' src={thumbsUp} className={'h-6 w-6 inline-block'} />
                </div>
                <button
                    className={'text-white rounded-2xl text-lg w-full py-3 focus:outline-none'}>
                    SUBMIT
                </button>
            </div>
        </>
    )
}