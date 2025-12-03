import { Spinner } from '../../../../components/spinner/Spinner.tsx';

export function PaymentSpinnerDialog() {
    return (
            <div className={'w-full h-full flex justify-center items-center'}>
                <Spinner className={'w-72 h-72'} />
            </div>
    );
} 