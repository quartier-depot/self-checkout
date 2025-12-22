interface ListDisplayItemProps {
    delivery: string,
    title: string
}

export function ListDisplayItem({  title, delivery }: ListDisplayItemProps) {
    const deliveryText = new Date(delivery).toLocaleString('de-CH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    return (
            <div
                    role="button"
                    className={
                        'select-none cursor-pointer overflow-hidden rounded-lg bg-yellow-200 p-2 text-center col-span-2'
                    }
            >
                <h2 className={'text-xl font-bold truncate'}>{title} <span className={'mx-4 font-normal'}>-</span><span className={'font-normal'}>{deliveryText}</span></h2>
            </div>
    );
}