import { Spinner } from '../../spinner/Spinner';
import { Dialog } from '../dialog/Dialog.tsx';

type LoadingProps = {
    text: string;
}

export function Loading({ text }: LoadingProps) {
    return (
        <Dialog title={text} onBackdropClick={() => {}} className={'size-7/8'}>
            <div className={'w-full h-full flex justify-center items-center'}>
                <Spinner className={'w-72 h-72'} />
            </div>
        </Dialog>
    );
}
