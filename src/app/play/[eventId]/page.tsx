"use client"

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SpinWheel } from '@/components/SpinWheel';
import { ResultCard } from '@/components/ResultCard';
import { Camera, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MOCK_EVENT = {
  id: 'event-123',
  title: 'THR Keluarga Besar Haji Sulaiman',
  message: 'Selamat Hari Raya $nama! Semoga berkah dan bahagia selalu.',
  nominals: [10000, 20000, 50000, 100000, 5000, 2000],
};

const BANK_OPTIONS = ['Dana', 'OVO', 'GoPay', 'ShopeePay', 'BCA', 'Mandiri', 'BNI', 'BRI'];

export default function PlayEvent() {
  const { eventId } = useParams();
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

  useEffect(() => {
    // Basic anti-cheat: check localStorage
    const played = localStorage.getItem(`played_${eventId}`);
    if (played) {
      setHasPlayed(true);
    }
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
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep('spinning');
    }, 1000);
  };

  const onSpinFinish = (amount: number) => {
    setResult({ amount, timestamp: new Date().toISOString() });
    setStep('result');
    localStorage.setItem(`played_${eventId}`, 'true');
  };

  if (hasPlayed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ops!</AlertTitle>
          <AlertDescription>
            Kamu sudah mengambil jatah THR di event ini. Berbagi itu indah, berikan kesempatan untuk yang lain ya!
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 flex flex-col items-center justify-center">
      {step === 'form' && (
        <Card className="w-full max-w-md border-none shadow-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-accent">{MOCK_EVENT.title}</CardTitle>
            <CardDescription>Isi data diri kamu untuk mulai memutar roda keberuntungan!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input 
                  id="name" 
                  placeholder="Masukkan nama kamu" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Foto Wajah (Selfie)</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-2xl bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden">
                    {formData.photo ? (
                      <img src={formData.photo} alt="Selfie" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-muted-foreground/50" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="user" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handlePhotoUpload}
                      required
                    />
                  </div>
                  <div className="flex-1 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">Klik untuk ambil foto</p>
                    <p>Foto akan muncul di kartu pemenang nanti.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bank/E-Wallet</Label>
                  <Select onValueChange={v => setFormData(prev => ({ ...prev, wallet: v }))} required>
                    <SelectTrigger className="h-12 rounded-xl">
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
                  <Label>Nomor Rekening</Label>
                  <Input 
                    placeholder="0812..." 
                    required 
                    value={formData.walletNumber}
                    onChange={e => setFormData(prev => ({ ...prev, walletNumber: e.target.value }))}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-accent text-lg font-bold hover:bg-accent/90"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Lanjut ke Spin Wheel'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'spinning' && (
        <div className="text-center space-y-12 animate-in fade-in zoom-in duration-500">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-accent">Semoga Beruntung, {formData.name}!</h2>
            <p className="text-muted-foreground">Roda akan menentukan THR yang kamu dapatkan.</p>
          </div>
          <SpinWheel items={MOCK_EVENT.nominals} onFinish={onSpinFinish} isSpinning={true} />
        </div>
      )}

      {step === 'result' && (
        <div className="animate-in slide-in-from-bottom-10 duration-700 w-full">
          <ResultCard 
            name={formData.name}
            photoUrl={formData.photo || ''}
            amount={result.amount}
            message={MOCK_EVENT.message}
            wallet={`${formData.wallet} - ${formData.walletNumber}`}
          />
        </div>
      )}
    </div>
  );
}
