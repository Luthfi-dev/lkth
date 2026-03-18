
"use client"

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Sparkles, Star, Smartphone, Zap, Heart, Download, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { toBlob } from 'html-to-image';

interface ResultCardProps {
  name: string;
  photoUrl: string;
  amount: number;
  message: string;
  wallet: string;
}

export function ResultCard({ name, photoUrl, amount, message, wallet }: ResultCardProps) {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [domain, setDomain] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      setCurrentUrl(origin);
      setDomain(window.location.hostname);
    }
  }, []);

  const handleExportImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const blob = await toBlob(cardRef.current, { cacheBust: true });
      if (!blob) throw new Error('Failed to generate image');
      return blob;
    } catch (err) {
      console.error('Export error:', err);
      toast({ variant: "destructive", title: "Gagal", description: "Tidak bisa membuat gambar hasil." });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = async () => {
    const blob = await handleExportImage();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `LuckyTHR_${name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Berhasil!", description: "Gambar hasil sudah diunduh ke perangkatmu." });
    }
  };

  const handleShare = async () => {
    const shareText = `OMG! 😱 Gue baru aja dapet THR Rp ${amount.toLocaleString('id-ID')} dari LuckyTHR! 🎉🧧\n\n"${message.replace('$nama', name)}"\n\nCek keberuntungan lo juga di: ${currentUrl}\n#LuckyTHR #BerkahDigital #maudigi`;
    
    const blob = await handleExportImage();
    
    if (navigator.share) {
      try {
        const shareData: ShareData = {
          title: 'LuckyTHR Jackpot!',
          text: shareText,
          url: currentUrl,
        };

        if (blob) {
          const file = new File([blob], 'lucky-thr.png', { type: 'image/png' });
          shareData.files = [file];
        }

        await navigator.share(shareData);
        toast({ title: "Berhasil Berbagi!", description: "Terima kasih sudah menyebarkan kebahagiaan!" });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // Fallback if file sharing fails but text sharing works
          try {
            await navigator.share({ title: 'LuckyTHR!', text: shareText, url: currentUrl });
          } catch (e) {
            console.error('Share error:', e);
          }
        }
      }
    } else {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
      toast({ title: "Membuka WhatsApp", description: "Membagikan via link WhatsApp..." });
    }
  };

  return (
    <div className="space-y-6">
      <div ref={cardRef} className="bg-white rounded-[3.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
        <Card className="w-full max-w-md mx-auto overflow-hidden border-none rounded-[3.5rem] bg-white group">
          {/* Header Visual Modern & Vibrant */}
          <div className="relative h-72 w-full bg-gradient-to-br from-accent via-orange-600 to-yellow-400 overflow-hidden">
            <div className="absolute top-8 left-8 animate-bounce delay-75">
              <Star className="text-white/40 fill-white/20 w-10 h-10" />
            </div>
            <div className="absolute bottom-16 left-1/4 animate-float">
              <Sparkles className="text-white/30 w-16 h-16" />
            </div>
            <div className="absolute top-12 right-12 rotate-45 animate-pulse">
              <Zap className="text-white/20 fill-white/10 w-20 h-20" />
            </div>

            <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center p-6 text-center">
              <div className="relative mb-6">
                <div className="absolute -inset-4 bg-white/20 blur-2xl rounded-full"></div>
                <div className="relative w-28 h-28 rounded-[2rem] border-4 border-white shadow-2xl overflow-hidden bg-slate-100 rotate-6 group-hover:rotate-0 transition-transform duration-700">
                  {photoUrl ? (
                    <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                      <Smartphone className="w-10 h-10" />
                    </div>
                  )}
                </div>
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter drop-shadow-lg italic">JACKPOT!</h2>
              <p className="text-white/90 text-xs font-black uppercase tracking-[0.4em] mt-1">#LUCKYTHR_WINNER</p>
            </div>
          </div>

          <CardContent className="pt-10 pb-12 px-8 space-y-10 relative bg-white">
            <div className="text-center space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.3em]">Dompet Lo Nambah:</p>
              <div className="relative inline-block">
                <div className="absolute -inset-x-6 bottom-2 h-6 bg-yellow-400/40 -rotate-2"></div>
                <div className="relative text-7xl font-black text-slate-900 tracking-tighter">
                  <span className="text-3xl align-top mt-2 inline-block">Rp</span>
                  {amount.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-3 text-5xl text-accent/20 font-serif">“</div>
              <div className="bg-slate-50/80 backdrop-blur-sm p-8 rounded-[2.5rem] border-2 border-slate-100/50 shadow-inner">
                <p className="text-slate-800 italic text-center font-bold text-lg leading-relaxed">
                  {message.replace('$nama', name)}
                </p>
              </div>
              <div className="absolute -bottom-12 -right-3 text-5xl text-accent/20 font-serif rotate-180">“</div>
            </div>

            <div className="space-y-4 pt-6">
              <div className="flex items-center justify-between text-[11px] font-black uppercase text-muted-foreground tracking-widest px-4">
                <span>Transfer Info</span>
                <span className="text-accent flex items-center gap-1 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-accent"></span> On Progress
                </span>
              </div>
              <div className="bg-slate-900 text-white p-6 rounded-[2rem] flex items-center justify-between shadow-2xl transition-all hover:scale-[1.02]">
                 <div className="flex flex-col">
                   <span className="text-[10px] text-white/50 font-black uppercase tracking-widest">Account Target</span>
                   <span className="font-mono text-sm mt-1">{wallet}</span>
                 </div>
                 <div className="bg-yellow-400 p-2 rounded-xl">
                   <Smartphone className="w-6 h-6 text-slate-950" />
                 </div>
              </div>
            </div>

            <div className="text-center pt-8 border-t border-dashed">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] flex items-center justify-center gap-1">
                Experience at <span className="text-accent">{domain || 'LuckyTHR'}</span>
              </p>
              <div className="flex items-center justify-center gap-1 text-[9px] text-slate-400 font-bold mt-1">
                <span>by</span>
                <span className="text-accent flex items-center gap-0.5">
                  maudigi.com <Heart className="w-2 h-2 fill-accent" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button 
          onClick={handleShare} 
          disabled={isExporting}
          className="w-full h-16 rounded-[2rem] bg-accent hover:bg-accent/90 text-lg font-black gap-3 shadow-[0_15px_40px_rgba(225,87,14,0.4)] transition-all hover:-translate-y-1 active:scale-95"
        >
          {isExporting ? <Loader2 className="animate-spin" /> : <Share2 className="w-6 h-6" />}
          SHARE MEDSOS 🚀
        </Button>
        <Button 
          onClick={handleDownload}
          variant="outline"
          disabled={isExporting}
          className="w-full h-16 rounded-[2rem] border-2 border-slate-200 text-lg font-black gap-3 transition-all hover:-translate-y-1 active:scale-95 bg-white"
        >
          {isExporting ? <Loader2 className="animate-spin" /> : <Download className="w-6 h-6" />}
          SIMPAN GAMBAR 📸
        </Button>
      </div>
    </div>
  );
}
