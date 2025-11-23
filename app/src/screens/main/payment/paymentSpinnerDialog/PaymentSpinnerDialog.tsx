import { Spinner } from '../../../../components/spinner/Spinner.tsx';

export function PaymentSpinnerDialog() {
    return (
            <div className={'w-full h-full flex justify-center items-center'}>
                <Spinner text={''} className={'w-72 h-72'} />
            </div>
    );
} 