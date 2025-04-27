import { useState } from "react";
import { Browse } from "./browse/Browse";
import { Search } from "./search/Search";
import { Button } from "../../../../components/button/Button";
import { Favourites } from "./favourites/Favourites";

export function Menu() {
    const [active, setActive] = useState('');

    return (
        <div className="flex gap-2 pb-2">
            <Browse active={active === 'scroll'} onClick={() => setActive('scroll')} />
            <Favourites active={active === 'favourites'} onClick={() => setActive('favourites')} />
            <Button type="secondary" disabled onClick={() => { }}>
                Bestellung
            </Button>
            <Search active={active === 'search'} onClick={() => setActive('search')} />
        </div>
    );
}