import { useState } from "react";
import { Button } from "../../../../components/button/Button";
import classNames from "classnames";

type NumPadProps = {
    value: number,
    text: string,
    onChange: (value: number) => void
    onReportError?: () => void
}

export function NumPad({ value, text, onChange, onReportError }: NumPadProps) {
    const [count, setCount] = useState(value);
    const [errorReported, setErrorReported] = useState(false);

    const increase = () => {
        setCount(count + 1);
    }

    const decrease = () => {
        if (count > 0) {
            setCount(count - 1);
        }
    }

    const add = (number: number) => {
        setCount(count * 10 + number);
    }

    const removeLastNumber = () => {
        setCount(Math.floor(count / 10));
    }

    const reportError = () => {
        setErrorReported(true);
        onReportError!();
    }

    const onOk = () => {
        onChange(count);
    }

    return (
        <div className="grid grid-cols-3 gap-4 p-4">
            <div>
                <Button onClick={() => decrease()} type={'secondary'} className={'py-4 font-bold'} disabled={count === 0}>-</Button>
            </div>
            <div className="text-4xl mt-5 text-center">{count}</div>
            <div><Button onClick={increase} type={'secondary'} className={'py-4 font-bold'}>+</Button></div>
            <div className="col-span-3 text-2xl text-center text-ellipsis overflow-hidden whitespace-nowrap">{text}</div>
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
            {onReportError && <div className={classNames('text-center mt-6', { 'text-rose-500': !errorReported })} onClick={reportError}>
                {errorReported ? 'Fehler gemeldet, Danke' : 'Fehler melden'}
            </div>}
            {!onReportError && <div />}
            <div><Button onClick={() => add(0)} type={'secondary'} className={'py-4'} disabled={count === 0}>0</Button></div>
            <div><Button onClick={removeLastNumber} type={'secondary'} className={'py-4 font-bold'} disabled={count === 0}>⌫</Button></div>
            <div className={'col-span-3'}><Button onClick={onOk} type={'primary'} className={'py-4'}>OK</Button></div>
        </div>
    )
}