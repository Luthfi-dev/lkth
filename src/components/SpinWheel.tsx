"use client"

import React, { useState, useEffect, useRef } from 'react';

interface SpinWheelProps {
  items: number[];
  onFinish: (value: number) => void;
  isSpinning?: boolean;
}

export function SpinWheel({ items, onFinish, isSpinning: externalIsSpinning }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk memutar roda dengan logika dramatis
  const spin = () => {
    if (isSpinning || items.length === 0) return;
    
    setIsSpinning(true);
    
    // Pilih index pemenang secara acak dari item yang diizinkan
    const randomIndex = Math.floor(Math.random() * items.length);
    const itemAngle = 360 / items.length;
    
    // Putaran dramatis: Minimal 8 putaran penuh + sudut ke target nominal
    // Rumus: (Putaran Sebelumnya) + (Putaran Tambahan) + (Penyesuaian ke Target)
    const extraSpins = 8 * 360; 
    const targetAngle = extraSpins + (360 - (randomIndex * itemAngle)) - (itemAngle / 2);
    
    // Akumulasi rotasi agar tidak balik ke 0 saat putar lagi
    const newRotation = rotation + targetAngle;
    setRotation(newRotation);

    // Waktu animasi 8 detik sesuai dengan transition-duration di CSS
    setTimeout(() => {
      setIsSpinning(false);
      onFinish(items[randomIndex]);
    }, 8200); 
  };

  useEffect(() => {
    if (externalIsSpinning && !isSpinning) {
      spin();
    }
  }, [externalIsSpinning]);

  const colors = [
    '#E6C24C', '#E1570E', '#F3A712', '#D33F49', '#77AF9C', '#285943', '#1B4332', '#081C15'
  ];

  return (
    <div className="relative w-72 h-72 mx-auto sm:w-80 sm:h-80 md:w-96 md:h-96">
      {/* Penunjuk Roda (Arrow) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-6 z-30">
        <div 
          className="w-10 h-10 bg-slate-900 shadow-xl" 
          style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
        ></div>
      </div>

      {/* Roda Utama */}
      <div 
        ref={wheelRef}
        className="w-full h-full rounded-full border-[10px] border-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.2)] overflow-hidden relative transition-transform duration-[8000ms] ease-[cubic-bezier(0.15,0,0.15,1)]"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {items.map((item, index) => {
          const angle = 360 / items.length;
          const rotateAngle = index * angle;
          
          return (
            <div 
              key={index}
              className="absolute top-0 left-1/2 w-1/2 h-full origin-left flex items-center justify-end pr-4 text-white font-black"
              style={{ 
                transform: `rotate(${rotateAngle}deg)`,
                backgroundColor: colors[index % colors.length],
                clipPath: `polygon(0 0, 100% 0, 100% ${100/items.length * 1.5}%, 0 0)`, // Menyesuaikan potongan pie
                width: '50%',
                height: '100%',
              }}
            >
              <div 
                className="transform -rotate-90 origin-center text-center whitespace-nowrap"
                style={{ 
                  fontSize: items.length > 8 ? '0.75rem' : '1rem',
                  marginRight: '20px'
                }}
              >
                Rp {item.toLocaleString('id-ID')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pin Tengah */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border-[6px] border-slate-900 rounded-full z-20 flex items-center justify-center shadow-2xl">
        <div className="w-6 h-6 bg-accent rounded-full animate-pulse"></div>
      </div>
      
      {/* Dekorasi Glossy */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-10"></div>
    </div>
  );
}
