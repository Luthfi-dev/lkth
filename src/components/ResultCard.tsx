
"use client"

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Star, Smartphone, Zap, Heart, Download, Loader2 } from 'lucide-react';
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
  const [domain, setDomain] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(window.location.hostname);
    }
  }, []);

  const handleExportImage = async () => {
    if (!cardRef.current) return null;
    setIsExporting(true);
    try {
      const blob = await toBlob(cardRef.current, { 
        cacheBust: true,
        skipFonts: false,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      if (!blob) throw new Error('Failed to generate image');
      return blob;
    } catch (err) {
      console.error('Export error:', err);
      toast({ 
        variant: "destructive", 
        title: "Gagal Membuat Gambar", 
        description: "Terjadi kendala saat memproses gambar. Silakan coba lagi." 
      });
      return null;
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
      toast({ title: "Berhasil!", description: "Gambar telah diunduh ke galeri." });
    }
  };

  const handleShare = async () => {
    const formattedMessage = message.replace('$nama', name);
    const blob = await handleExportImage();
    
    if (navigator.share && typeof window !== 'undefined') {
      try {
        const shareData: any = {
          title: 'LuckyTHR Jackpot!',
          text: formattedMessage, // Hanya ucapan saja sesuai permintaan
        };

        if (blob) {
          const file = new File([blob], 'lucky-thr.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          }
        }

        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          const waUrl = `https://wa.me/?text=${encodeURIComponent(formattedMessage)}`;
          window.open(waUrl, '_blank');
        }
      }
    } else {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(formattedMessage)}`;
      window.open(waUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden p-2">
        {/* Card dibuat lebih pendek & visual terfokus */}
        <div ref={cardRef} className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.15)] max-w-sm mx-auto">
          <Card className="border-none rounded-[2.5rem] bg-white group">
            <div className="relative h-36 w-full bg-gradient-to-br from-accent via-orange-600 to-yellow-400 overflow-hidden">
              <div className="absolute top-4 left-4 animate-bounce">
                <Star className="text-white/40 fill-white/20 w-4 h-4" />
              </div>
              <div className="absolute top-6 right-6 rotate-45 animate-pulse">
                <Zap className="text-white/20 fill-white/10 w-8 h-8" />
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <div className="relative mb-1">
                  <div className="absolute -inset-2 bg-white/20 blur-xl rounded-full"></div>
                  <div className="relative w-14 h-14 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-slate-100 rotate-3">
                    {photoUrl ? (
                      <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                        <Smartphone className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>
                <h2 className="text-xl font-black text-white tracking-tighter italic">JACKPOT!</h2>
              </div>
            </div>

            <CardContent className="pt-4 pb-6 px-6 space-y-4 relative bg-white text-center">
              <div className="space-y-1">
                <p className="text-[7px] text-muted-foreground uppercase font-black tracking-[0.2em]">Total Berkah:</p>
                <div className="relative inline-block">
                  <div className="absolute -inset-x-3 bottom-1 h-3 bg-yellow-400/30 -rotate-1"></div>
                  <div className="relative text-3xl font-black text-slate-900 tracking-tighter">
                    <span className="text-lg align-top mr-0.5">Rp</span>
                    {amount.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/80 p-3 rounded-2xl border-2 border-slate-100/50">
                <p className="text-slate-800 italic font-bold text-xs leading-relaxed">
                  {message.replace('$nama', name)}
                </p>
              </div>

              <div className="pt-3 border-t border-dashed">
                <p className="text-[7px] text-muted-foreground font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1">
                  Experience at <span className="text-accent">{domain || 'LuckyTHR'}</span>
                </p>
                <div className="flex items-center justify-center gap-1 text-[8px] text-slate-400 font-bold mt-1">
                  <span>by</span>
                  <span className="text-accent flex items-center gap-0.5">
                    maudigi.com <Heart className="w-2 h-2 fill-accent" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4">
        {/* Tombol Simpan Gambar di Atas sesuai permintaan */}
        <Button 
          onClick={handleDownload}
          disabled={isExporting}
          variant="outline"
          className="w-full h-14 rounded-[1.5rem] border-2 border-slate-200 text-md font-black gap-3 bg-white hover:bg-slate-50 active:scale-95 transition-all"
        >
          {isExporting ? <Loader2 className="animate-spin" /> : <Download className="w-5 h-5" />}
          SIMPAN GAMBAR 📸
        </Button>
        
        <Button 
          onClick={handleShare} 
          disabled={isExporting}
          className="w-full h-14 rounded-[1.5rem] bg-accent hover:bg-accent/90 text-md font-black gap-3 shadow-lg active:scale-95 transition-all"
        >
          {isExporting ? <Loader2 className="animate-spin" /> : <Share2 className="w-5 h-5" />}
          SHARE MEDSOS 🚀
        </Button>
      </div>
    </div>
  );
}
