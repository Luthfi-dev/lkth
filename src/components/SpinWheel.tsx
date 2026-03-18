"use client"

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface NominalItem {
  value: number;
  blocked?: boolean;
}

interface SpinWheelProps {
  items: NominalItem[];
  onFinish: (value: number) => void;
}

export function SpinWheel({ items, onFinish }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<SVGSVGElement>(null);

  const colors = [
    '#E6C24C', '#E1570E', '#F3A712', '#D33F49', '#77AF9C', '#285943', '#1B4332', '#081C15'
  ];

  const spin = () => {
    if (isSpinning || items.length === 0) return;
    
    const allowedItems = items.filter(item => !item.blocked);
    const pool = allowedItems.length > 0 ? allowedItems : items;
    const winner = pool[Math.floor(Math.random() * pool.length)];
    const winnerIndex = items.indexOf(winner);
    
    setIsSpinning(true);
    
    const segmentAngle = 360 / items.length;
    const extraSpins = 10 * 360; 
    
    // Hitung target agar berhenti tepat di tengah segmen pemenang (arah jam 12 / atas)
    const targetAngle = extraSpins + (360 - (winnerIndex * segmentAngle)) - (segmentAngle / 2);
    const newRotation = rotation + targetAngle;
    
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      onFinish(winner.value);
    }, 8200); 
  };

  const renderSegments = () => {
    const totalItems = items.length;
    const angleStep = 360 / totalItems;
    const radius = 100;

    return items.map((item, i) => {
      const startAngle = i * angleStep;
      const endAngle = (i + 1) * angleStep;
      
      // Calculate SVG path for the slice
      const x1 = radius + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
      const y1 = radius + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
      const x2 = radius + radius * Math.cos((Math.PI * (endAngle - 90)) / 180);
      const y2 = radius + radius * Math.sin((Math.PI * (endAngle - 90)) / 180);
      
      const largeArcFlag = angleStep > 180 ? 1 : 0;
      const d = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      return (
        <g key={i}>
          <path d={d} fill={colors[i % colors.length]} stroke="#000" strokeWidth="0.5" />
          <g transform={`rotate(${startAngle + angleStep / 2}, ${radius}, ${radius})`}>
            <text
              x={radius}
              y={radius - 65}
              fill="white"
              fontSize={totalItems > 12 ? "5" : "7"}
              fontWeight="900"
              textAnchor="middle"
              transform={`rotate(-90, ${radius}, ${radius - 65})`}
              className="pointer-events-none select-none"
            >
              {item.value.toLocaleString('id-ID')}
            </text>
          </g>
        </g>
      );
    });
  };

  return (
    <div className="flex flex-col items-center gap-12">
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96">
        {/* Arrow Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 z-30 drop-shadow-lg">
          <div 
            className="w-10 h-10 bg-slate-900" 
            style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
          ></div>
        </div>

        {/* The Wheel */}
        <svg
          ref={wheelRef}
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-2xl transition-transform duration-[8000ms] ease-[cubic-bezier(0.15,0,0.15,1)]"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <circle cx="100" cy="100" r="100" fill="#0f172a" />
          {renderSegments()}
          {/* Inner Shadow Circle */}
          <circle cx="100" cy="100" r="100" fill="transparent" stroke="rgba(0,0,0,0.1)" strokeWidth="4" />
        </svg>

        {/* Center Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border-[6px] border-slate-900 rounded-full z-20 flex items-center justify-center shadow-2xl">
          <div className={`w-8 h-8 bg-accent rounded-full ${isSpinning ? 'animate-pulse' : ''}`}></div>
        </div>
      </div>

      <Button 
        onClick={spin} 
        disabled={isSpinning}
        className="h-20 w-20 rounded-full bg-accent hover:bg-accent/90 shadow-2xl shadow-accent/40 border-8 border-white group transition-all hover:scale-110 active:scale-95"
      >
        <Play className={`w-8 h-8 fill-white ${isSpinning ? 'opacity-50' : ''}`} />
      </Button>
    </div>
  );
}
