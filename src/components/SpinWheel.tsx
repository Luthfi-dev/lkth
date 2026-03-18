
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, RefreshCw } from 'lucide-react';

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
  const [isMounted, setIsMounted] = useState(false);
  const wheelRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const colors = [
    '#E6C24C', '#E1570E', '#F3A712', '#D33F49', '#77AF9C', '#285943', '#1B4332', '#081C15'
  ];

  const spin = () => {
    if (isSpinning || items.length === 0) return;
    
    // Pilih pemenang secara adil dari daftar yang TIDAK diblokir
    const allowedItems = items.filter(item => !item.blocked);
    const pool = allowedItems.length > 0 ? allowedItems : items;
    const winner = pool[Math.floor(Math.random() * pool.length)];
    const winnerIndex = items.indexOf(winner);
    
    setIsSpinning(true);
    
    const segmentAngle = 360 / items.length;
    // Berputar minimal 20x putaran penuh agar sangat kencang dan dramatis
    const extraSpins = 20 * 360; 
    
    // Posisi berhenti tepat di tengah segmen pemenang
    const stopAt = 360 - (winnerIndex * segmentAngle + segmentAngle / 2);
    
    // Akumulasi rotasi agar selalu berputar maju ke depan
    const currentRotationBase = Math.floor(rotation / 360) * 360;
    const finalRotation = currentRotationBase + extraSpins + stopAt;
    
    setRotation(finalRotation);

    // Durasi 8 detik dengan easing melambat yang sangat elegan
    setTimeout(() => {
      setIsSpinning(false);
      onFinish(winner.value);
    }, 8100); 
  };

  const renderSegments = () => {
    const totalItems = items.length;
    const angleStep = 360 / totalItems;
    const radius = 100;

    return items.map((item, i) => {
      const startAngle = i * angleStep;
      const endAngle = (i + 1) * angleStep;
      
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
              fontSize={totalItems > 12 ? "4.5" : totalItems > 8 ? "6" : "8"}
              fontWeight="900"
              textAnchor="middle"
              transform={`rotate(-90, ${radius}, ${radius - 65})`}
              className="pointer-events-none select-none font-sans"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            >
              {item.value.toLocaleString('id-ID')}
            </text>
          </g>
        </g>
      );
    });
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col items-center gap-12">
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[420px] md:h-[420px]">
        {/* Penunjuk Panah Atas */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-6 z-30 drop-shadow-2xl">
          <div 
            className="w-12 h-16 bg-slate-900 shadow-2xl relative" 
            style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
          >
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent/50 animate-pulse"></div>
          </div>
        </div>

        {/* Outer Glow Ring */}
        <div className="absolute inset-[-15px] rounded-full bg-accent/10 blur-xl"></div>

        {/* Roda Utama */}
        <div className="w-full h-full rounded-full border-[15px] border-slate-900 bg-slate-900 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden">
          <svg
            ref={wheelRef}
            viewBox="0 0 200 200"
            className="w-full h-full transition-transform duration-[8000ms] ease-[cubic-bezier(0.1,0,0.1,1)]"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {renderSegments()}
            {/* Inner Decoration Ring */}
            <circle cx="100" cy="100" r="10" fill="transparent" stroke="white" strokeWidth="0.5" opacity="0.3" />
          </svg>
        </div>

        {/* Pin Tengah */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white border-[8px] border-slate-900 rounded-full z-20 flex items-center justify-center shadow-2xl">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white/30 rounded-full"></div>
          </div>
        </div>
      </div>

      <Button 
        onClick={spin} 
        disabled={isSpinning}
        className="h-24 w-24 rounded-full bg-accent hover:bg-accent/90 shadow-2xl shadow-accent/40 border-[10px] border-white group transition-all hover:scale-110 active:scale-95 z-40"
      >
        {isSpinning ? (
          <RefreshCw className="w-10 h-10 text-white animate-spin" />
        ) : (
          <Play className="w-10 h-10 fill-white" />
        )}
      </Button>
    </div>
  );
}
