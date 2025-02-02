import { PropsWithChildren } from 'react';

export function Modal(props: PropsWithChildren) {
  return (
    <div className="modal h-screen w-full fixed left-0 top-0 flex justify-center items-center bg-black bg-opacity-50">
      {props.children}
    </div>
  );
}
