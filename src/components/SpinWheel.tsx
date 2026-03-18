
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
    
    // Pemilihan pemenang: hanya dari yang tidak diblokir
    const allowedItems = items.filter(item => !item.blocked);
    const pool = allowedItems.length > 0 ? allowedItems : items;
    const winner = pool[Math.floor(Math.random() * pool.length)];
    const winnerIndex = items.indexOf(winner);
    
    setIsSpinning(true);
    
    const segmentAngle = 360 / items.length;
    // Berputar minimal 15 kali putaran penuh (5400 derajat) agar terlihat sangat cepat di awal
    const extraSpins = 15 * 360; 
    
    // Hitung posisi berhenti agar tepat di panah atas (arah jam 12)
    // SVG dimulai dari 0 derajat (arah jam 3), panah ada di jam 12 (-90 derajat).
    const stopAt = 360 - (winnerIndex * segmentAngle + segmentAngle / 2);
    
    // Kalkulasi rotasi kumulatif agar animasi selalu berputar maju
    const currentRotationOffset = rotation % 360;
    let delta = stopAt - currentRotationOffset;
    if (delta <= 0) delta += 360;
    
    const finalRotation = rotation + extraSpins + delta;
    setRotation(finalRotation);

    // Durasi animasi 8 detik dengan easing dramatis sesuai permintaan
    // cubic-bezier(0.15, 0, 0.05, 1) memberikan efek melambat yang sangat halus di akhir
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
          <path d={d} fill={colors[i % colors.length]} stroke="#000" strokeWidth="0.2" />
          <g transform={`rotate(${startAngle + angleStep / 2}, ${radius}, ${radius})`}>
            <text
              x={radius}
              y={radius - 65}
              fill="white"
              fontSize={totalItems > 12 ? "4" : "6"}
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
        {/* Penunjuk Panah Atas */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-30 drop-shadow-xl">
          <div 
            className="w-10 h-12 bg-slate-900 shadow-xl" 
            style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
          ></div>
        </div>

        {/* Roda Utama */}
        <div className="w-full h-full rounded-full border-[12px] border-slate-900 bg-slate-900 shadow-[0_0_60px_rgba(0,0,0,0.4)] overflow-hidden">
          <svg
            ref={wheelRef}
            viewBox="0 0 200 200"
            className="w-full h-full transition-transform duration-[8000ms] ease-[cubic-bezier(0.15,0,0.05,1)]"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {renderSegments()}
          </svg>
        </div>

        {/* Pin Tengah */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border-[6px] border-slate-900 rounded-full z-20 flex items-center justify-center shadow-2xl">
          <div className="w-8 h-8 bg-accent rounded-full"></div>
        </div>
      </div>

      <Button 
        onClick={spin} 
        disabled={isSpinning}
        className="h-20 w-20 rounded-full bg-accent hover:bg-accent/90 shadow-2xl shadow-accent/40 border-8 border-white group transition-all hover:scale-110 active:scale-95 z-40"
      >
        <Play className={`w-8 h-8 fill-white ${isSpinning ? 'opacity-50' : ''}`} />
      </Button>
    </div>
  );
}
