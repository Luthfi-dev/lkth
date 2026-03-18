"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NominalItem {
  value: number;
  blocked?: boolean;
}

interface AngpaoGridProps {
  items: NominalItem[];
  onFinish: (value: number) => void;
}

export function AngpaoGrid({ items, onFinish }: AngpaoGridProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [envelopes] = useState([0, 1, 2, 3, 4, 5]); // Selalu 6 amplop

  const handlePick = (index: number) => {
    if (isSelecting) return;
    
    setIsSelecting(true);
    setSelectedIndex(index);

    // Pemilihan pemenang: hanya dari yang tidak diblokir
    const allowedItems = items.filter(item => !item.blocked);
    const pool = allowedItems.length > 0 ? allowedItems : items;
    const winner = pool[Math.floor(Math.random() * pool.length)];

    // Animasi "berpindah-pindah" fokus
    let count = 0;
    const maxCount = 20;
    const intervalTime = 100;

    const shuffle = setInterval(() => {
      setHighlightedIndex(Math.floor(Math.random() * 6));
      count++;
      
      if (count >= maxCount) {
        clearInterval(shuffle);
        setHighlightedIndex(index);
        
        // Jeda sedikit untuk dramatis
        setTimeout(() => {
          setIsSelecting(false);
          onFinish(winner.value);
        }, 1000);
      }
    }, intervalTime);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {envelopes.map((idx) => {
          const isCurrentPick = selectedIndex === idx;
          const isHighlighted = highlightedIndex === idx;

          return (
            <div 
              key={idx}
              onClick={() => handlePick(idx)}
              className={cn(
                "group relative cursor-pointer transition-all duration-300",
                isSelecting && !isCurrentPick ? "opacity-40 scale-90" : "opacity-100",
                isHighlighted ? "scale-110" : ""
              )}
            >
              <div className={cn(
                "aspect-[3/4] rounded-3xl bg-red-600 border-4 border-yellow-400 flex flex-col items-center justify-center shadow-xl relative overflow-hidden",
                isHighlighted && "animate-glow",
                isSelecting && isCurrentPick && "animate-angpao-shake",
                !isSelecting && "hover:animate-angpao-bounce hover:shadow-red-500/30"
              )}>
                {/* Pattern Amplop */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-red-700 rounded-b-full shadow-inner"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-yellow-400 border-4 border-red-600 flex items-center justify-center z-10">
                   <span className="font-black text-red-600 text-xl">福</span>
                </div>
                
                <Gift className="text-yellow-400 w-12 h-12 mt-auto mb-6 z-10" />
                
                {isSelecting && isCurrentPick && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-20 backdrop-blur-[1px]">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {!isSelecting && (
        <p className="text-center font-black text-slate-500 animate-pulse text-sm uppercase tracking-widest">
           Pilih Salah Satu Angpao Keberuntunganmu!
        </p>
      )}
    </div>
  );
}