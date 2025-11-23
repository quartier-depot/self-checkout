import { PropsWithChildren } from 'react';

type ModalProps = {
    onBackdropClick?: () => void;
    className?: string;
}

export function Modal({ onBackdropClick, children, className }: PropsWithChildren<ModalProps>) {
    return (
        <div 
            className="h-screen w-full fixed left-0 top-0 flex justify-center items-center z-10"
            onClick={onBackdropClick}
        >
            <div 
                className="absolute inset-0 bg-slate-950/80"
            />
            <div 
                className={'z-20 '+ className}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
