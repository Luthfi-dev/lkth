"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gift, Chrome, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-8 animate-float">
        <div className="bg-accent p-3 rounded-2xl shadow-lg">
          <Gift className="text-white w-8 h-8" />
        </div>
        <span className="font-black text-4xl text-accent tracking-tighter">LuckyTHR</span>
      </div>

      <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden rounded-3xl">
        <CardHeader className="text-center space-y-2 bg-white pb-8">
          <CardTitle className="text-3xl font-black">Selamat Datang!</CardTitle>
          <CardDescription>Masuk untuk mengelola event bagi-bagi THR kamu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <Button variant="outline" className="w-full h-14 border-2 rounded-2xl font-bold flex gap-3 hover:bg-slate-50 transition-all">
            <Chrome className="w-5 h-5 text-red-500" /> Masuk dengan Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-semibold">Atau masuk manual</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@luckythr.app" className="h-12 rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" className="h-12 rounded-xl" required />
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-accent text-lg font-bold shadow-lg shadow-accent/20"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Masuk ke Dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-8 text-muted-foreground text-sm font-medium">
        Belum punya akun? <span className="text-accent cursor-pointer hover:underline">Daftar sekarang</span>
      </p>
    </div>
  );
}
