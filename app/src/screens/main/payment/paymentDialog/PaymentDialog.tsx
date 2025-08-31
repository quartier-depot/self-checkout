import { Dialog } from '../../../../components/modal/dialog/Dialog.tsx';
import { Progress } from '../../../../components/progress/Progress.tsx';

type PaymentDialogProps  ={
    percentage: number;
    estimatedTime: number;
}
export function PaymentDialog(props: PaymentDialogProps) {
    
    return (
            <Dialog title={'Bezahlvorgang'} onBackdropClick={() => {}}>
                <div className="p-4 text-blue-gray-800">
                    <Progress percentage={props.percentage} estimatedTime={props.estimatedTime} />
                </div>
            </Dialog>

    )
}