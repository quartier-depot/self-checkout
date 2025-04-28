import { Modal } from '../Modal';
import { Spinner } from '../../spinner/Spinner';

type LoadingProps = {
    text: string;
}

export function Loading({ text }: LoadingProps) {
    return (
        <Modal>
            <div className="flex flex-col">
                <div className="text-center mb-12 text-lg text-slate-400">
                    {text}
                </div>
                    <Spinner className="w-48 h-48" text={text} />
            </div>
        </Modal>
    );
}
