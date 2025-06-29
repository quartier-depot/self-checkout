import { useState } from "react";
import { Button } from "../../../../../components/button/Button";
import { Dialog } from "../../../../../components/modal/dialog/Dialog";
import { SearchPad } from "./searchPad/SearchPad";
import { useAppDispatch, useAppSelector } from "../../../../../store/store";
import { setSearchTerm, selectViewMode, setViewMode } from "../../../../../store/slices/productsSlice";


export function Search() {
    const dispatch = useAppDispatch();
    const viewMode = useAppSelector(selectViewMode);
    const [dialogOpen, setDialogOpen] = useState(false);
    const isActive = viewMode === 'search';

    function handleClick() {
        dispatch(setViewMode('search'));
        setDialogOpen(!dialogOpen);
    }

    function handleSearch(value: string) {  
        setDialogOpen(false);
        dispatch(setSearchTerm(value));
    }   

    function handleChange(value: string) {
        dispatch(setSearchTerm(value));
    }

    return (
        <>
            <Button type="secondary" onClick={handleClick} toggled={isActive}>
                Nummer
            </Button>

            {isActive && dialogOpen && <Dialog onBackdropClick={() => setDialogOpen(false)}><SearchPad onChange={handleChange} onSearch={handleSearch} onCancel={() => setDialogOpen(false)} /></Dialog>}
        </>
    );
}