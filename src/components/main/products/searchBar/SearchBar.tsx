import magnifier from "../../../../assets/magnifier.svg";

export function SearchBar() {
    return (
        <div className={'flex px-2 flex-row relative'}>
            <div className={'absolute left-5 top-3 px-2 py-2 rounded-full bg-cyan-500 text-white'}>
                <img src={magnifier} alt='magnifier' className={'h-6 w-6'}/>
            </div>
            <input
                type="text"
                className={'bg-white rounded-3xl shadow text-lg full w-full h-16 py-4 pl-16 transition-shadow focus:shadow-2xl focus:outline-none'}
                placeholder="Cari menu ..."
            />
        </div>
    )
}