"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { PlusCircle, Copy, LogOut, Users, Gift, Share2, Search, Database, Trash2, Settings2, Plus, Coins, Ban } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { getWinners, getEvents, deleteWinner, createEvent, updateEvent } from '@/app/actions/db-actions';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [winners, setWinners] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [newNominal, setNewNominal] = useState('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    message: 'Selamat Hari Raya $nama! Semoga berkah selalu.',
    nominals: '1000, 2000, 5000, 10000, 20000, 50000, 100000',
    allow_multiple_plays: false
  });

  const fetchData = async () => {
    try {
      const [winnersData, eventsData] = await Promise.all([
        getWinners(),
        getEvents()
      ]);
      setWinners(winnersData);
      setEvents(eventsData);
      if (eventsData.length > 0 && !selectedEventId) {
        setSelectedEventId(eventsData[0].id);
      }
    } catch (err) {
      console.error("Error loading data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentEvent = events.find(e => e.id === selectedEventId);

  const handleDeleteWinner = async (id: string) => {
    if (!confirm('Hapus data pemenang ini? Peserta akan bisa memutar roda lagi.')) return;
    await deleteWinner(id);
    toast({ title: "Dihapus", description: "Peserta sekarang bisa ikut lagi." });
    fetchData();
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title) {
      toast({ variant: "destructive", title: "Gagal", description: "Judul event wajib diisi." });
      return;
    }
    
    const nominalArray = newEvent.nominals.split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n))
      .map(n => ({ value: n, blocked: false }));

    await createEvent({
      ...newEvent,
      nominals: nominalArray,
      is_active: true
    });
    setIsDialogOpen(false);
    toast({ title: "Berhasil", description: "Event baru telah dibuat." });
    fetchData();
  };

  const toggleMultiPlay = async (eventId: string, currentVal: boolean) => {
    await updateEvent(eventId, { allow_multiple_plays: !currentVal });
    toast({ title: "Updated", description: "Pengaturan akses telah diubah." });
    fetchData();
  };

  const addNominal = async () => {
    const val = parseInt(newNominal);
    if (isNaN(val) || val <= 0) return;
    const updatedNominals = [...(currentEvent?.nominals || []), { value: val, blocked: false }];
    await updateEvent(selectedEventId, { nominals: updatedNominals });
    setNewNominal('');
    toast({ title: "Nominal Ditambahkan", description: `Rp ${val.toLocaleString('id-ID')} masuk ke roda.` });
    fetchData();
  };

  const removeNominal = async (index: number) => {
    const updatedNominals = currentEvent.nominals.filter((_: any, i: number) => i !== index);
    await updateEvent(selectedEventId, { nominals: updatedNominals });
    toast({ title: "Nominal Dihapus", description: "Pilihan tersebut dihapus dari roda." });
    fetchData();
  };

  const toggleBlockNominal = async (index: number) => {
    const updatedNominals = currentEvent.nominals.map((item: any, i: number) => {
      if (i !== index) return item;
      const val = typeof item === 'number' ? item : item.value;
      const isBlocked = typeof item === 'object' ? item.blocked : false;
      return { value: val, blocked: !isBlocked };
    });
    
    await updateEvent(selectedEventId, { nominals: updatedNominals });
    const isNowBlocked = updatedNominals[index].blocked;
    toast({ 
      title: isNowBlocked ? "Nominal Diblokir" : "Akses Dibuka", 
      description: isNowBlocked ? "Peserta TIDAK AKAN bisa mendapatkan nominal ini." : "Peserta kini bisa mendapatkan nominal ini lagi."
    });
    fetchData();
  };

  const copyLink = (id: string) => {
    const link = `${window.location.origin}/play/${id}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link Tersalin!", description: "Bagikan link ini ke grup WhatsApp." });
  };

  const filteredWinners = winners.filter(w => 
    w.event_id === selectedEventId && w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalThr = filteredWinners.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-accent p-1.5 rounded-lg">
            <Gift className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight">LuckyTHR <span className="text-accent">Admin</span></span>
        </div>
        <Button variant="ghost" className="text-muted-foreground" onClick={() => router.push('/login')}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </nav>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black">Dashboard Event</h1>
            <div className="flex items-center gap-2 mt-1">
              <select 
                value={selectedEventId} 
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="bg-transparent font-bold text-accent border-none focus:ring-0 cursor-pointer text-lg"
              >
                {events.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={() => copyLink(selectedEventId)} variant="outline" className="flex-1 sm:flex-none border-primary text-primary font-bold">
              <Share2 className="w-4 h-4 mr-2" /> Salin Link
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 sm:flex-none bg-accent hover:bg-accent/90 font-bold">
                  <PlusCircle className="w-4 h-4 mr-2" /> Event Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">Buat Event Baru</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Judul Event</Label>
                    <Input placeholder="THR Keluarga Besar..." value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Pesan Kartu Pemenang</Label>
                    <Input placeholder="Selamat $nama! Semoga berkah." value={newEvent.message} onChange={e => setNewEvent({...newEvent, message: e.target.value})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nominal Awal (Pisahkan dengan koma)</Label>
                    <Input placeholder="5000, 10000, 20000" value={newEvent.nominals} onChange={e => setNewEvent({...newEvent, nominals: e.target.value})} className="rounded-xl" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateEvent} className="bg-accent w-full h-12 font-bold rounded-xl shadow-lg shadow-accent/20">Buat Sekarang 🚀</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<Users className="w-5 h-5" />} label="Pemenang" value={filteredWinners.length.toString()} trend="Orang" />
          <StatCard icon={<Gift className="w-5 h-5" />} label="Total Keluar" value={`Rp ${totalThr.toLocaleString('id-ID')}`} trend="Saldo" />
          <StatCard icon={<Database className="w-5 h-5" />} label="Status Link" value={currentEvent?.is_active ? "AKTIF" : "OFF"} trend="Live" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 border-none shadow-sm h-fit rounded-3xl overflow-hidden">
            <CardHeader className="bg-white border-b">
              <CardTitle className="text-lg flex items-center gap-2"><Settings2 className="w-4 h-4" /> Pengaturan Roda</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border">
                  <div>
                    <p className="font-bold text-sm">Main Berkali-kali</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tanpa batasan IP</p>
                  </div>
                  <Switch 
                    checked={currentEvent?.allow_multiple_plays} 
                    onCheckedChange={() => toggleMultiPlay(selectedEventId, currentEvent?.allow_multiple_plays)} 
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                 <Label className="text-xs font-black uppercase text-muted-foreground">Isi Roda & Blokir Rezeki</Label>
                 <p className="text-[10px] text-muted-foreground italic mb-2">*Klik nominal untuk blokir (Warna merah = tidak bisa didapat)</p>
                 <div className="flex gap-2">
                    <Input 
                      placeholder="Contoh: 75000" 
                      type="number" 
                      value={newNominal} 
                      onChange={e => setNewNominal(e.target.value)} 
                      className="rounded-xl h-10"
                    />
                    <Button size="icon" onClick={addNominal} className="bg-primary hover:bg-primary/80 h-10 w-10 shrink-0">
                      <Plus className="w-4 h-4 text-primary-foreground" />
                    </Button>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-2 mt-4">
                  {currentEvent?.nominals.map((item: any, idx: number) => {
                    const val = typeof item === 'number' ? item : (item?.value ?? 0);
                    const blocked = typeof item === 'object' ? !!item.blocked : false;
                    
                    return (
                      <div 
                        key={idx} 
                        onClick={() => toggleBlockNominal(idx)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border group transition-all cursor-pointer select-none",
                          blocked 
                            ? "bg-red-50 border-red-200 text-red-700" 
                            : "bg-white border-slate-200 hover:border-accent"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {blocked ? <Ban className="w-4 h-4 text-red-500" /> : <Coins className="w-4 h-4 text-primary" />}
                          <span className="font-bold text-sm">Rp {val.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {blocked && <Badge variant="destructive" className="text-[9px] h-4">BLOCKED</Badge>}
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNominal(idx);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {(!currentEvent?.nominals || currentEvent?.nominals.length === 0) && (
                    <p className="text-center py-4 text-xs text-muted-foreground italic">Roda masih kosong</p>
                  )}
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-white border-b px-6 py-5">
              <div>
                <CardTitle className="text-lg font-black">Monitoring Pemenang</CardTitle>
                <p className="text-xs text-muted-foreground">Daftar peserta yang sudah memutar roda</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari nama..." 
                  className="pl-9 w-[180px] sm:w-[240px] rounded-xl h-10" 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="w-[80px] pl-6">Foto</TableHead>
                      <TableHead>Nama & Wallet</TableHead>
                      <TableHead>Nominal</TableHead>
                      <TableHead className="text-right pr-6">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWinners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-20 text-muted-foreground font-medium">Belum ada pemenang di event ini</TableCell>
                      </TableRow>
                    ) : filteredWinners.map((winner, idx) => (
                      <TableRow key={idx} className="hover:bg-slate-50/50">
                        <TableCell className="pl-6">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden border bg-muted shadow-sm">
                            {winner.photo_url ? (
                              <Image src={winner.photo_url} alt={winner.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No Foto</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-black text-slate-800">{winner.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono bg-slate-100 px-2 py-0.5 rounded-md w-fit mt-1">
                            {winner.wallet_info}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 font-black px-3 py-1 rounded-lg border-green-200">
                            Rp {winner.amount.toLocaleString('id-ID')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" className="rounded-xl hover:bg-slate-200" onClick={() => {
                              navigator.clipboard.writeText(winner.wallet_info);
                              toast({ title: "Tersalin", description: "Nomor rekening telah disalin." });
                            }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteWinner(winner.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  return (
    <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black text-foreground">{value}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-2xl text-accent shadow-inner">
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit uppercase tracking-tighter">
          {trend}
        </div>
      </CardContent>
    </Card>
  );
}
