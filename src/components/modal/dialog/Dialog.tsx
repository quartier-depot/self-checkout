import { Modal } from '../Modal';
import { PropsWithChildren } from 'react';

type DialogProps = PropsWithChildren<{
    title?: string
    onClick?: () => void
}>;


export function Dialog(props: DialogProps) {
    return (
        <Modal onClick={props.onClick}>
            <div className={'bg-slate-50 rounded-lg w-3/4 h-3/4 scale-95 transition-transform duration-300 ease-out flex flex-col'}>
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