import { PropsWithChildren } from "react";
import classNames from "classnames";

type ButtonProps = PropsWithChildren<{
    type: 'primary' | 'secondary' | 'tertiary',
    disabled?: boolean,
    toggled?: boolean,
    onClick: () => void,
    className?: string
}>;

export function Button({ disabled, onClick, type, toggled, className, children }: ButtonProps) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={classNames(
                'rounded-lg w-full mt-2 p-2 border-2 uppercase',

                { 'text-white': type === 'primary' },
                { 'bg-emerald-700 border-emerald-700 active:border-emerald-600 active:bg-emerald-600': type === 'primary' && !disabled },
                { 'bg-slate-500 border-slate-500 active:border-slate-400 active:bg-slate-400': type === 'primary' && disabled },

                { 'text-emerald-950': type === 'secondary' },
                { 'bg-emerald-400 border-emerald-400 active:border-emerald-300 active:bg-emerald-300': type === 'secondary' && !toggled },
                { 'bg-emerald-400 border-emerald-700 active:border-emerald-300 active:bg-emerald-300 border-4': type === 'secondary' && toggled },

                { 'text-slate-950 border-slate-500 border-4': type === 'tertiary' },
                    
                className
            )}
        >
            {children}
        </button>);
}