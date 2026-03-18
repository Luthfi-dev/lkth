
"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Sparkles, Star, Smartphone } from 'lucide-react';
import Image from 'next/image';

interface ResultCardProps {
  name: string;
  photoUrl: string;
  amount: number;
  message: string;
  wallet: string;
}

export function ResultCard({ name, photoUrl, amount, message, wallet }: ResultCardProps) {
  const shareToWhatsApp = () => {
    const text = `OMG! 😱 Gue baru aja dapet THR Rp ${amount.toLocaleString('id-ID')} dari LuckyTHR! 🎉🧧\n\n"${message.replace('$nama', name)}"\n\nCek keberuntungan lo juga di: ${window.location.origin}\n#LuckyTHR #BerkahDigital #AntiRibet`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden shadow-[0_20px_50px_rgba(225,87,14,0.3)] border-none rounded-[3rem] bg-white group">
      {/* Header Visual Modern */}
      <div className="relative h-64 w-full bg-gradient-to-br from-accent via-orange-500 to-yellow-500 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-4 left-4 animate-bounce delay-75">
          <Star className="text-white/40 fill-white/20 w-8 h-8" />
        </div>
        <div className="absolute bottom-10 left-1/4 animate-float">
          <Sparkles className="text-white/30 w-12 h-12" />
        </div>
        <div className="absolute top-10 right-10 rotate-12">
          <Star className="text-white/20 fill-white/10 w-16 h-16" />
        </div>

        <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-4">
            <div className="absolute -inset-2 bg-white/20 blur-xl rounded-full"></div>
            <div className="relative w-24 h-24 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-slate-100 rotate-3 group-hover:rotate-0 transition-transform duration-500">
              {photoUrl ? (
                <Image src={photoUrl} alt={name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                  <Smartphone className="w-8 h-8" />
                </div>
              )}
            </div>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter drop-shadow-md">CONGRATS, {name.split(' ')[0]}!</h2>
          <p className="text-white/90 text-sm font-bold uppercase tracking-widest mt-1">#LuckyWinner</p>
        </div>
      </div>

      <CardContent className="pt-8 pb-10 px-8 space-y-8 relative">
        <div className="text-center space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.3em]">Dompet Lo Nambah:</p>
          <div className="relative inline-block">
            <div className="absolute -inset-x-4 bottom-1 h-4 bg-yellow-400/30 -rotate-1"></div>
            <div className="relative text-6xl font-black text-slate-900 tracking-tighter">
              <span className="text-2xl align-top mt-2 inline-block">Rp</span>
              {amount.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -top-3 -left-2 text-4xl text-accent/20 font-serif">“</div>
          <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100">
            <p className="text-slate-700 italic text-center font-medium leading-relaxed">
              {message.replace('$nama', name)}
            </p>
          </div>
          <div className="absolute -bottom-10 -right-2 text-4xl text-accent/20 font-serif rotate-180">“</div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between text-[11px] font-black uppercase text-muted-foreground tracking-widest px-2">
            <span>Tujuan Transfer</span>
            <span className="text-accent">Pending</span>
          </div>
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between shadow-xl">
             <div className="flex flex-col">
               <span className="text-[10px] text-white/50 font-bold uppercase tracking-tighter">Account Info</span>
               <span className="font-mono text-sm">{wallet}</span>
             </div>
             <Smartphone className="w-6 h-6 text-yellow-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4">
          <Button onClick={shareToWhatsApp} className="w-full h-16 rounded-2xl bg-accent hover:bg-accent/90 text-lg font-black gap-3 shadow-[0_10px_30px_rgba(225,87,14,0.3)] group-hover:scale-[1.02] transition-transform">
            <Share2 className="w-6 h-6" /> SHARE KE WA 🚀
          </Button>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Powered by LuckyTHR.app</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
