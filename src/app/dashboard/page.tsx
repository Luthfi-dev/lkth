"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Copy, LogOut, Users, Gift, Share2, Search, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const MOCK_WINNERS = [
  { id: 1, name: 'Budi Santoso', amount: 100000, wallet: 'BCA 123456789', time: '10:30', photo: 'https://picsum.photos/seed/1/50/50' },
  { id: 2, name: 'Siti Aminah', amount: 50000, wallet: 'Dana 08123456789', time: '10:45', photo: 'https://picsum.photos/seed/2/50/50' },
  { id: 3, name: 'Andi Wijaya', amount: 20000, wallet: 'GoPay 08123456789', time: '11:05', photo: 'https://picsum.photos/seed/3/50/50' },
];

export default function AdminDashboard() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const copyLink = () => {
    navigator.clipboard.writeText('https://luckythr.app/play/event-123');
    toast({
      title: "Link Tersalin!",
      description: "Bagikan link ini ke grup WhatsApp keluarga atau teman.",
    });
  };

  const copyWallet = (wallet: string) => {
    navigator.clipboard.writeText(wallet);
    toast({
      title: "Rekening Tersalin!",
      description: "Silakan lanjutkan transfer melalui aplikasi bank kamu.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sidebar / Top Nav */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-accent p-1.5 rounded-lg">
            <Gift className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight">LuckyTHR <span className="text-accent">Admin</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-muted-foreground"><LogOut className="w-4 h-4 mr-2" /> Logout</Button>
        </div>
      </nav>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Stats & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black">Dashboard Event</h1>
            <p className="text-muted-foreground">Kelola event THR Keluarga Besar Haji Sulaiman</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={copyLink} variant="outline" className="flex-1 sm:flex-none border-primary text-primary">
              <Share2 className="w-4 h-4 mr-2" /> Salin Link
            </Button>
            <Button className="flex-1 sm:flex-none bg-accent hover:bg-accent/90">
              <PlusCircle className="w-4 h-4 mr-2" /> Event Baru
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Peserta" value="124" trend="+12 hari ini" />
          <StatCard icon={<Gift className="w-5 h-5" />} label="Total THR Keluar" value="Rp 2.450.000" trend="85% kuota" />
          <StatCard icon={<Search className="w-5 h-5" />} label="Status Event" value="Aktif" trend="Sisa 3 hari" />
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Konfigurasi Nominal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[100000, 50000, 20000, 10000, 5000].map(val => (
                <div key={val} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                  <span className="font-bold text-lg">Rp {val.toLocaleString('id-ID')}</span>
                  <Switch defaultChecked />
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">Simpan Pengaturan</Button>
            </CardContent>
          </Card>

          {/* Real-time Winners Table */}
          <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Monitoring Pemenang</CardTitle>
                <p className="text-xs text-muted-foreground">Update otomatis secara real-time</p>
              </div>
              <Input 
                placeholder="Cari nama..." 
                className="max-w-[200px]" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="w-[80px]">Foto</TableHead>
                    <TableHead>Nama Peserta</TableHead>
                    <TableHead>Nominal</TableHead>
                    <TableHead>Wallet/Bank</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_WINNERS.map((winner) => (
                    <TableRow key={winner.id}>
                      <TableCell>
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border">
                          <Image src={winner.photo} alt={winner.name} fill className="object-cover" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold">{winner.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-semibold">{winner.time} WIB</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 font-bold">
                          Rp {winner.amount.toLocaleString('id-ID')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{winner.wallet}</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => copyWallet(winner.wallet)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-black text-foreground">{value}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl text-accent">
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
          {trend}
        </div>
      </CardContent>
    </Card>
  );
}
