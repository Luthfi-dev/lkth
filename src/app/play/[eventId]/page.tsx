
"use client"

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SpinWheel } from '@/components/SpinWheel';
import { AngpaoGrid } from '@/components/AngpaoGrid';
import { ResultCard } from '@/components/ResultCard';
import { Camera, AlertCircle, Loader2, Gift, MousePointer2, RefreshCw, Heart } from 'lucide-react';
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

  useEffect(() => {
    // Load local storage data
    const savedName = localStorage.getItem('lucky_thr_name');
    const savedWallet = localStorage.getItem('lucky_thr_wallet');
    const savedCustomWallet = localStorage.getItem('lucky_thr_custom_wallet');
    const savedWalletNumber = localStorage.getItem('lucky_thr_wallet_number');
    
    if (savedName || savedWallet || savedWalletNumber) {
      setFormData(prev => ({
        ...prev,
        name: savedName || '',
        wallet: savedWallet || '',
        customWalletName: savedCustomWallet || '',
        walletNumber: savedWalletNumber || ''
      }));
    }

    const loadData = async () => {
      if (!eventId) return;
      try {
        const [events, sysSettings] = await Promise.all([
          getEvents(),
          getSystemSettings()
        ]);
        
        setSettings(sysSettings);
        const currentEvent = events.find((e: any) => e.id === eventId);
        
        if (currentEvent) {
          const normalizedNominals = (currentEvent.nominals || []).map((item: any) => 
            typeof item === 'number' ? { value: item, blocked: false } : item
          );
          setEventData({ ...currentEvent, nominals: normalizedNominals });
          
          if (!currentEvent.allow_multiple_plays) {
            const played = localStorage.getItem(`played_${eventId}`);
            if (played) setHasPlayed(true);
          }
          setIsDataLoaded(true);
        } else {
          setError(true);
          setIsDataLoaded(true);
        }
      } catch (err) {
        console.error("Error loading event:", err);
        setError(true);
        setIsDataLoaded(true);
      }
    };
    
    loadData();
  }, [eventId]);

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
    }, 800);
  };

  const createConfetti = () => {
    const newConfetti = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: ['#E6C24C', '#E1570E', '#F3A712', '#D33F49', '#77AF9C', '#3B82F6', '#10B981'][Math.floor(Math.random() * 7)],
      delay: Math.random() * 3,
      size: Math.random() * 12 + 4
    }));
    setConfetti(newConfetti);
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
      createConfetti();
      setStep('result');
      if (!eventData.allow_multiple_plays) {
        localStorage.setItem(`played_${eventId}`, 'true');
      }
    } catch (err) {
      console.error("Gagal menyimpan pemenang:", err);
    }
  };

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4 text-center">
      <Card className="p-10 rounded-[2.5rem] shadow-2xl border-none">
        <AlertCircle className="w-20 h-20 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-black">Event Tidak Ditemukan</h2>
        <p className="text-muted-foreground mt-2">Pastikan link yang Anda gunakan benar.</p>
        <Link href="/">
          <Button className="mt-6 rounded-xl bg-accent font-bold">Kembali ke Beranda</Button>
        </Link>
      </Card>
    </div>
  );

  if (!isDataLoaded || !eventData || !settings) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="animate-spin text-accent w-12 h-12" />
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Menyiapkan Berkah...</p>
    </div>
  );

  if (hasPlayed) return (
    <div className="min-h-screen flex items-center justify-center p-4 text-center">
      <Card className="p-10 rounded-[2.5rem] shadow-2xl border-none">
        <AlertCircle className="w-20 h-20 text-orange-600 mx-auto mb-4" />
        <h2 className="text-2xl font-black">Jatah Habis!</h2>
        <p className="text-muted-foreground mt-2">Anda sudah bermain di event ini. Berbagi ke yang lain ya!</p>
        <div className="mt-8 pt-6 border-t">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">by maudigi.com</p>
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
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden relative z-50">
          <div className="bg-accent p-8 text-center text-white">
             <Gift className="w-14 h-14 mx-auto mb-3" />
             <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">{eventData.title || settings.siteTitle}</h2>
          </div>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-bold">Nama Lengkap</Label>
                <Input placeholder="Masukkan nama..." required value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Foto Selfie (Opsional)</Label>
                <div className="relative w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed flex items-center justify-center overflow-hidden hover:border-accent transition-colors">
                  {formData.photo ? <img src={formData.photo} alt="Selfie" className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-slate-400" />}
                  <input type="file" accept="image/*" capture="user" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhotoUpload} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">Tujuan THR</Label>
                  <Select value={formData.wallet} onValueChange={v => setFormData(prev => ({ ...prev, wallet: v }))} required>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent>{settings.banks.map((opt: string) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">No. Rekening/HP</Label>
                  <Input placeholder="Contoh: 08..." required value={formData.walletNumber} onChange={e => setFormData(prev => ({ ...prev, walletNumber: e.target.value }))} className="h-12 rounded-xl" />
                </div>
              </div>
              {formData.wallet === 'Lainnya' && <Input placeholder="Nama Bank/Wallet..." required value={formData.customWalletName} onChange={e => setFormData(prev => ({ ...prev, customWalletName: e.target.value }))} className="h-12 rounded-xl" />}
              <Button type="submit" className="w-full h-16 rounded-2xl bg-accent text-lg font-black shadow-lg shadow-accent/20" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : 'GAS SEKARANG! 🚀'}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'spinning' && (
        <div className="text-center space-y-12 animate-in fade-in duration-500 max-w-2xl w-full">
          <h2 className="text-4xl font-black text-accent uppercase leading-none italic tracking-tighter">Bismillah Beruntung!</h2>
          {eventData.interaction_type === 'angpao' ? <AngpaoGrid items={eventData.nominals} onFinish={onFinishInteraction} /> : <SpinWheel items={eventData.nominals} onFinish={onFinishInteraction} />}
        </div>
      )}

      {step === 'result' && (
        <div className="animate-in slide-in-from-bottom-10 duration-700 w-full max-w-lg">
          <ResultCard name={formData.name} photoUrl={formData.photo || ''} amount={result.amount} message={eventData.message} wallet={`${formData.wallet} - ${formData.walletNumber}`} />
          <div className="text-center mt-6"><Button variant="link" onClick={() => window.location.reload()} className="text-accent font-black">Tutup & Keluar</Button></div>
        </div>
      )}

      <footer className="mt-12 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
        <p>by <Link href="https://maudigi.com" target="_blank" className="text-accent hover:underline">maudigi.com</Link></p>
      </footer>
    </div>
  );
}
