"use client"

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SpinWheelProps {
  items: number[];
  onFinish: (value: number) => void;
  isSpinning?: boolean;
}

export function SpinWheel({ items, onFinish, isSpinning: externalIsSpinning }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    const randomIndex = Math.floor(Math.random() * items.length);
    const itemAngle = 360 / items.length;
    const extraSpins = 10 * 360; // Spin 10 times
    const targetAngle = extraSpins + (360 - (randomIndex * itemAngle)) - (itemAngle / 2);
    
    setRotation(prev => prev + targetAngle - (prev % 360));

    setTimeout(() => {
      setIsSpinning(false);
      onFinish(items[randomIndex]);
    }, 8500); // Wait for animation (8s + buffer)
  };

  useEffect(() => {
    if (externalIsSpinning && !isSpinning) {
      spin();
    }
  }, [externalIsSpinning]);

  const colors = [
    '#E6C24C', '#E1570E', '#F3A712', '#D33F49', '#77AF9C', '#285943'
  ];

  return (
    <div className="relative w-72 h-72 mx-auto sm:w-80 sm:h-80 md:w-96 md:h-96 group">
      {/* Arrow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-20">
        <div className="w-8 h-8 bg-foreground clip-path-arrow" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
      </div>

      {/* Wheel */}
      <div 
        ref={wheelRef}
        className="w-full h-full rounded-full border-8 border-foreground shadow-2xl overflow-hidden relative transition-transform duration-[8000ms] ease-[cubic-bezier(0.15,0,0.15,1)]"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {items.map((item, index) => {
          const angle = 360 / items.length;
          const rotation = index * angle;
          return (
            <div 
              key={index}
              className="absolute top-0 left-1/2 w-1/2 h-full origin-left flex items-center justify-end pr-4 text-white font-bold text-lg sm:text-xl"
              style={{ 
                transform: `rotate(${rotation}deg)`,
                backgroundColor: colors[index % colors.length],
                clipPath: `polygon(0 0, 100% 0, 100% ${angle}%, 0 0)`
              }}
            >
              <span className="transform -rotate-90 origin-right inline-block translate-y-4">
                {item.toLocaleString('id-ID')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Center Pin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white border-4 border-foreground rounded-full z-10 flex items-center justify-center shadow-lg">
        <div className="w-4 h-4 bg-primary rounded-full"></div>
      </div>
    </div>
  );
}
