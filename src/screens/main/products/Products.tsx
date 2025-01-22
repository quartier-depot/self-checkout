import {SearchBar} from "./searchBar/SearchBar.tsx";
import {SearchResults} from "./searchResults/SearchResults.tsx";
import {useProducts} from "../../../api/getProducts.ts";

export function Products() {

    const productsQuery = useProducts();

    if (!productsQuery.data) {
        return "loading ...";
    }

    return (
        <>
            <div className={'flex flex-col bg-slate-50 h-full w-full py-4'}>
                <SearchBar/>
                <SearchResults products={productsQuery.data!}/>
            </div>
        </>)
}
