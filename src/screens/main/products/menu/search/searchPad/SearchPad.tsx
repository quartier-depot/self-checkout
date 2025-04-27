import { useState } from "react";
import { Button } from "../../../../../../components/button/Button";

type SearchPadProps = {
    onSearch: (value: string) => void
}

export function SearchPad({ onSearch }: SearchPadProps) {
    const [value, setValue] = useState("");

    const add = (number: number) => {
        setValue(`${value}${number}`);
    }

    const removeLastNumber = () => {
        setValue(value.substring(0, value.length - 1));
    }

    const handleClick = () => {
        onSearch(value);
    }

    return (
        <div className="grid grid-cols-3 gap-4 p-4">
            <div className="col-span-3 text-4xl mt-5 text-center h-12">
                {value}<span className="animate-pulse">|</span>
            </div>
            <div className="col-span-3 text-2xl text-center text-ellipsis overflow-hidden whitespace-nowrap">
                Zur Suche Artikelnummer ohne führenden Buchstaben eingeben.
            </div>
            <div>
                <Button onClick={() => add(7)} type={'secondary'} className={'py-4'}>7</Button>
            </div>
            <div>
                <Button onClick={() => add(8)} type={'secondary'} className={'py-4'}>8</Button>
            </div>
            <div>
                <Button onClick={() => add(9)} type={'secondary'} className={'py-4'}>9</Button>
            </div>
            <div>
                <Button onClick={() => add(4)} type={'secondary'} className={'py-4'}>4</Button>
            </div>
            <div>
                <Button onClick={() => add(5)} type={'secondary'} className={'py-4'}>5</Button>
            </div>
            <div>
                <Button onClick={() => add(6)} type={'secondary'} className={'py-4'}>6</Button>
            </div>
            <div>
                <Button onClick={() => add(1)} type={'secondary'} className={'py-4'}>1</Button>
            </div>
            <div>
                <Button onClick={() => add(2)} type={'secondary'} className={'py-4'}>2</Button>
            </div>
            <div>
                <Button onClick={() => add(3)} type={'secondary'} className={'py-4'}>3</Button>
            </div>
            <div />
            <div><Button onClick={() => add(0)} type={'secondary'} className={'py-4'}>0</Button></div>
            <div><Button onClick={removeLastNumber} type={'secondary'} className={'py-4 font-bold'}>⌫</Button></div>
            <div className={'col-span-3'}><Button onClick={handleClick} type={'primary'} className={'py-4'}>Suchen</Button></div>
        </div>
    )
}