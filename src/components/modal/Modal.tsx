import { PropsWithChildren } from 'react';

type ModalProps = {
    onBackdropClick?: () => void;
}

export function Modal({ onBackdropClick, children }: PropsWithChildren<ModalProps>) {
    return (
        <div className="h-screen w-full fixed left-0 top-0 flex justify-center items-center z-10">
            <div 
                className="absolute inset-0 bg-slate-950"
                onClick={onBackdropClick}
            />
            <div 
                className="relative z-20 w-full h-full flex justify-center items-center"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
