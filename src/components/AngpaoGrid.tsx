
"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gift, Loader2, CheckCircle2 } from 'lucide-react';
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
  const [isRevealed, setIsRevealed] = useState(false);
  const [envelopesValues, setEnvelopesValues] = useState<number[]>([]);

  const handlePick = (index: number) => {
    if (isSelecting || isRevealed) return;
    
    setIsSelecting(true);
    setSelectedIndex(index);

    // Tentukan pemenang (hanya dari yang tidak diblokir)
    const allowedItems = items.filter(item => !item.blocked);
    const pool = allowedItems.length > 0 ? allowedItems : items;
    const winnerValue = pool[Math.floor(Math.random() * pool.length)].value;

    // Siapkan nilai untuk amplop lainnya (acak dari list nominal)
    const allNominals = items.map(i => i.value);
    const shuffledValues = Array.from({ length: 6 }).map(() => 
      allNominals[Math.floor(Math.random() * allNominals.length)]
    );
    // Pastikan index yang dipilih mendapatkan nilai pemenang asli
    shuffledValues[index] = winnerValue;

    // Animasi pemilihan
    setTimeout(() => {
      setEnvelopesValues(shuffledValues);
      setIsRevealed(true);
      setIsSelecting(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-10 px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const isCurrentPick = selectedIndex === idx;
          const showValue = isRevealed;

          return (
            <div 
              key={idx}
              onClick={() => handlePick(idx)}
              className={cn(
                "group relative transition-all duration-500",
                isRevealed && !isCurrentPick ? "opacity-60 scale-95" : "scale-100",
                !isRevealed && !isSelecting && "cursor-pointer hover:scale-105"
              )}
            >
              <div className={cn(
                "aspect-[3/4] rounded-[2rem] flex flex-col items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-700 border-4",
                isCurrentPick && isRevealed ? "bg-emerald-500 border-yellow-300 scale-110 z-30" : "bg-emerald-700 border-emerald-800",
                !isRevealed && !isSelecting && "hover:shadow-emerald-500/40",
                isSelecting && isCurrentPick && "animate-angpao-shake"
              )}>
                {/* Pattern Amplop Hijau Universal */}
                <div className="absolute top-0 left-0 w-full h-1/3 bg-emerald-800 rounded-b-[3rem] shadow-inner opacity-50"></div>
                
                {!showValue ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-yellow-400/20 border-2 border-yellow-400/50 flex items-center justify-center mb-4 z-10">
                       <Gift className="text-yellow-400 w-8 h-8" />
                    </div>
                    <span className="text-emerald-100/50 font-black text-xs uppercase tracking-widest z-10">PILIH ME!</span>
                  </>
                ) : (
                  <div className="flex flex-col items-center animate-in zoom-in duration-500 z-10">
                    <span className="text-[10px] text-emerald-200 font-bold uppercase mb-1">Isi Amplop:</span>
                    <span className="text-xl font-black text-white">
                      Rp {envelopesValues[idx]?.toLocaleString('id-ID')}
                    </span>
                    
                    {isCurrentPick && (
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onFinish(envelopesValues[idx]);
                        }}
                        className="mt-4 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black rounded-xl h-10 px-6 shadow-lg animate-bounce"
                      >
                        AMBIL THR! 🧧
                      </Button>
                    )}
                  </div>
                )}

                {isSelecting && isCurrentPick && (
                  <div className="absolute inset-0 bg-emerald-900/40 flex items-center justify-center z-20 backdrop-blur-[2px]">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  </div>
                )}
                
                {isRevealed && !isCurrentPick && (
                  <div className="absolute inset-0 bg-black/40 z-20" />
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {!isRevealed && !isSelecting && (
        <div className="text-center space-y-2 animate-float">
          <p className="font-black text-emerald-800 text-lg uppercase tracking-[0.2em]">
             Pilih Satu Amplop Berkah!
          </p>
          <div className="flex justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
          </div>
        </div>
      )}
    </div>
  );
}
