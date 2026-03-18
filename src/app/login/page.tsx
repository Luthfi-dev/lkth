"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gift, Chrome, Loader2, UserPlus, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { loginUser } from '@/app/actions/db-actions';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await loginUser(email, password);
      toast({
        title: "Login Berhasil",
        description: `Selamat datang kembali, ${result.user.name}!`,
      });
      
      // Redirect berdasarkan role
      if (result.user.role === 'superadmin') {
        router.push('/superadmin');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Login",
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
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@luckythr.app" 
                className="h-12 rounded-xl" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                className="h-12 rounded-xl" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
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

      <div className="mt-8 text-center space-y-4">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium">
            Belum punya akun?
          </p>
          <Link href="/register">
            <Button variant="ghost" className="text-accent font-bold gap-2">
              <UserPlus className="w-4 h-4" /> Daftar Akun Baru Sekarang
            </Button>
          </Link>
        </div>
        
        <Link href="/enc" className="block">
          <Button variant="link" size="sm" className="text-muted-foreground text-xs gap-1">
            <ShieldCheck className="w-3 h-3" /> Dev Tools: Enkripsi Password
          </Button>
        </Link>
      </div>
    </div>
  );
}
