import {EmptySearch} from "./EmptySearch.tsx";

export function SearchResults() {
    return (
        <>
            <div className={'h-full overflow-hidden mt-4'}>
                <div className={'h-full overflow-y-auto px-2'}>
                    <EmptySearch/>
                    { /*
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
                    */}
                </div>
            </div>
        </>
    )
}