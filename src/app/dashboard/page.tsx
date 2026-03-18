"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Copy, LogOut, Users, Gift, Share2, Search, Database } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { getWinners, getEvents } from '@/app/actions/db-actions';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [winners, setWinners] = useState<any[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const [dbStatus, setDbStatus] = useState(process.env.NEXT_PUBLIC_DB_STATUS);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [winnersData, eventsData] = await Promise.all([
          getWinners(),
          getEvents()
        ]);
        setWinners(winnersData);
        setEventCount(eventsData.length);
      } catch (err) {
        console.error("Error loading data", err);
      }
    };
    fetchData();
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/play/event-123`);
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

  const handleLogout = () => {
    router.push('/login');
  };

  const filteredWinners = winners.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalThr = winners.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-accent p-1.5 rounded-lg">
            <Gift className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight">LuckyTHR <span className="text-accent">Admin</span></span>
          <Badge variant="outline" className="ml-2 gap-1 bg-blue-50 text-blue-700 border-blue-200">
            <Database className="w-3 h-3" /> {dbStatus === 'online' ? 'Cloud' : 'Local JSON'}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-muted-foreground" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" /> Logout</Button>
        </div>
      </nav>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black">Dashboard Event</h1>
            <p className="text-muted-foreground">Kelola event THR kamu secara real-time</p>
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
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Pemenang" value={winners.length.toString()} trend="Aktif" />
          <StatCard icon={<Gift className="w-5 h-5" />} label="Total THR Keluar" value={`Rp ${totalThr.toLocaleString('id-ID')}`} trend="Kuota Aman" />
          <StatCard icon={<Search className="w-5 h-5" />} label="Total Event" value={eventCount.toString()} trend="Tersedia" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Pengaturan Local</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 text-sm">
                <p className="font-semibold text-primary mb-2">Migrasi Data</p>
                <p className="text-xs text-muted-foreground mb-3">Gunakan file <code>data.sql</code> untuk memindahkan data lokal ini ke database online nantinya.</p>
                <Button variant="outline" size="sm" className="w-full text-xs">Unduh Data (Coming Soon)</Button>
              </div>
              <div className="space-y-2">
                 <Label className="text-xs">Nominal Tersedia</Label>
                {[100000, 50000, 20000, 10000, 5000].map(val => (
                  <div key={val} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border text-sm">
                    <span className="font-bold">Rp {val.toLocaleString('id-ID')}</span>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
                  {filteredWinners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Belum ada pemenang saat ini</TableCell>
                    </TableRow>
                  ) : filteredWinners.map((winner, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border bg-muted">
                          {winner.photo_url ? (
                            <Image src={winner.photo_url} alt={winner.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No Foto</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold">{winner.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                          {new Date(winner.timestamp).toLocaleTimeString('id-ID')} WIB
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 font-bold">
                          Rp {winner.amount.toLocaleString('id-ID')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{winner.wallet_info}</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => copyWallet(winner.wallet_info)}>
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