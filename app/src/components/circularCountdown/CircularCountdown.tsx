import { useEffect, useState } from 'react';

interface CircularCountdownProps {
    duration: number; // duration in seconds
    size?: number; // size of the circle in pixels
    strokeWidth?: number; // width of the progress bar
    color?: string; // color of the progress bar
}

export function CircularCountdown({
    duration,
    size = 100,
    strokeWidth = 8,
    color = "oklch(0.554 0.046 257.417)" // Tailwind slate-500
}: CircularCountdownProps) {
    const [progress, setProgress] = useState(0);
    
    useEffect(() => {
        const startTime = Date.now();
        
        const timer = setInterval(() => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progressPercent = (elapsed / (duration)) * 100;
            
            if (elapsed >= duration * 1000) {
                setProgress(100);
                clearInterval(timer);
            } else {
                setProgress(progressPercent);
            }
        }, 50); // Update every 50ms for smooth animation
        
        return () => clearInterval(timer);
    }, [duration]);
    
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    return (
        <svg width={size} height={size}>
            {/* Background circle */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgb(54, 160, 137)" // depot emerald-600
                strokeWidth={strokeWidth}
                fill="none"
            />
            {/* Progress circle */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                fill="none"
                style={{
                    transition: 'stroke-dashoffset 0.05s ease-in-out',
                    transformOrigin: '50% 50%',
                    transform: 'rotate(-90deg)'
                }}
            />
        </svg>
    );
}