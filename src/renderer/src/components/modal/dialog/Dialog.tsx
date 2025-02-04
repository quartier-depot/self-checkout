import { Modal } from '../Modal';
import { PropsWithChildren } from 'react';

type DialogProps = PropsWithChildren<{
  title: string,
  content: string,
}>;


export function Dialog(props: DialogProps) {
  return (
    <Modal>
      <div className={'bg-white rounded-lg w-1/3 scale-95 transition-transform duration-300 ease-out'}>
        <div className="border-b border-stone-200 p-4 flex justify-between items-center">
          <h1 className="text-lg text-stone-800 font-semibold">{props.title}</h1>
        </div>
        <div className="p-4 text-stone-500"> {props.content}</div>
        <div className="border-t border-stone-200 p-4 flex justify-end gap-2">
          {props.children}
        </div>
      </div>
    </Modal>
  );
}