
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Copy, Terminal, Key, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import bcrypt from 'bcryptjs';

export default function EncryptionTool() {
  const { toast } = useToast();
  const [plain, setPlain] = useState('');
  const [hashed, setHashed] = useState('');

  const generateHash = () => {
    if (!plain) return;
    // Menggunakan bcryptjs sync untuk demo utilitas client-side
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(plain, salt);
    setHashed(hash);
    toast({
      title: "Generated!",
      description: "Hash baru berhasil dibuat dengan BcryptJS.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hashed);
    toast({
      title: "Berhasil!",
      description: "Hash tersalin ke clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-none">
        <CardHeader className="bg-slate-900 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-2"><Key className="w-5 h-5" /> BcryptJS Encryptor</CardTitle>
          <CardDescription className="text-slate-400">Alat internal developer untuk mengamankan password menggunakan BcryptJS.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="plain">Password Mentah (Plain Text)</Label>
            <Input 
              id="plain" 
              placeholder="Masukkan password..." 
              value={plain}
              onChange={(e) => setPlain(e.target.value)}
              className="h-12"
            />
          </div>
          
          <Button onClick={generateHash} className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white gap-2 font-bold">
            <ShieldAlert className="w-4 h-4" /> Secure with BcryptJS
          </Button>

          {hashed && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
              <Label>Hash Hasil Enkripsi</Label>
              <div className="flex gap-2">
                <div className="flex-1 p-4 bg-slate-100 border border-dashed border-slate-300 rounded-lg break-all font-mono text-xs text-blue-700">
                  {hashed}
                </div>
                <Button variant="outline" size="icon" onClick={copyToClipboard} className="h-full px-4">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground italic">*Gunakan hash ini untuk mengganti password di `db.json` agar sistem lebih aman.</p>
            </div>
          )}

          <div className="pt-4 border-t border-dashed">
            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <ShieldCheck className="w-4 h-4" />
              <span>Sistem menggunakan standar Blowfish untuk keamanan maksimal.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
