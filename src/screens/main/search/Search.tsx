import magnifier from '../../../assets/magnifier.svg';
import { useAppContext } from '../../../context/useAppContext';
import { ActionTypes } from '../../../state/action';
import * as React from 'react';
import { ChangeEvent, useEffect, useState } from 'react';
import { useProducts } from '../../../api/products/useProducts';

type SearchProps = {
    className?: string
}

export function Search(props: SearchProps) {
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
            <div className={`flex flex-row px-2 my-2 relative ${props.className}`}>
                <div className={'absolute left-5 top-3 p-2 rounded-full bg-emerald-700'}>
                    <img src={magnifier} alt="magnifier" className={'h-6 w-6'} />
                </div>
                <input
                        type="text"
                        className={
                            'bg-white rounded-3xl shadow text-lg full w-full h-16 py-4 pl-16 transition-shadow focus:shadow-2xl focus:outline-none'
                        }
                        placeholder="Suche"
                        value={inputValue}
                        onChange={handleSearch}
                />
            </div>
    );
}
