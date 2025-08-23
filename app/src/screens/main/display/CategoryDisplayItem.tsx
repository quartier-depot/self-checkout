import { useAppDispatch } from '../../../store/store';
import { setCategory } from '../../../store/slices/displaySlice.ts';

interface CategoryDisplayItemProps {
     category: string
}

export function CategoryDisplayItem({ category}: CategoryDisplayItemProps) {
    const dispatch = useAppDispatch();  
    
    const identifier = category.substring(0, category.indexOf(' '));
    const title = category.substring(category.indexOf('-') + 1);
    return (
        <div
            role="button"
            className={
                'select-none cursor-pointer overflow-hidden rounded-lg bg-slate-50 p-2 text-center'
            }
            onClick={() => dispatch(setCategory(category))}
        >
            <h2 className={'text-xl font-bold truncate'}>{title}</h2>
            <p className={'grow truncate mr-1'}>{identifier}</p>
        </div>
    );
}