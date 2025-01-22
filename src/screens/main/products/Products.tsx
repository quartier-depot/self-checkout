import {SearchBar} from "./searchBar/SearchBar.tsx";
import {SearchResults} from "./searchResults/SearchResults.tsx";

export function Products() {

    // const productsQuery = useProducts();

    return (
        <>
            <div className={'flex flex-col bg-slate-50 h-full w-full py-4'}>
                <SearchBar />
                <SearchResults />
            </div>
        </>)
}
