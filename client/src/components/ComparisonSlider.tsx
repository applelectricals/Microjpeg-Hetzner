
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

interface ComparisonSliderProps {
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
    className?: string;
    aspectRatio?: string;
}

export function ComparisonSlider({
    beforeImage,
    afterImage,
    beforeLabel = "Before",
    afterLabel = "After",
    className = "",
    aspectRatio = "16/9"
}: ComparisonSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percentage);
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDragging.current = true;
        handleMove(e.clientX);
    }, [handleMove]);

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            handleMove(e.clientX);
        };

        const handleGlobalMouseUp = () => {
            isDragging.current = false;
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [handleMove]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        handleMove(e.touches[0].clientX);
    }, [handleMove]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full rounded-2xl overflow-hidden cursor-ew-resize select-none bg-gray-900 shadow-2xl group ${className}`}
            style={{ aspectRatio }}
            onMouseDown={handleMouseDown}
            onTouchMove={handleTouchMove}
        >
            {/* After Image (Full width, behind) */}
            <div className="absolute inset-0 flex items-center justify-center">
                <img
                    src={afterImage}
                    alt="Enhanced"
                    className="w-full h-full object-cover transition-transform duration-500"
                    draggable={false}
                />
                {/* After label */}
                <div className="absolute top-4 right-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-20 uppercase tracking-wider">
                    {afterLabel}
                </div>
            </div>

            {/* Before Image (Clipped) */}
            <div
                className="absolute inset-0 overflow-hidden z-10 border-r border-white/20"
                style={{ width: `${sliderPosition}%` }}
            >
                <div
                    className="absolute inset-0"
                    style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100vw' }}
                >
                    <img
                        src={beforeImage}
                        alt="Original"
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                </div>
                {/* Before label */}
                <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-20 uppercase tracking-wider border border-white/20">
                    {beforeLabel}
                </div>
            </div>

            {/* Slider Line & Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] cursor-ew-resize z-30"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
                {/* Slider Handle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center justify-center border-2 border-yellow-500 group-hover:scale-110 transition-transform duration-200">
                    <GripVertical className="w-5 h-5 text-yellow-600" />
                </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md text-white/90 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                Drag to compare
            </div>

            {/* Glass Overlay for Depth */}
            <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-2xl z-40"></div>
        </div>
    );
}
