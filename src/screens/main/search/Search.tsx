import magnifier from '../../../assets/magnifier.svg';
import { useAppContext } from '../../../context/useAppContext';
import { ActionTypes } from '../../../state/action';
import * as React from 'react';
import { ChangeEvent, useEffect, useState } from 'react';
import { useProducts } from '../../../api/products/useProducts';

export function Search() {
    const { dispatch, state } = useAppContext();
    const productQuery = useProducts();
    const [inputValue, setInputValue] = useState('');
    const lastInputTimeRef = React.useRef<number | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch({
                type: ActionTypes.SEARCH,
                payload: {
                    searchTerm: inputValue,
                    products: productQuery.data
                }
            });
        }, 300);
        lastInputTimeRef.current = Date.now();
        return () => {
            clearTimeout(timer);
        };
    }, [inputValue]);

    useEffect(() => {
        if (!state.searchTerm) {
            setInputValue('');
        }
    }, [state]);

    function handleSearch(event: ChangeEvent<HTMLInputElement>) {
        setInputValue(event.target.value);
    }

    return (
            <div className={`flex flex-row px-8 m-2 relative border-2 border-emerald-700 rounded-full`}>
                <div className={'absolute left-1 top-1 p-2 rounded-full bg-emerald-700'}>
                    <img src={magnifier} alt="magnifier" className={'h-6 w-6'} />
                </div>
                <input
                        type="text"
                        className={
                            'text-xl full w-full h-12 py-2 pl-6 focus:outline-none placeholder:text-slate-500'
                        }
                        placeholder="Suche"
                        value={inputValue}
                        onChange={handleSearch}
                />
            </div>
    );
}
