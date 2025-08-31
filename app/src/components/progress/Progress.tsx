import { useEffect, useState } from 'react';

type ProgressProps = {
    percentage: number;
    maxPercentage: number;
    estimatedTime: number; // milliseconds
}

export function Progress(props: ProgressProps) {
    const [currentPercentage, setCurrentPercentage] = useState(props.percentage);

    useEffect(() => {
        if (!props.estimatedTime) return;

        // Reset to initial percentage when estimatedTime or percentage changes
        setCurrentPercentage(props.percentage);

        // Calculate how much to increase per second
        const totalSeconds = props.estimatedTime / 1000;
        const percentagePerSecond = (99 - props.percentage) / totalSeconds;

        const interval = setInterval(() => {
            setCurrentPercentage(prevPercentage => {
                const newPercentage = prevPercentage + percentagePerSecond;
                return newPercentage >= props.maxPercentage ? props.maxPercentage : newPercentage;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [props.estimatedTime, props.percentage]);

    function formatInt(value: number) {
        return value.toFixed(0);
    }
    
    return (
            <div className="flex w-full h-10 bg-slate-500 rounded-full overflow-hidden "
                 role="progressbar">
                <div className="flex flex-col justify-center rounded-full overflow-hidden bg-emerald-400 text-xs text-black text-center whitespace-nowrap transition duration-500 "
                     style={{width: `${currentPercentage}%`}}>{formatInt(currentPercentage)}%</div>
            </div>
    )
}