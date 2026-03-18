"use client"

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SpinWheel } from '@/components/SpinWheel';
import { ResultCard } from '@/components/ResultCard';
import { Camera, AlertCircle, Loader2, Gift } from 'lucide-react';
import { addWinner, getEvents } from '@/app/actions/db-actions';

const BANK_OPTIONS = ['Dana', 'OVO', 'GoPay', 'ShopeePay', 'BCA', 'Mandiri', 'BNI', 'BRI', 'Lainnya'];

export default function PlayEvent() {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState<any>(null);
  const [step, setStep] = useState<'form' | 'spinning' | 'result'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    photo: null as string | null,
    wallet: '',
    walletNumber: ''
  });

  const [result, setResult] = useState({
    amount: 0,
    timestamp: ''
  });

  // Load saved identity from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('lucky_thr_name');
    const savedWallet = localStorage.getItem('lucky_thr_wallet');
    const savedWalletNumber = localStorage.getItem('lucky_thr_wallet_number');
    
    if (savedName || savedWallet || savedWalletNumber) {
      setFormData(prev => ({
        ...prev,
        name: savedName || '',
        wallet: savedWallet || '',
        walletNumber: savedWalletNumber || ''
      }));
    }
  }, []);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const events = await getEvents();
        const currentEvent = events.find((e: any) => e.id === eventId);
        if (currentEvent) {
          const normalizedNominals = currentEvent.nominals.map((item: any) => 
            typeof item === 'number' ? { value: item, blocked: false } : item
          );
          setEventData({ ...currentEvent, nominals: normalizedNominals });
          
          if (!currentEvent.allow_multiple_plays) {
            const played = localStorage.getItem(`played_${eventId}`);
            if (played) {
              setHasPlayed(true);
            }
          }
        }
      } catch (err) {
        console.error("Error loading event", err);
      }
    };
    loadEvent();
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
    
    // Save identity to localStorage for future use
    localStorage.setItem('lucky_thr_name', formData.name);
    localStorage.setItem('lucky_thr_wallet', formData.wallet);
    localStorage.setItem('lucky_thr_wallet_number', formData.walletNumber);

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('spinning');
    }, 800);
  };

  const onSpinFinish = async (amount: number) => {
    const winnerData = {
      event_id: eventId,
      name: formData.name,
      photo_url: formData.photo || '',
      amount: amount,
      wallet_info: `${formData.wallet} - ${formData.walletNumber}`
    };

    try {
      await addWinner(winnerData);
      setResult({ amount, timestamp: new Date().toISOString() });
      setStep('result');
      if (!eventData.allow_multiple_plays) {
        localStorage.setItem(`played_${eventId}`, 'true');
      }
    } catch (err) {
      console.error("Gagal menyimpan pemenang", err);
    }
  };

  if (!eventData) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent w-10 h-10" /></div>;

  if (hasPlayed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
          <div className="bg-destructive p-6 flex justify-center">
            <AlertCircle className="w-16 h-16 text-white" />
          </div>
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-black">Ups, Jatah Habis!</h2>
            <p className="text-muted-foreground">
              Kamu sudah mengambil jatah THR di event ini. Berbagi itu indah, berikan kesempatan untuk yang lain ya!
            </p>
            <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full rounded-2xl h-12">Kembali ke Beranda</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

      {step === 'form' && (
        <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden relative z-10">
          <div className="bg-accent p-6 text-center text-white">
             <Gift className="w-12 h-12 mx-auto mb-2" />
             <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">{eventData.title}</h2>
             <p className="text-xs opacity-80 mt-2">Isi data diri untuk mulai memutar roda!</p>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullname" className="text-slate-700">Nama Lengkap</Label>
                <Input 
                  id="fullname" 
                  name="fullname"
                  placeholder="Masukkan nama anda..." 
                  required 
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="rounded-xl h-12 border-2 focus:border-accent bg-white"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Foto Selfie (Opsional)</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden group hover:border-accent transition-colors">
                    {formData.photo ? (
                      <img src={formData.photo} alt="Selfie" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-slate-400 group-hover:text-accent" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="user" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                  <div className="flex-1 text-[11px] text-muted-foreground leading-tight">
                    <p className="font-bold text-slate-800 mb-1">Ambil Foto Wajah</p>
                    <p>Wajib senyum ya! Foto ini akan muncul di kartu pemenang setelah roda berhenti.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wallet-select" className="text-slate-700">Tujuan THR</Label>
                  <Select 
                    value={formData.wallet}
                    onValueChange={v => setFormData(prev => ({ ...prev, wallet: v }))} 
                    required
                  >
                    <SelectTrigger id="wallet-select" className="h-12 rounded-xl border-2 bg-white">
                      <SelectValue placeholder="Pilih..." />
                    </SelectTrigger>
                    <SelectContent>
                      {BANK_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-number" className="text-slate-700">No. Rekening/HP</Label>
                  <Input 
                    id="account-number"
                    name="account-number"
                    placeholder="Contoh: 0812..." 
                    required 
                    value={formData.walletNumber}
                    onChange={e => setFormData(prev => ({ ...prev, walletNumber: e.target.value }))}
                    className="h-12 rounded-xl border-2 bg-white"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-accent text-lg font-bold hover:bg-accent/90 shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] active:scale-95"
                disabled={isLoading || !formData.name || !formData.wallet || !formData.walletNumber}
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Lanjut ke Roda! 🎡'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'spinning' && (
        <div className="text-center space-y-12 animate-in fade-in zoom-in duration-500 max-w-2xl w-full">
          <div className="space-y-2 px-4">
            <h2 className="text-4xl font-black text-accent tracking-tighter uppercase leading-none drop-shadow-sm">Bismillah Beruntung!</h2>
            <p className="text-slate-600 font-medium">Klik tombol PUTAR di bawah untuk mulai, {formData.name.split(' ')[0]}!</p>
          </div>
          <SpinWheel items={eventData.nominals} onFinish={onSpinFinish} />
        </div>
      )}

      {step === 'result' && (
        <div className="animate-in slide-in-from-bottom-10 duration-700 w-full max-w-lg">
          <ResultCard 
            name={formData.name}
            photoUrl={formData.photo || ''}
            amount={result.amount}
            message={eventData.message}
            wallet={`${formData.wallet} - ${formData.walletNumber}`}
          />
          <div className="text-center mt-6">
            <Button variant="link" onClick={() => window.location.reload()} className="text-accent font-bold">
              Tutup & Keluar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
