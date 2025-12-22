import { PropsWithChildren } from "react";

type BadgeProps = PropsWithChildren<{
    className?: string;
    testId?: string
}>;

export function Badge({ children, className, testId}: BadgeProps) {
    return (
            <span className={className +" bg-emerald-800 text-white px-2 py-1 text-xs font-bold rounded-full"} data-testId={testId || ''}>{children}</span>);
}