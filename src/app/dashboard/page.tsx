"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { PlusCircle, Copy, LogOut, Users, Gift, Share2, Search, Database, Trash2, Settings2, Plus, Coins, Ban, Download, AlertTriangle, MousePointer2, RefreshCw, Sparkles, ChevronRight, LayoutGrid, Heart, Key } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { getWinners, getEvents, deleteWinner, createEvent, updateEvent, clearWinnersByEvent } from '@/app/actions/db-actions';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import Link from 'next/link';
import bcrypt from 'bcryptjs';

export default function AdminDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [winners, setWinners] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [newNominal, setNewNominal] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Encrypt Tool State
  const [plain, setPlain] = useState('');
  const [hashed, setHashed] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    message: 'Selamat Hari Raya $nama! Semoga berkah selalu.',
    nominals: '1000, 2000, 5000, 10000, 20000, 50000, 100000',
    allow_multiple_plays: false,
    interaction_type: 'angpao'
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('lucky_thr_admin');
    if (!savedUser) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(savedUser);
    setCurrentUser(user);
    fetchData(user);
  }, []);

  const fetchData = async (user: any) => {
    try {
      const [winnersData, eventsData] = await Promise.all([
        getWinners(user.id, user.role),
        getEvents(user.id, user.role)
      ]);
      setWinners(winnersData);
      setEvents(eventsData);
      if (eventsData.length > 0 && !selectedEventId) {
        setSelectedEventId(eventsData[0].id);
      }
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lucky_thr_admin');
    router.push('/login');
  };

  const generateHash = () => {
    if (!plain) return;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(plain, salt);
    setHashed(hash);
  };

  const currentEvent = events.find(e => e.id === selectedEventId);

  const handleDeleteWinner = async (id: string) => {
    await deleteWinner(id);
    toast({ title: "Dihapus", description: "Peserta sekarang bisa ikut lagi." });
    fetchData(currentUser);
  };

  const handleClearWinners = async () => {
    await clearWinnersByEvent(selectedEventId);
    toast({ title: "Data Dibersihkan", description: "Seluruh data pemenang untuk event ini telah dihapus." });
    fetchData(currentUser);
  };

  const exportToExcel = () => {
    const filtered = winners.filter(w => w.event_id === selectedEventId);
    if (filtered.length === 0) {
      toast({ variant: "destructive", title: "Gagal", description: "Belum ada data untuk diekspor." });
      return;
    }

    const headers = ["Nama", "Wallet Info", "Amount", "Timestamp"];
    const rows = filtered.map(w => [
      w.name,
      `"${w.wallet_info}"`,
      w.amount,
      new Date(w.timestamp).toLocaleString('id-ID')
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Pemenang_${currentEvent?.title || 'Event'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Ekspor Berhasil", description: "Data telah diunduh dalam format CSV." });
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

    const created = await createEvent({
      ...newEvent,
      admin_id: currentUser.id,
      nominals: nominalArray,
      is_active: true
    });
    setIsDialogOpen(false);
    setSelectedEventId(created.id);
    toast({ title: "Berhasil", description: "Event baru telah dibuat." });
    fetchData(currentUser);
  };

  const updateEventType = async (type: string) => {
    await updateEvent(selectedEventId, { interaction_type: type });
    toast({ title: "Tampilan Diubah", description: `Model interaksi diganti ke ${type === 'wheel' ? 'Roda' : 'Angpao'}.` });
    fetchData(currentUser);
  };

  const toggleMultiPlay = async (eventId: string, currentVal: boolean) => {
    await updateEvent(eventId, { allow_multiple_plays: !currentVal });
    toast({ title: "Updated", description: "Pengaturan akses telah diubah." });
    fetchData(currentUser);
  };

  const addNominal = async () => {
    const val = parseInt(newNominal);
    if (isNaN(val) || val <= 0) return;
    const updatedNominals = [...(currentEvent?.nominals || []), { value: val, blocked: false }];
    await updateEvent(selectedEventId, { nominals: updatedNominals });
    setNewNominal('');
    fetchData(currentUser);
  };

  const removeNominal = async (index: number) => {
    const updatedNominals = currentEvent.nominals.filter((_: any, i: number) => i !== index);
    await updateEvent(selectedEventId, { nominals: updatedNominals });
    fetchData(currentUser);
  };

  const toggleBlockNominal = async (index: number) => {
    const updatedNominals = currentEvent.nominals.map((item: any, i: number) => {
      if (i !== index) return item;
      const val = typeof item === 'object' ? item.value : item;
      const currentBlocked = typeof item === 'object' ? !!item.blocked : false;
      return { value: val, blocked: !currentBlocked };
    });
    await updateEvent(selectedEventId, { nominals: updatedNominals });
    fetchData(currentUser);
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

  if (isLoading || !currentUser) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><RefreshCw className="w-10 h-10 animate-spin text-accent" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-accent p-1.5 rounded-lg">
            <Gift className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight">LuckyTHR <span className="text-accent">Admin</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex border-accent text-accent">
                <Key className="w-4 h-4 mr-2" /> Encrypt Tools
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem]">
              <DialogHeader>
                <DialogTitle>Admin Security Tools</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Password Plain Text</Label>
                  <Input placeholder="Ketik password..." value={plain} onChange={e => setPlain(e.target.value)} className="rounded-xl h-12" />
                </div>
                <Button onClick={generateHash} className="w-full bg-slate-900 h-12 rounded-xl">Generate Safe Hash</Button>
                {hashed && (
                  <div className="p-4 bg-slate-100 rounded-xl font-mono text-xs break-all border border-dashed border-slate-300">
                    {hashed}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-none">{currentUser.name}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{currentUser.role}</p>
          </div>
          <Button variant="ghost" className="text-muted-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Keluar
          </Button>
        </div>
      </nav>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border-4 border-dashed border-slate-200 max-w-lg w-full">
              <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-3xl font-black">Belum Ada Event</h2>
              <p className="text-muted-foreground mt-4">Halo {currentUser.name}! Buat event pertamamu untuk mulai berbagi kebahagiaan.</p>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-8 w-full h-16 bg-accent rounded-2xl shadow-lg font-black text-xl">
                    <PlusCircle className="w-6 h-6 mr-3" /> Buat Event Baru
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-[2.5rem]">
                  <DialogHeader><DialogTitle className="text-2xl font-black">Buat Event Baru 🧧</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Nama Event</Label>
                      <Input placeholder="THR Keluarga..." value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="rounded-xl h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label>Daftar Nominal (Pisahkan dengan koma)</Label>
                      <Textarea placeholder="1000, 5000, 10000..." value={newEvent.nominals} onChange={e => setNewEvent({...newEvent, nominals: e.target.value})} className="rounded-xl min-h-[100px]" />
                    </div>
                  </div>
                  <DialogFooter><Button onClick={handleCreateEvent} className="bg-accent w-full h-14 font-black rounded-xl">GAS! 🚀</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2"><LayoutGrid className="w-4 h-4" /> Pilih Event</h2>
                <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)} className="rounded-xl border-accent text-accent">
                  <Plus className="w-4 h-4 mr-1" /> Buat Baru
                </Button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {events.map((event) => (
                  <button key={event.id} onClick={() => setSelectedEventId(event.id)} className={cn("flex-shrink-0 w-64 p-6 rounded-[2rem] text-left transition-all border-2", selectedEventId === event.id ? "bg-white border-accent shadow-xl shadow-accent/10" : "bg-white border-transparent hover:border-slate-200")}>
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", selectedEventId === event.id ? "bg-accent text-white" : "bg-slate-100 text-slate-400")}>
                      {event.interaction_type === 'angpao' ? <MousePointer2 className="w-6 h-6" /> : <RefreshCw className="w-6 h-6" />}
                    </div>
                    <h3 className="font-black text-slate-800 leading-tight">{event.title}</h3>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2rem] border">
              <div className="space-y-1">
                <h1 className="text-2xl font-black">{currentEvent?.title}</h1>
                <p className="text-xs text-muted-foreground">Kelola event dan pantau daftar pemenang secara real-time.</p>
              </div>
              <Button onClick={() => copyLink(selectedEventId)} className="w-full sm:w-auto bg-accent h-12 rounded-xl font-black px-8">
                <Share2 className="w-4 h-4 mr-2" /> Bagikan Link THR
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard icon={<Users className="w-5 h-5" />} label="Total Pemenang" value={filteredWinners.length.toString()} trend="Orang" />
              <StatCard icon={<Gift className="w-5 h-5" />} label="THR Dikeluarkan" value={`Rp ${totalThr.toLocaleString('id-ID')}`} trend="Saldo" />
              <StatCard icon={<Database className="w-5 h-5" />} label="Akses Main" value={currentEvent?.allow_multiple_plays ? "BEBAS" : "1X LIMIT"} trend="Status" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1 border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="bg-slate-50 border-b"><CardTitle className="text-lg font-black flex items-center gap-2"><Settings2 className="w-4 h-4" /> Pengaturan</CardTitle></CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Model Permainan</Label>
                    <div className="grid grid-cols-2 gap-2">
                       <Button variant={currentEvent?.interaction_type === 'angpao' ? 'default' : 'outline'} onClick={() => updateEventType('angpao')} className="rounded-xl h-12 font-bold"><MousePointer2 className="w-4 h-4 mr-2" /> Angpao</Button>
                       <Button variant={currentEvent?.interaction_type === 'wheel' ? 'default' : 'outline'} onClick={() => updateEventType('wheel')} className="rounded-xl h-12 font-bold"><RefreshCw className="w-4 h-4 mr-2" /> Roda</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border">
                    <div className="text-sm font-bold">Main Berkali-kali</div>
                    <Switch checked={currentEvent?.allow_multiple_plays} onCheckedChange={() => toggleMultiPlay(selectedEventId, currentEvent?.allow_multiple_plays)} />
                  </div>
                  <div className="space-y-4 pt-6 border-t">
                     <Label className="text-xs font-black uppercase text-muted-foreground">Isi Hadiah</Label>
                     <div className="flex gap-2">
                        <Input placeholder="75000" type="number" value={newNominal} onChange={e => setNewNominal(e.target.value)} className="rounded-xl h-12" />
                        <Button size="icon" onClick={addNominal} className="h-12 w-12"><Plus className="w-5 h-5" /></Button>
                     </div>
                     <div className="grid grid-cols-1 gap-2">
                      {currentEvent?.nominals.map((item: any, idx: number) => {
                        const val = typeof item === 'object' ? item.value : item;
                        const blocked = typeof item === 'object' ? !!item.blocked : false;
                        return (
                          <div key={idx} onClick={() => toggleBlockNominal(idx)} className={cn("flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer", blocked ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-slate-100 hover:border-accent")}>
                            <div className="flex items-center gap-3">
                              <Coins className={cn("w-4 h-4", blocked ? "text-red-500" : "text-accent")} />
                              <span className="font-black">Rp {val?.toLocaleString('id-ID')}</span>
                            </div>
                            <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); removeNominal(idx); }} className="h-8 w-8 text-muted-foreground"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        );
                      })}
                     </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 border-b px-6 py-5 gap-4">
                  <CardTitle className="text-lg font-black">Monitoring Pemenang</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button onClick={exportToExcel} size="sm" variant="outline" className="rounded-xl border-green-600 text-green-600 font-bold"><Download className="w-4 h-4 mr-2" /> Excel</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button size="sm" variant="outline" className="rounded-xl border-red-500 text-red-500 font-bold"><Trash2 className="w-4 h-4 mr-2" /> Hapus Semua</Button></AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[2rem]">
                        <AlertDialogHeader><AlertDialogTitle className="text-2xl font-black">Hapus Semua Data?</AlertDialogTitle><AlertDialogDescription>Peserta yang sudah pernah main akan bisa ikut memutar roda lagi. Tindakan ini tidak bisa dibatalkan!</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel><AlertDialogAction onClick={handleClearWinners} className="bg-red-600 rounded-xl">Ya, Hapus Semua!</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow className="bg-slate-50/30"><TableHead className="pl-6">Foto</TableHead><TableHead>Nama & Wallet</TableHead><TableHead>Nominal</TableHead><TableHead className="text-right pr-6">Aksi</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {filteredWinners.length === 0 ? (
                          <TableRow><TableCell colSpan={4} className="text-center py-24 text-muted-foreground">Belum ada pemenang</TableCell></TableRow>
                        ) : filteredWinners.map((winner, idx) => (
                          <TableRow key={idx} className="hover:bg-slate-50/30 border-b">
                            <TableCell className="pl-6"><div className="relative w-12 h-12 rounded-xl overflow-hidden border bg-muted shadow-sm">{winner.photo_url ? <Image src={winner.photo_url} alt={winner.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">No Foto</div>}</div></TableCell>
                            <TableCell><div className="font-black text-slate-800">{winner.name}</div><div className="text-[10px] text-muted-foreground font-mono bg-slate-100 px-2 py-0.5 rounded-md mt-1">{winner.wallet_info}</div></TableCell>
                            <TableCell><Badge variant="secondary" className="bg-green-100 text-green-700 font-black px-3 py-1 rounded-lg">Rp {winner.amount.toLocaleString('id-ID')}</Badge></TableCell>
                            <TableCell className="text-right pr-6"><Button size="icon" variant="ghost" className="rounded-xl text-red-500" onClick={() => handleDeleteWinner(winner.id)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>

      <footer className="py-8 bg-slate-100 border-t mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-2">
           <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
             <span>by</span>
             <Link href="https://maudigi.com" target="_blank" className="text-accent hover:underline flex items-center gap-1">maudigi.com <Heart className="w-3 h-3 fill-accent" /></Link>
           </div>
        </div>
      </footer>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem]">
          <DialogHeader><DialogTitle className="text-2xl font-black">Buat Event Baru 🧧</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nama Event</Label>
              <Input placeholder="THR Keluarga..." value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label>Daftar Nominal (Pisahkan dengan koma)</Label>
              <Textarea placeholder="1000, 5000, 10000..." value={newEvent.nominals} onChange={e => setNewEvent({...newEvent, nominals: e.target.value})} className="rounded-xl min-h-[100px]" />
            </div>
          </div>
          <DialogFooter><Button onClick={handleCreateEvent} className="bg-accent w-full h-14 font-black rounded-xl">GAS! 🚀</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  return (
    <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{label}</p>
            <p className="text-3xl font-black text-foreground">{value}</p>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl text-accent shadow-inner">{icon}</div>
        </div>
        <div className="mt-4 flex items-center text-[10px] font-black text-accent bg-primary/20 px-3 py-1 rounded-full w-fit uppercase tracking-tighter">{trend}</div>
      </CardContent>
    </Card>
  );
}
