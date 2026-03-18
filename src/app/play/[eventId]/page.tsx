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
import { addWinner, getEvents } from '@/app/actions/db-actions';
import Link from 'next/link';

const BANK_OPTIONS = ['Dana', 'OVO', 'GoPay', 'ShopeePay', 'BCA', 'Mandiri', 'BNI', 'BRI', 'Lainnya'];

export default function PlayEvent() {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState<any>(null);
  const [error, setError] = useState(false);
  const [step, setStep] = useState<'form' | 'spinning' | 'result'>('form');
  const [isLoading, setIsLoading] = useState(false);
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

    const loadEvent = async () => {
      try {
        const events = await getEvents();
        const currentEvent = events.find((e: any) => e.id === eventId);
        
        if (currentEvent) {
          const normalizedNominals = (currentEvent.nominals || []).map((item: any) => 
            typeof item === 'number' ? { value: item, blocked: false } : item
          );
          setEventData({ ...currentEvent, nominals: normalizedNominals });
          
          if (!currentEvent.allow_multiple_plays) {
            const played = localStorage.getItem(`played_${eventId}`);
            if (played) {
              setHasPlayed(true);
            }
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error loading event", err);
        setError(true);
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
    if (formData.wallet === 'Lainnya' && !formData.customWalletName) return;
    
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
      console.error("Gagal menyimpan pemenang", err);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <div className="bg-destructive/10 p-12 flex justify-center">
            <AlertCircle className="w-20 h-20 text-destructive" />
          </div>
          <CardContent className="p-10 text-center space-y-6">
            <h2 className="text-3xl font-black">Event Tidak Ditemukan</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ups! Sepertinya link yang kamu akses salah atau event sudah berakhir. Pastikan kembali link yang diberikan admin.
            </p>
            <Button asChild className="w-full rounded-2xl h-14 font-black">
              <Link href="/">Kembali ke Beranda</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!eventData) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent w-10 h-10" /></div>;

  if (hasPlayed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <div className="bg-orange-100 p-12 flex justify-center">
            <AlertCircle className="w-20 h-20 text-orange-600" />
          </div>
          <CardContent className="p-10 text-center space-y-6">
            <h2 className="text-3xl font-black">Ups, Jatah Habis!</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kamu sudah mengambil jatah THR di event ini. Berbagi itu indah, berikan kesempatan untuk yang lain ya!
            </p>
            <Button asChild variant="outline" className="w-full rounded-2xl h-14 font-black border-2">
              <Link href="/">Kembali ke Beranda</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {step === 'result' && confetti.map(c => (
        <div 
          key={c.id} 
          className="confetti-particle" 
          style={{ 
            left: `${c.left}%`, 
            backgroundColor: c.color, 
            animationDelay: `${c.delay}s`,
            width: `${c.size}px`,
            height: `${c.size}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px'
          }} 
        />
      ))}

      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

      {step === 'form' && (
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden relative z-50">
          <div className="bg-accent p-8 text-center text-white">
             <Gift className="w-14 h-14 mx-auto mb-3" />
             <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">{eventData.title}</h2>
             <p className="text-xs opacity-80 mt-2 font-medium">Isi data diri untuk mulai memutar keberuntungan!</p>
          </div>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullname" className="text-slate-700 font-bold">Nama Lengkap</Label>
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
                <Label className="text-slate-700 font-bold">Foto Selfie (Opsional)</Label>
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
                    <p>Biar yang bagi THR tau siapa yang beruntung hari ini!</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wallet-select" className="text-slate-700 font-bold">Tujuan THR</Label>
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
                    <Label htmlFor="account-number" className="text-slate-700 font-bold">No. Rekening/HP</Label>
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

                {formData.wallet === 'Lainnya' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <Label htmlFor="custom-bank" className="text-slate-700 font-bold">Nama Bank / E-Wallet</Label>
                    <Input 
                      id="custom-bank"
                      placeholder="Masukkan nama bank tujuan..." 
                      required 
                      value={formData.customWalletName}
                      onChange={e => setFormData(prev => ({ ...prev, customWalletName: e.target.value }))}
                      className="h-12 rounded-xl border-2 bg-white"
                    />
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 rounded-2xl bg-accent text-lg font-black hover:bg-accent/90 shadow-lg shadow-accent/20 transition-all"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : `GAS SEKARANG! ${eventData.interaction_type === 'angpao' ? '🎁' : '🎡'}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'spinning' && (
        <div className="text-center space-y-12 animate-in fade-in zoom-in duration-500 max-w-2xl w-full">
          <div className="space-y-2 px-4">
            <h2 className="text-4xl font-black text-accent tracking-tighter uppercase leading-none drop-shadow-sm flex items-center justify-center gap-3">
              {eventData.interaction_type === 'angpao' ? <MousePointer2 className="w-8 h-8" /> : <RefreshCw className="w-8 h-8" />}
              Bismillah Beruntung!
            </h2>
            <p className="text-slate-600 font-medium">
               {eventData.interaction_type === 'angpao' 
                 ? 'Pilih satu amplop untuk melihat isinya!' 
                 : `Klik tombol PUTAR untuk mulai, ${formData.name.split(' ')[0]}!`}
            </p>
          </div>
          
          {eventData.interaction_type === 'angpao' ? (
            <AngpaoGrid items={eventData.nominals} onFinish={onFinishInteraction} />
          ) : (
            <SpinWheel items={eventData.nominals} onFinish={onFinishInteraction} />
          )}
        </div>
      )}

      {step === 'result' && (
        <div className="animate-in slide-in-from-bottom-10 duration-700 w-full max-w-lg relative z-20">
          <ResultCard 
            name={formData.name}
            photoUrl={formData.photo || ''}
            amount={result.amount}
            message={eventData.message}
            wallet={`${formData.wallet === 'Lainnya' ? formData.customWalletName : formData.wallet} - ${formData.walletNumber}`}
          />
          <div className="text-center mt-6">
            <Button variant="link" onClick={() => window.location.reload()} className="text-accent font-black">
              Tutup & Keluar
            </Button>
          </div>
        </div>
      )}

      <footer className="mt-12 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
        <p>powered by <Link href="https://maudigi.com" target="_blank" className="text-accent hover:underline">maudigi.com</Link></p>
      </footer>
    </div>
  );
}
