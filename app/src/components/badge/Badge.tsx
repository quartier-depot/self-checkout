import { PropsWithChildren } from "react";

type BadgeProps = PropsWithChildren<{
    className?: string;
}>;

export function Badge({ children, className}: BadgeProps) {
    return (
            <span className={className +" bg-emerald-700 text-white px-2 py-1 text-xs font-bold rounded-full"}>{children}</span>);
}