import { Modal } from '../Modal';
import { PropsWithChildren } from 'react';

type DialogProps = PropsWithChildren<{
  title: string
}>;


export function Dialog(props: DialogProps) {
  return (
    <Modal>
      <div className={'bg-white rounded-lg w-3/4 h-3/4 scale-95 transition-transform duration-300 ease-out'}>
        <div className="border-b border-stone-200 p-4 flex justify-between items-center">
          <h1 className="text-lg text-blue-gray-800 font-semibold">{props.title}</h1>
        </div>
        {props.children}
      </div>
    </Modal>
  );
}