"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gift, Loader2, Check } from 'lucide-react';
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

    const allNominalValues = items.map(i => i.value);
    let shuffled = [...allNominalValues].sort(() => Math.random() - 0.5);

    const blockedValues = items.filter(i => i.blocked).map(i => i.value);
    const allowedValues = items.filter(i => !i.blocked).map(i => i.value);
    
    if (blockedValues.includes(shuffled[index])) {
      const allowedIdxInShuffled = shuffled.findIndex(v => allowedValues.includes(v));
      if (allowedIdxInShuffled !== -1) {
        [shuffled[index], shuffled[allowedIdxInShuffled]] = [shuffled[allowedIdxInShuffled], shuffled[index]];
      } else {
        shuffled[index] = allowedValues[0] || 0;
      }
    }

    setTimeout(() => {
      setEnvelopesValues(shuffled);
      setIsRevealed(true);
      setIsSelecting(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {items.map((_, idx) => {
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
                "aspect-[3/4] rounded-[1.5rem] sm:rounded-[2rem] flex flex-col items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-700 border-4",
                isCurrentPick && isRevealed ? "bg-emerald-500 border-yellow-300 scale-110 z-30 shadow-yellow-400/20" : "bg-emerald-700 border-emerald-800",
                !isRevealed && !isSelecting && "hover:shadow-emerald-500/40",
                isSelecting && isCurrentPick && "animate-angpao-shake"
              )}>
                <div className="absolute top-0 left-0 w-full h-1/3 bg-emerald-800 rounded-b-[2rem] sm:rounded-b-[3rem] shadow-inner opacity-50"></div>
                
                {!showValue ? (
                  <>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-yellow-400/20 border-2 border-yellow-400/50 flex items-center justify-center mb-4 z-10">
                       <Gift className="text-yellow-400 w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <span className="text-emerald-100/50 font-black text-[10px] uppercase tracking-widest z-10">BERKAH</span>
                  </>
                ) : (
                  <div className="flex flex-col items-center animate-in zoom-in duration-500 z-10 px-2 text-center">
                    <span className="text-[9px] text-emerald-200 font-bold uppercase mb-1">Isi Berkah</span>
                    <span className="text-sm sm:text-lg font-black text-white">
                      Rp {envelopesValues[idx]?.toLocaleString('id-ID')}
                    </span>
                    
                    {isCurrentPick && (
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onFinish(envelopesValues[idx]);
                        }}
                        className="mt-4 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black rounded-xl h-8 sm:h-10 px-4 sm:px-6 shadow-lg animate-bounce text-xs sm:text-sm gap-2"
                      >
                        <Check className="w-4 h-4" /> AMBIL
                      </Button>
                    )}
                  </div>
                )}

                {isSelecting && isCurrentPick && (
                  <div className="absolute inset-0 bg-emerald-900/40 flex items-center justify-center z-20 backdrop-blur-[2px]">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
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
          <p className="font-black text-emerald-800 text-sm sm:text-lg uppercase tracking-[0.2em]">
             Pilih Satu Amplop Berkah
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
