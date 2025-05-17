import { useState } from "react";
import { Button } from "../../../../../components/button/Button";
import { Dialog } from "../../../../../components/modal/dialog/Dialog";
import { SearchPad } from "./searchPad/SearchPad";
import { useAppDispatch } from "../../../../../store/store";
import { setSearchTerm } from "../../../../../store/slices/searchSlice";
import { setProducts } from "../../../../../store/slices/browseSlice";
import { useGetProductsQuery } from "../../../../../store/api/woocommerceApi";

type SearchProps = {
    active: boolean;
    onClick: () => void;
}

export function Search({ active, onClick}: SearchProps) {
    const { data: products } = useGetProductsQuery();
    const dispatch = useAppDispatch();

    const [dialogOpen, setDialogOpen] = useState(false);

    function handleClick() {
        setDialogOpen(!dialogOpen);
        onClick();
    }

    function handleSearch(value: string) {  
        setDialogOpen(false);
        dispatch(setSearchTerm(value));
        dispatch(setProducts(products || []));
    }   

    return (
        <>
            <Button type="secondary" onClick={handleClick} toggled={active}>
                Nummer
            </Button>

            {active && dialogOpen && <Dialog onBackdropClick={() => setDialogOpen(false)}><SearchPad onSearch={handleSearch} /></Dialog>}
        </>
    );
}