import { Button } from "../../../../../components/button/Button";
import { useAppDispatch, useAppSelector } from "../../../../../store/store";
import { setViewMode, selectViewMode, setGestell } from "../../../../../store/slices/productsSlice";


export function Browse() {
    const dispatch = useAppDispatch();
    const viewMode = useAppSelector(selectViewMode);
    const isActive = viewMode === 'browse';

    function handleClick() {
        dispatch(setViewMode('browse'));
        dispatch(setGestell(''));
    }

    return (
        <Button type="secondary" onClick={handleClick} toggled={isActive}>
            Gestell
        </Button>
    );
}