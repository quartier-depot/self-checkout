import { useState } from "react";
import { Button } from "../../../../../../components/button/Button";

type SearchPadProps = {
    onSearch: (value: string) => void,
    onCancel: () => void,
    onChange: (value: string) => void
}

export function SearchPad({ onSearch, onCancel, onChange }: SearchPadProps) {
    const [value, setValue] = useState("");

    const add = (number: number) => {
        setValue(`${value}${number}`);
        onChange(`${value}${number}`);
    }

    const removeLastNumber = () => {
        setValue(value.substring(0, value.length - 1));
        onChange(value.substring(0, value.length - 1));
    }

    const handleClick = () => {
        onSearch(value);
    }

    const handleCancel = () => {
        onCancel();     
    }

    return (
        <div className="grid grid-cols-3 gap-4 p-4" data-testid={'search-pad'}>
            <div className="col-span-3 text-4xl mt-5 text-center h-12">
                <span className="text-slate-500">*</span>{value}
            </div>
            <div className="col-span-3 text-2xl text-center text-ellipsis overflow-hidden whitespace-nowrap">
                Suche mit Artikelnummer ohne führenden Buchstaben
            </div>
            <div>
                <Button onClick={() => add(7)} type={'secondary'} className={'py-4 font-bold'}>7</Button>
            </div>
            <div>
                <Button onClick={() => add(8)} type={'secondary'} className={'py-4 font-bold'}>8</Button>
            </div>
            <div>
                <Button onClick={() => add(9)} type={'secondary'} className={'py-4 font-bold'}>9</Button>
            </div>
            <div>
                <Button onClick={() => add(4)} type={'secondary'} className={'py-4 font-bold'}>4</Button>
            </div>
            <div>
                <Button onClick={() => add(5)} type={'secondary'} className={'py-4 font-bold'}>5</Button>
            </div>
            <div>
                <Button onClick={() => add(6)} type={'secondary'} className={'py-4 font-bold'}>6</Button>
            </div>
            <div>
                <Button onClick={() => add(1)} type={'secondary'} className={'py-4 font-bold'}>1</Button>
            </div>
            <div>
                <Button onClick={() => add(2)} type={'secondary'} className={'py-4 font-bold'}>2</Button>
            </div>
            <div>
                <Button onClick={() => add(3)} type={'secondary'} className={'py-4 font-bold'}>3</Button>
            </div>
            <div />
            <div><Button onClick={() => add(0)} type={'secondary'} className={'py-4 font-bold'}>0</Button></div>
            <div><Button onClick={removeLastNumber} type={'secondary'} className={'py-4 font-bold'}>⌫</Button></div>
            <div className={'col-span-3'}>
                {value.length > 0 && <Button onClick={handleClick} type={'primary'} className={'py-4'}>OK</Button>}
                {value.length === 0 && <Button onClick={handleCancel} type={'primary'} className={'py-4'}>Abbrechen</Button>}
            </div>
        </div>
    )
}