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
            onClick={onClick}
            className={classNames(
                'rounded-lg w-full mt-2 p-2 border-2 uppercase select-none flex items-center justify-center',

                { 'text-white': type === 'primary' },
                { 'bg-emerald-700 border-emerald-700 active:border-emerald-600 active:bg-emerald-600': type === 'primary' && !disabled },
                { 'bg-slate-500 border-slate-500': type === 'primary' && disabled },

                { 'text-emerald-950': type === 'secondary' },
                { 'bg-emerald-400 border-emerald-400 active:border-emerald-300 active:bg-emerald-300': type === 'secondary' && !toggled && !disabled },
                { 'bg-emerald-400 border-emerald-700 active:border-emerald-700 active:bg-emerald-300 border-4': type === 'secondary' && toggled },
                { 'bg-slate-300 border-slate-300': type === 'secondary' && disabled },

                { 'text-slate-950 border-slate-500 border-4': type === 'tertiary' },
                    
                className
            )}
        >
            {children}
        </button>);
}