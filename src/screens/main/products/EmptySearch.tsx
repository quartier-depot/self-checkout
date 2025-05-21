import magnifier from '../../../assets/magnifier.svg';
import { selectSearchTerm } from '../../../store/slices/productsSlice';
import { useAppSelector } from '../../../store/store';

export function EmptySearch() {
    const searchTerm = useAppSelector(selectSearchTerm);

    return (
            <>
                <div
                        className={
                            'select-none bg-slate-200  flex flex-wrap content-center justify-center h-full opacity-50'
                        }
                >
                    <div className={'w-full text-center'}>
                        <img src={magnifier} alt="magnifier" className={'h-24 w-24 inline-block'} />

                        <p className={'text-xl'}>
                            KEINE ARTIKEL GEFUNDEN
                            <br />"<span className={'font-semibold'}>{searchTerm}</span>"
                        </p>
                    </div>
                </div>
            </>
    );
}
