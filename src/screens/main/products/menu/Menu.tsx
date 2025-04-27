import { useState } from "react";
import { Browse } from "./browse/Browse";
import { Search } from "./search/Search";
import { Button } from "../../../../components/button/Button";

export function Menu() {
    const [active, setActive] = useState('');

    return (
        <div className="flex gap-2 pb-2">
            <Search active={active === 'search'} onClick={() => setActive('search')}/>
            <Browse active={active === 'scroll'} onClick={() => setActive('scroll')}/>
            <Button type="secondary" disabled onClick={() => {}}>
            Favoriten
        </Button>
        <Button type="secondary" disabled onClick={() => {}}>
            Bestellung
        </Button>
        </div>
    );
}