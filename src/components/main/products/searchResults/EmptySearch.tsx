import magnifier from "../../../../assets/magnifier.svg";

export function EmptySearch() {
    return (
        <>
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
        </>
    )
}