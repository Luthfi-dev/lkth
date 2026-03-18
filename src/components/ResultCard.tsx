"use client"

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Sparkles, Star, Smartphone, Zap, Heart, Download, Loader2 } from 'lucide-react';
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
      });
      if (!blob) throw new Error('Failed to generate image');
      return blob;
    } catch (err) {
      console.error('Export error:', err);
      toast({ 
        variant: "destructive", 
        title: "Gagal Membuat Gambar", 
        description: "Terjadi kendala saat memproses gambar hasil. Silakan coba lagi." 
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
      toast({ title: "Berhasil!", description: "Gambar hasil sudah diunduh ke perangkatmu." });
    }
  };

  const handleShare = async () => {
    const formattedMessage = message.replace('$nama', name);
    const shareText = `"${formattedMessage}"`;
    
    const blob = await handleExportImage();
    
    if (navigator.share && typeof window !== 'undefined') {
      try {
        const shareData: any = {
          title: 'LuckyTHR Jackpot!',
          text: shareText,
        };

        if (blob) {
          try {
            const file = new File([blob], 'lucky-thr.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
          } catch (e) {
            console.warn("File sharing not supported by this browser/OS", e);
          }
        }

        await navigator.share(shareData);
        toast({ title: "Berhasil Berbagi!", description: "Terima kasih sudah menyebarkan kebahagiaan!" });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
          window.open(waUrl, '_blank');
        }
      }
    } else {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
      toast({ title: "Membuka WhatsApp", description: "Browser kamu tidak mendukung fitur share otomatis, dialihkan ke WhatsApp." });
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden p-2">
        <div ref={cardRef} className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          <Card className="w-full max-w-sm mx-auto overflow-hidden border-none rounded-[2.5rem] bg-white group">
            {/* Header lebih pendek */}
            <div className="relative h-48 w-full bg-gradient-to-br from-accent via-orange-600 to-yellow-400 overflow-hidden">
              <div className="absolute top-4 left-4 animate-bounce delay-75">
                <Star className="text-white/40 fill-white/20 w-6 h-6" />
              </div>
              <div className="absolute top-6 right-6 rotate-45 animate-pulse">
                <Zap className="text-white/20 fill-white/10 w-12 h-12" />
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <div className="relative mb-3">
                  <div className="absolute -inset-2 bg-white/20 blur-xl rounded-full"></div>
                  <div className="relative w-20 h-20 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-slate-100 rotate-3">
                    {photoUrl ? (
                      <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                        <Smartphone className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tighter italic">JACKPOT!</h2>
                <p className="text-white/90 text-[8px] font-black uppercase tracking-[0.3em]">#LUCKYTHR_WINNER</p>
              </div>
            </div>

            <CardContent className="pt-6 pb-8 px-6 space-y-6 relative bg-white">
              <div className="text-center space-y-1">
                <p className="text-[8px] text-muted-foreground uppercase font-black tracking-[0.2em]">Total Berkah:</p>
                <div className="relative inline-block">
                  <div className="absolute -inset-x-4 bottom-1 h-4 bg-yellow-400/40 -rotate-1"></div>
                  <div className="relative text-5xl font-black text-slate-900 tracking-tighter">
                    <span className="text-xl align-top mt-1 inline-block">Rp</span>
                    {amount.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/80 p-5 rounded-2xl border-2 border-slate-100/50">
                <p className="text-slate-800 italic text-center font-bold text-sm leading-relaxed">
                  {message.replace('$nama', name)}
                </p>
              </div>

              <div className="text-center pt-4 border-t border-dashed">
                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1">
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

      <div className="flex flex-col gap-3 px-2">
        <Button 
          onClick={handleDownload}
          disabled={isExporting}
          variant="outline"
          className="w-full h-14 rounded-2xl border-2 border-slate-200 text-md font-black gap-3 transition-all hover:-translate-y-1 active:scale-95 bg-white"
        >
          {isExporting ? <Loader2 className="animate-spin w-5 h-5" /> : <Download className="w-5 h-5" />}
          SIMPAN GAMBAR 📸
        </Button>
        
        <Button 
          onClick={handleShare} 
          disabled={isExporting}
          className="w-full h-14 rounded-2xl bg-accent hover:bg-accent/90 text-md font-black gap-3 shadow-[0_10px_30px_rgba(225,87,14,0.3)] transition-all hover:-translate-y-1 active:scale-95"
        >
          {isExporting ? <Loader2 className="animate-spin w-5 h-5" /> : <Share2 className="w-5 h-5" />}
          SHARE MEDSOS 🚀
        </Button>
      </div>
    </div>
  );
}
