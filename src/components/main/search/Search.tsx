import magnifier from "../../../assets/magnifier.svg";
import {useAppContext} from "../../../context/useAppContext.ts";
import {ActionTypes} from "../../../actions/actions.ts";
import {ChangeEvent} from "react";
import {useProducts} from "../../../api/products/useProducts.ts";

export function Search() {
    const { dispatch} = useAppContext();
    const productQuery = useProducts();

    function handleSearch(event: ChangeEvent<HTMLInputElement>) {
        dispatch({type: ActionTypes.SEARCH, payload: {
                searchTerm: event.target.value,
                products: productQuery.data
            }});
    }

    return (
        <div className={'flex px-2 flex-row relative'}>
            <div className={'absolute left-5 top-3 px-2 py-2 rounded-full bg-emerald-700 text-white'}>
                <img src={magnifier} alt='magnifier' className={'h-6 w-6'}/>
            </div>
            <input
                type="text"
                className={'bg-white rounded-3xl shadow text-lg full w-full h-16 py-4 pl-16 transition-shadow focus:shadow-2xl focus:outline-none'}
                placeholder="Suche"
                onChange={handleSearch}
            />
        </div>
    )
}