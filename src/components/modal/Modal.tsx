import { PropsWithChildren } from 'react';

type ModalProps = {
    onClick?: () => void;
}

export function Modal({ onClick, children }: PropsWithChildren<ModalProps>) {
    return (
            <div className="h-screen w-full fixed left-0 top-0 flex justify-center items-center bg-slate-950 z-10"
                 onClick={onClick}>
                {children}
            </div>
    );
}
