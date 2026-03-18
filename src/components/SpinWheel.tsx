"use client"

import React, { useState, useEffect, useRef } from 'react';
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
  const wheelRef = useRef<HTMLDivElement>(null);

  const spin = () => {
    if (isSpinning || items.length === 0) return;
    
    // Cari daftar nominal yang TIDAK diblokir
    const allowedItems = items.filter(item => !item.blocked);
    
    // Jika semua diblokir (safety check), ambil semua
    const pool = allowedItems.length > 0 ? allowedItems : items;
    
    // Pilih pemenang dari pool yang diizinkan
    const winner = pool[Math.floor(Math.random() * pool.length)];
    
    // Cari index nominal tersebut di dalam susunan roda asli (agar jarum menunjuk tepat)
    const winnerIndex = items.findIndex(item => item === winner);
    
    setIsSpinning(true);
    
    const segmentAngle = 360 / items.length;
    const extraSpins = 10 * 360; // 10 putaran penuh untuk efek dramatis
    
    // Hitung target rotasi agar berhenti di tengah segmen pemenang
    // Kita kurangi rotasi saat ini agar akumulatif
    const targetAngle = extraSpins + (360 - (winnerIndex * segmentAngle)) - (segmentAngle / 2);
    const newRotation = rotation + targetAngle;
    
    setRotation(newRotation);

    // Animasi 8 detik (sesuai CSS transition)
    setTimeout(() => {
      setIsSpinning(false);
      onFinish(winner.value);
    }, 8200); 
  };

  const colors = [
    '#E6C24C', '#E1570E', '#F3A712', '#D33F49', '#77AF9C', '#285943', '#1B4332', '#081C15'
  ];

  return (
    <div className="flex flex-col items-center gap-12">
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96">
        {/* Penunjuk Roda (Arrow) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-30">
          <div 
            className="w-10 h-12 bg-slate-900 shadow-2xl" 
            style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
          ></div>
        </div>

        {/* Roda Utama */}
        <div 
          ref={wheelRef}
          className="w-full h-full rounded-full border-[12px] border-slate-900 shadow-[0_0_60px_rgba(0,0,0,0.3)] overflow-hidden relative transition-transform duration-[8000ms] ease-[cubic-bezier(0.15,0,0.15,1)]"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {items.map((item, index) => {
            const angle = 360 / items.length;
            const rotateAngle = index * angle;
            
            return (
              <div 
                key={index}
                className="absolute top-0 left-1/2 w-1/2 h-full origin-left flex items-center justify-end pr-6 text-white font-black"
                style={{ 
                  transform: `rotate(${rotateAngle}deg)`,
                  backgroundColor: colors[index % colors.length],
                  clipPath: `polygon(0 0, 100% 0, 100% ${100/items.length * 2}%, 0 0)`, // Menyesuaikan segmen pie
                  width: '50%',
                  height: '100%',
                }}
              >
                <div 
                  className="transform -rotate-90 origin-center text-center whitespace-nowrap"
                  style={{ 
                    fontSize: items.length > 10 ? '0.7rem' : '0.9rem',
                    marginRight: '25px'
                  }}
                >
                  Rp {item.value.toLocaleString('id-ID')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pin Tengah */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border-[6px] border-slate-900 rounded-full z-20 flex items-center justify-center shadow-2xl">
          <div className={`w-6 h-6 bg-accent rounded-full ${isSpinning ? 'animate-ping' : ''}`}></div>
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
