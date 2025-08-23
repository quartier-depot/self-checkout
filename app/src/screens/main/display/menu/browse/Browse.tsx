import { Button } from "../../../../../components/button/Button";
import { useAppDispatch, useAppSelector } from "../../../../../store/store";
import { setViewMode, selectViewMode, setCategory } from "../../../../../store/slices/displaySlice.ts";


export function Browse() {
    const dispatch = useAppDispatch();
    const viewMode = useAppSelector(selectViewMode);
    const isActive = viewMode === 'browse';

    function handleClick() {
        dispatch(setViewMode('browse'));
        dispatch(setCategory(''));
    }

    return (
        <Button type="secondary" onClick={handleClick} toggled={isActive} withDisabledLock={true}>
            kein Barcode
        </Button>
    );
}