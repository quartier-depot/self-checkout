import { Modal } from '../Modal';
import { PropsWithChildren } from 'react';

type DialogProps = PropsWithChildren<{
    title?: string
    onBackdropClick?: () => void
}>;

export function Dialog(props: DialogProps) {
    return (
        <Modal onBackdropClick={props.onBackdropClick}>
            <div className={'bg-slate-50 rounded-lg w-full h-full scale-95 transition-transform duration-300 ease-out flex flex-col max-w-2xl max-h-[80vh]'}>
                {props.title &&
                    <div className="border-b border-stone-200 p-4 items-center">
                        <h1 className="text-lg font-semibold">{props.title}</h1>
                    </div>
                }
                {props.children}
            </div>
        </Modal>
    );
}