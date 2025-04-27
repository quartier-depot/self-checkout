import { useState } from "react";
import { Button } from "../../../../../components/button/Button";
import { useProducts } from "../../../../../api/products/useProducts";
import { ActionTypes } from "../../../../../state/action";
import { useAppContext } from "../../../../../context/useAppContext";
import { Dialog } from "../../../../../components/modal/dialog/Dialog";
import { SearchPad } from "./searchPad/SearchPad";
type SearchProps = {
    active: boolean;
    onClick: () => void;
}

export function Search({ active, onClick}: SearchProps) {
    const productQuery = useProducts();
    const { dispatch } = useAppContext();

    const [dialogOpen, setDialogOpen] = useState(false);

    function handleClick() {
        setDialogOpen(!dialogOpen);
        onClick();
    }

    function handleSearch(value: string) {  
        setDialogOpen(false);
        dispatch({
            type: ActionTypes.SEARCH,
            payload: {
                searchTerm: value,
                products: productQuery.data
            }
        });
    }   

    return (
        <>
            <Button type="secondary" onClick={handleClick} toggled={active}>
                Suche
            </Button>

            {active && dialogOpen && <Dialog><SearchPad onSearch={handleSearch} /></Dialog>}
        </>
    );
}