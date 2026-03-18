"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gift, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { registerUser } from '@/app/actions/db-actions';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await registerUser(formData);
      toast({
        title: "Pendaftaran Berhasil!",
        description: "Silakan login dengan akun baru kamu.",
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Mendaftar",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
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
          <CardTitle className="text-3xl font-black">Buat Akun</CardTitle>
          <CardDescription>Mulai bagi-bagi kebahagiaan hari ini.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input 
                id="name" 
                placeholder="Haji Sulaiman" 
                className="h-12 rounded-xl" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@luckythr.app" 
                className="h-12 rounded-xl" 
                required 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                className="h-12 rounded-xl" 
                required 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-accent text-lg font-bold shadow-lg shadow-accent/20"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Daftar Sekarang'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-accent flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Sudah punya akun? Login di sini
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}