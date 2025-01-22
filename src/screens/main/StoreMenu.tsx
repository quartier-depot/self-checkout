import magnifier from "../../assets/magnifier.svg";
import empty from "../../assets/empty.svg";

export function StoreMenu() {

    // const productsQuery = useProducts();

    return (
        <>
            <div className={'flex flex-col bg-slate-50 h-full w-full py-4'}>
                <div className={'flex px-2 flex-row relative'}>
                    <div className={'absolute left-5 top-3 px-2 py-2 rounded-full bg-cyan-500 text-white'}>
                        <img src={magnifier} alt='magnifier' className={'h-6 w-6'}  />
                    </div>
                    <input
                        type="text"
                        className={'bg-white rounded-3xl shadow text-lg full w-full h-16 py-4 pl-16 transition-shadow focus:shadow-2xl focus:outline-none'}
                        placeholder="Cari menu ..."
                    />
                </div>
                <div className={'h-full overflow-hidden mt-4'}>
                    <div className={'h-full overflow-y-auto px-2'}>
                        <div
                            className={'select-none bg-slate-400 rounded-3xl flex flex-wrap content-center justify-center h-full opacity-25'}
                        >
                            <div className={'w-full text-center'}>
                                <img src={empty} alt="empty" className={'h-24 w-24 inline-block'}/>
                                <p className={'text-xl'}>
                                    YOU DON'T HAVE
                                    <br/>
                                    ANY PRODUCTS TO SHOW
                                </p>
                            </div>
                        </div>
                        <div
                            className={'select-none bg-slate-400 rounded-3xl flex flex-wrap content-center justify-center h-full opacity-25'}
                        >
                            <div className={'w-full text-center'}>
                                <img src={magnifier} alt="magnifier" className={'h-24 w-24 inline-block'}/>

                                <p className={'text-xl'}>
                                    EMPTY SEARCH RESULT
                                    <br/>
                                    "<span className={'font-semibold'}></span>"
                                </p>
                            </div>
                        </div>
                        <div className={'grid grid-cols-4 gap-4 pb-3'}>
                            <div
                                role="button"
                                className={'select-none cursor-pointer transition-shadow overflow-hidden rounded-2xl bg-white shadow hover:shadow-lg'}
                            >
                                <div className={'flex pb-3 px-3 text-sm -mt-3'}>
                                    <p className={'flex-grow truncate mr-1'}></p>
                                    <p className={'nowrap font-semibold'}></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>)
}
