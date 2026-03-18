"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Wallet } from 'lucide-react';
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
    const text = `Hore! Saya baru saja dapat THR sebesar Rp ${amount.toLocaleString('id-ID')} dari Lucky THR! 🎉🧧\n\n"${message.replace('$nama', name)}"\n\nYuk ikutan juga!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white overflow-hidden shadow-2xl border-none">
      <div className="relative h-48 w-full bg-primary">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h2 className="text-2xl font-bold">Selamat, {name}!</h2>
          <p className="text-sm opacity-90">Kamu Beruntung!</p>
        </div>
        {photoUrl && (
          <div className="absolute -bottom-10 right-6 w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-muted">
            <Image src={photoUrl} alt={name} fill className="object-cover" />
          </div>
        )}
      </div>

      <CardContent className="pt-12 pb-6 px-6 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Total THR Didapat</p>
          <div className="text-5xl font-black text-accent">
            <span className="text-2xl mr-1">Rp</span>
            {amount.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="bg-secondary/50 p-4 rounded-xl border border-primary/20">
          <p className="text-foreground italic text-center text-lg leading-relaxed">
            "{message.replace('$nama', name)}"
          </p>
        </div>

        <div className="flex items-center justify-between text-sm bg-muted/30 p-3 rounded-lg border border-dashed border-muted-foreground/30">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{wallet}</span>
          </div>
          <span className="text-muted-foreground">Tunggu admin transfer ya!</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button variant="outline" className="w-full gap-2 border-primary text-primary hover:bg-primary/10">
            <Download className="w-4 h-4" /> Simpan
          </Button>
          <Button onClick={shareToWhatsApp} className="w-full gap-2 bg-accent hover:bg-accent/90">
            <Share2 className="w-4 h-4" /> Share WA
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
