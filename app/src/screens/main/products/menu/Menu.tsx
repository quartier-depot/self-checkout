import { Browse } from "./browse/Browse";
import { Search } from "./search/Search";
import { Favourites } from "./favourites/Favourites";

export function Menu() {
    return (
        <div className="flex gap-2 pb-2">
            <Browse />
            <Favourites />
            <Search />
        </div>
    );
}