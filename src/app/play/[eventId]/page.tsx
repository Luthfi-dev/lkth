
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SpinWheel } from '@/components/SpinWheel';
import { AngpaoGrid } from '@/components/AngpaoGrid';
import { ResultCard } from '@/components/ResultCard';
import { Camera, AlertCircle, Loader2, Gift, Heart, Sparkles, Home } from 'lucide-react';
import { addWinner, getEvents, getSystemSettings } from '@/app/actions/db-actions';
import Link from 'next/link';

export default function PlayEvent() {
  const params = useParams();
  const eventId = params?.eventId as string;
  
  const [eventData, setEventData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [error, setError] = useState(false);
  const [step, setStep] = useState<'form' | 'spinning' | 'result'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [confetti, setConfetti] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    photo: null as string | null,
    wallet: '',
    customWalletName: '',
    walletNumber: ''
  });

  const [result, setResult] = useState({
    amount: 0,
    timestamp: ''
  });

  const loadData = useCallback(async () => {
    if (!eventId) return;
    try {
      const [events, sysSettings] = await Promise.all([
        getEvents(),
        getSystemSettings()
      ]);
      
      const currentSettings = sysSettings || { banks: ['Dana', 'OVO', 'GoPay', 'ShopeePay', 'BCA', 'Lainnya'], siteTitle: 'Lucky THR' };
      setSettings(currentSettings);

      const currentEvent = (events || []).find((e: any) => e.id === eventId);
      
      if (currentEvent) {
        const normalizedNominals = (currentEvent.nominals || []).map((item: any) => 
          typeof item === 'number' ? { value: item, blocked: false } : item
        );
        setEventData({ ...currentEvent, nominals: normalizedNominals });
        
        if (!currentEvent.allow_multiple_plays) {
          const played = localStorage.getItem(`played_${eventId}`);
          if (played) setHasPlayed(true);
        }
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Error loading event:", err);
      setError(true);
    } finally {
      setIsDataLoaded(true);
    }
  }, [eventId]);

  useEffect(() => {
    // Restore form safely
    if (typeof window !== 'undefined') {
      setFormData(prev => ({
        ...prev,
        name: localStorage.getItem('lucky_thr_name') || '',
        wallet: localStorage.getItem('lucky_thr_wallet') || '',
        customWalletName: localStorage.getItem('lucky_thr_custom_wallet') || '',
        walletNumber: localStorage.getItem('lucky_thr_wallet_number') || ''
      }));
    }
    loadData();
  }, [loadData]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, photo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.wallet || !formData.walletNumber) return;
    
    localStorage.setItem('lucky_thr_name', formData.name);
    localStorage.setItem('lucky_thr_wallet', formData.wallet);
    localStorage.setItem('lucky_thr_custom_wallet', formData.customWalletName);
    localStorage.setItem('lucky_thr_wallet_number', formData.walletNumber);

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('spinning');
    }, 1000);
  };

  const onFinishInteraction = async (amount: number) => {
    const walletDisplay = formData.wallet === 'Lainnya' ? formData.customWalletName : formData.wallet;
    const winnerData = {
      event_id: eventId,
      name: formData.name,
      photo_url: formData.photo || '',
      amount: amount,
      wallet_info: `${walletDisplay} - ${formData.walletNumber}`
    };

    try {
      await addWinner(winnerData);
      setResult({ amount, timestamp: new Date().toISOString() });
      
      const newConfetti = Array.from({ length: 100 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: ['#E6C24C', '#E1570E', '#F3A712', '#D33F49', '#3B82F6', '#10B981'][Math.floor(Math.random() * 6)],
        delay: Math.random() * 3,
        size: Math.random() * 12 + 4
      }));
      setConfetti(newConfetti);
      
      setStep('result');
      if (!eventData.allow_multiple_plays) {
        localStorage.setItem(`played_${eventId}`, 'true');
      }
    } catch (err) {
      console.error("Gagal menyimpan pemenang:", err);
    }
  };

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4 text-center bg-slate-50">
      <Card className="p-8 sm:p-12 rounded-[3rem] shadow-2xl border-none max-w-sm w-full animate-in zoom-in duration-300">
        <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-14 h-14 text-red-600" />
        </div>
        <h2 className="text-3xl font-black tracking-tight">Event Tidak Ditemukan!</h2>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          Maaf, event ini mungkin sudah dihapus oleh admin atau link yang Anda masukkan salah.
        </p>
        <Link href="/">
          <Button className="mt-8 rounded-2xl bg-accent font-black px-10 h-14 w-full text-lg shadow-lg hover:scale-[1.02] transition-transform">
            <Home className="w-5 h-5 mr-2" /> Kembali ke Beranda
          </Button>
        </Link>
      </Card>
    </div>
  );

  if (!isDataLoaded || !eventData || !settings) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6 p-4">
      <div className="relative">
         <div className="absolute -inset-8 bg-accent/10 blur-3xl rounded-full animate-pulse"></div>
         <Loader2 className="animate-spin text-accent w-20 h-20" />
         <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent/40 w-8 h-8" />
      </div>
      <div className="text-center space-y-2">
        <p className="font-black text-slate-800 uppercase tracking-widest text-sm animate-pulse">Menyiapkan Berkah...</p>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">by maudigi.com</p>
      </div>
    </div>
  );

  if (hasPlayed) return (
    <div className="min-h-screen flex items-center justify-center p-4 text-center bg-slate-50">
      <Card className="p-8 sm:p-12 rounded-[3rem] shadow-2xl border-none max-w-sm w-full">
        <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-14 h-14 text-orange-600" />
        </div>
        <h2 className="text-3xl font-black tracking-tight">Jatah Habis!</h2>
        <p className="text-muted-foreground mt-3 leading-relaxed">Anda sudah bermain di event ini. Biar yang lain kebagian berkah ya!</p>
        <div className="mt-10 pt-8 border-t flex flex-col items-center gap-2">
           <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
             <span>by</span>
             <span className="text-accent">maudigi.com</span>
             <Heart className="w-3 h-3 text-accent fill-accent" />
           </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {step === 'result' && confetti.map(c => (
        <div key={c.id} className="confetti-particle" style={{ left: `${c.left}%`, backgroundColor: c.color, animationDelay: `${c.delay}s`, width: `${c.size}px`, height: `${c.size}px`, borderRadius: '50%' }} />
      ))}

      {step === 'form' && (
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[3rem] overflow-hidden relative z-50 animate-in zoom-in duration-500">
          <div className="bg-accent p-10 text-center text-white relative">
             <div className="absolute top-4 right-4 animate-float"><Sparkles className="w-6 h-6 text-white/30" /></div>
             <Gift className="w-16 h-16 mx-auto mb-4" />
             <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{eventData.title || settings.siteTitle}</h2>
          </div>
          <CardContent className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">Nama Lengkap</Label>
                <Input placeholder="Masukkan nama..." required value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="rounded-2xl h-14 text-lg font-bold px-5" />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">Foto Selfie (Opsional)</Label>
                <div className="relative w-24 h-24 rounded-[2rem] bg-slate-100 border-4 border-dashed flex items-center justify-center overflow-hidden hover:border-accent hover:bg-white transition-all">
                  {formData.photo ? <img src={formData.photo} alt="Selfie" className="w-full h-full object-cover" /> : <Camera className="w-10 h-10 text-slate-300" />}
                  <input type="file" accept="image/*" capture="user" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhotoUpload} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">Tujuan THR</Label>
                  <Select value={formData.wallet} onValueChange={v => setFormData(prev => ({ ...prev, wallet: v }))} required>
                    <SelectTrigger className="h-14 rounded-2xl font-bold px-5"><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent className="rounded-2xl">{settings.banks.map((opt: string) => <SelectItem key={opt} value={opt} className="rounded-xl">{opt}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">No. HP/Rekening</Label>
                  <Input placeholder="08xxx..." required value={formData.walletNumber} onChange={e => setFormData(prev => ({ ...prev, walletNumber: e.target.value }))} className="h-14 rounded-2xl font-bold px-5" />
                </div>
              </div>
              {formData.wallet === 'Lainnya' && <Input placeholder="Nama Bank/E-Wallet..." required value={formData.customWalletName} onChange={e => setFormData(prev => ({ ...prev, customWalletName: e.target.value }))} className="h-14 rounded-2xl font-bold px-5 animate-in slide-in-from-top-2" />}
              <Button type="submit" className="w-full h-16 rounded-2xl bg-accent text-xl font-black shadow-xl shadow-accent/30 hover:scale-[1.02] active:scale-95 transition-all" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin w-8 h-8" /> : 'GAS SEKARANG! 🚀'}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'spinning' && (
        <div className="text-center space-y-12 animate-in fade-in duration-700 max-w-2xl w-full">
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-accent uppercase leading-none italic tracking-tighter animate-float">Bismillah Beruntung!</h2>
            <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px]">Semoga Hari Raya Ini Berkah Untuk Anda</p>
          </div>
          {eventData.interaction_type === 'angpao' ? <AngpaoGrid items={eventData.nominals} onFinish={onFinishInteraction} /> : <SpinWheel items={eventData.nominals} onFinish={onFinishInteraction} />}
        </div>
      )}

      {step === 'result' && (
        <div className="animate-in slide-in-from-bottom-20 duration-1000 w-full max-w-lg">
          <ResultCard name={formData.name} photoUrl={formData.photo || ''} amount={result.amount} message={eventData.message} wallet={`${formData.wallet} - ${formData.walletNumber}`} />
          <div className="text-center mt-8"><Button variant="link" onClick={() => window.location.reload()} className="text-accent font-black uppercase tracking-widest text-xs">Tutup & Selesai</Button></div>
        </div>
      )}

      <footer className="mt-16 text-center text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black">
        <p>Experience at <Link href="https://maudigi.com" target="_blank" className="text-accent hover:underline">maudigi.com</Link></p>
      </footer>
    </div>
  );
}
