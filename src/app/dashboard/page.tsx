
"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { PlusCircle, Share2, LogOut, Users, Gift, LayoutGrid, Trash2, Settings2, Plus, Coins, MousePointer2, RefreshCw, Sparkles, Heart, CreditCard, Key, Search, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { getWinners, getEvents, deleteWinner, createEvent, updateEvent, deleteEvent, clearWinnersByEvent, getSystemSettings, updateSystemSettings } from '@/app/actions/db-actions';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AdminDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [winners, setWinners] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [newBank, setNewBank] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
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
      const [winnersData, eventsData, sysSettings] = await Promise.all([
        getWinners(user.id, user.role),
        getEvents(user.id, user.role),
        getSystemSettings()
      ]);
      setWinners(winnersData);
      setEvents(eventsData);
      setSettings(sysSettings || { banks: ['Dana', 'OVO', 'GoPay', 'ShopeePay', 'BCA', 'Lainnya'] });
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

  const handleDeleteEvent = async (id: string) => {
    await deleteEvent(id);
    toast({ title: "Event Dihapus", description: "Event dan riwayat pemenangnya telah dihapus." });
    const nextEvents = events.filter(e => e.id !== id);
    setEvents(nextEvents);
    if (nextEvents.length > 0) {
      setSelectedEventId(nextEvents[0].id);
    } else {
      setSelectedEventId('');
    }
    fetchData(currentUser);
  };

  const handleAddBank = async () => {
    if (!newBank.trim()) return;
    const updatedBanks = [...(settings?.banks || []), newBank.trim()];
    await updateSystemSettings({ banks: updatedBanks });
    setNewBank('');
    toast({ title: "Bank Ditambahkan", description: `${newBank} kini tersedia di daftar bank.` });
    fetchData(currentUser);
  };

  const handleRemoveBank = async (idx: number) => {
    const bankToRemove = settings.banks[idx];
    if (bankToRemove === 'Lainnya') {
      toast({ variant: "destructive", title: "Dilarang", description: "Opsi 'Lainnya' tidak boleh dihapus." });
      return;
    }
    const updatedBanks = settings.banks.filter((_: any, i: number) => i !== idx);
    await updateSystemSettings({ banks: updatedBanks });
    toast({ title: "Bank Dihapus", description: "Daftar bank diperbarui." });
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
      <nav className="bg-white border-b px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-accent p-1.5 rounded-lg">
            <Gift className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-lg sm:text-xl tracking-tight hidden sm:inline">LuckyTHR <span className="text-accent">Admin</span></span>
          <span className="font-black text-xl tracking-tight sm:hidden text-accent">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center bg-slate-100 rounded-xl px-3 h-10 border">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <Input 
              placeholder="Cari pemenang..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent border-none h-full text-xs focus-visible:ring-0 w-32"
            />
          </div>
          <Button variant="ghost" className="text-muted-foreground p-2 sm:px-4 rounded-xl font-bold" onClick={handleLogout}>
            <LogOut className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </nav>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="bg-white p-6 sm:p-12 rounded-[2.5rem] shadow-xl border-4 border-dashed border-slate-200 max-w-lg w-full animate-in zoom-in duration-500">
              <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">Halo {currentUser.name}!</h2>
              <p className="text-muted-foreground mt-4 text-sm sm:text-base leading-relaxed">Ayo buat event bagi-bagi THR pertamamu dan sebarkan kebahagiaan.</p>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-8 w-full h-16 bg-accent rounded-2xl shadow-lg font-black text-xl text-white hover:scale-[1.02] transition-transform">
                    <PlusCircle className="w-6 h-6 mr-3" /> Buat Event Baru
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8">
                  <DialogHeader><DialogTitle className="text-2xl font-black">Buat Event Baru 🧧</DialogTitle></DialogHeader>
                  <div className="grid gap-6 py-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nama Event</Label>
                      <Input placeholder="THR Keluarga Besar..." value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="rounded-xl h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nominal (Pisahkan dengan koma)</Label>
                      <Textarea placeholder="1000, 5000, 10000, 50000..." value={newEvent.nominals} onChange={e => setNewEvent({...newEvent, nominals: e.target.value})} className="rounded-xl min-h-[120px] pt-3" />
                    </div>
                  </div>
                  <DialogFooter><Button onClick={handleCreateEvent} className="bg-accent w-full h-14 font-black rounded-xl text-lg text-white">GAS SEKARANG! 🚀</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-2"><LayoutGrid className="w-4 h-4" /> Daftar Event Aktif</h2>
                <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)} className="rounded-xl border-accent text-accent h-9 font-bold">
                  <Plus className="w-4 h-4 mr-1" /> Baru
                </Button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                {events.map((event) => (
                  <button key={event.id} onClick={() => setSelectedEventId(event.id)} className={cn("flex-shrink-0 w-[240px] sm:w-64 p-5 rounded-[2rem] text-left transition-all border-2", selectedEventId === event.id ? "bg-white border-accent shadow-xl shadow-accent/10" : "bg-white border-transparent hover:border-slate-200")}>
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-4", selectedEventId === event.id ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-slate-100 text-slate-400")}>
                      {event.interaction_type === 'angpao' ? <MousePointer2 className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                    </div>
                    <h3 className="font-black text-sm text-slate-800 leading-tight truncate mb-1">{event.title}</h3>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{event.interaction_type === 'angpao' ? 'Pilih Angpao' : 'Roda Putar'}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2.5rem] border shadow-sm">
              <div className="space-y-1">
                <h1 className="text-xl font-black tracking-tight leading-tight">{currentEvent?.title}</h1>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                  <Badge variant="secondary" className="bg-slate-100 text-[8px] px-2 py-0">LIVE</Badge> Monitoring Real-time
                </div>
              </div>
              <Button onClick={() => copyLink(selectedEventId)} className="w-full sm:w-auto bg-accent h-12 rounded-xl font-black px-8 text-white shadow-lg shadow-accent/20 hover:scale-[1.02] transition-transform">
                <Share2 className="w-4 h-4 mr-2" /> BAGIKAN LINK 🧧
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard icon={<Users className="w-5 h-5" />} label="Total Pemenang" value={filteredWinners.length.toString()} trend="ORANG" />
              <StatCard icon={<Coins className="w-5 h-5" />} label="Total THR Keluar" value={`Rp ${totalThr.toLocaleString('id-ID')}`} trend="SALDO" />
              <StatCard icon={<Settings2 className="w-5 h-5" />} label="Mode Main" value={currentEvent?.interaction_type === 'angpao' ? "ANGPAO" : "RODA"} trend="SISTEM" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-6">
                <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
                  <CardHeader className="bg-slate-50 border-b px-6 py-5">
                    <CardTitle className="text-base font-black flex items-center gap-2"><Settings2 className="w-4 h-4" /> Pengaturan Game</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Interaksi Peserta</Label>
                      <div className="grid grid-cols-2 gap-2">
                         <Button variant={currentEvent?.interaction_type === 'angpao' ? 'default' : 'outline'} onClick={async () => { await updateEvent(selectedEventId, { interaction_type: 'angpao' }); fetchData(currentUser); }} className={cn("rounded-xl h-11 text-xs font-bold", currentEvent?.interaction_type === 'angpao' && "bg-accent text-white")}>
                           <MousePointer2 className="w-3.5 h-3.5 mr-2" /> Angpao
                         </Button>
                         <Button variant={currentEvent?.interaction_type === 'wheel' ? 'default' : 'outline'} onClick={async () => { await updateEvent(selectedEventId, { interaction_type: 'wheel' }); fetchData(currentUser); }} className={cn("rounded-xl h-11 text-xs font-bold", currentEvent?.interaction_type === 'wheel' && "bg-accent text-white")}>
                           <RefreshCw className="w-3.5 h-3.5 mr-2" /> Roda
                         </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-xs font-black uppercase tracking-widest text-slate-600">Main Berkali-kali</div>
                      <Switch checked={currentEvent?.allow_multiple_plays} onCheckedChange={async (v) => { await updateEvent(selectedEventId, { allow_multiple_plays: v }); fetchData(currentUser); }} />
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full h-12 rounded-xl border-red-200 text-red-500 font-bold hover:bg-red-50">
                          <XCircle className="w-4 h-4 mr-2" /> Hapus Event Ini
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[2.5rem] p-6 sm:p-10">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-2xl sm:text-3xl font-black">Hapus Event? 🗑️</AlertDialogTitle>
                          <AlertDialogDescription className="text-sm sm:text-base mt-2 leading-relaxed italic">
                            Event "{currentEvent?.title}" akan dihapus permanen. Link play tidak akan bisa diakses lagi.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-6 gap-3 flex flex-col sm:flex-row">
                          <AlertDialogCancel className="h-14 rounded-2xl font-black text-lg border-2 w-full sm:w-auto">Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteEvent(selectedEventId)} className="h-14 rounded-2xl bg-red-600 font-black text-lg text-white shadow-lg w-full sm:w-auto">Hapus Permanen! 🔥</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
                  <CardHeader className="bg-slate-50 border-b px-6 py-5">
                    <CardTitle className="text-base font-black flex items-center gap-2"><CreditCard className="w-4 h-4" /> Master Bank</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-2">
                       <Input placeholder="Nama bank..." value={newBank} onChange={e => setNewBank(e.target.value)} className="rounded-xl h-10 text-xs font-bold" />
                       <Button size="icon" onClick={handleAddBank} className="h-10 w-10 shrink-0 bg-accent text-white rounded-xl"><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar pr-1">
                      {settings?.banks.map((bank: string, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group transition-all">
                          <span className="text-xs font-black text-slate-700">{bank}</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleRemoveBank(idx)} 
                            className="h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={bank === 'Lainnya'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-8">
                <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white h-full">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 border-b px-6 py-5 gap-4">
                    <CardTitle className="text-base font-black">Monitoring Peserta</CardTitle>
                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="rounded-xl border-red-500 text-red-500 font-bold px-4 h-9">
                            <Trash2 className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Reset Semua</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[2.5rem] p-6 sm:p-10">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl sm:text-3xl font-black">Yakin Reset Data? ⚠️</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm sm:text-base mt-2 leading-relaxed italic">Seluruh riwayat pemenang akan dihapus permanen. Peserta bisa ikut memutar lagi.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-6 gap-3 flex flex-col sm:flex-row">
                            <AlertDialogCancel className="h-14 rounded-2xl font-black text-lg border-2 w-full sm:w-auto">Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearWinners} className="h-14 rounded-2xl bg-red-600 font-black text-lg text-white shadow-lg w-full sm:w-auto">Reset Sekarang! 🔥</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-slate-50/30">
                          <TableRow>
                            <TableHead className="pl-6 text-[10px] uppercase tracking-widest font-black">Foto</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-black">Nama & Wallet</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-black">Nominal</TableHead>
                            <TableHead className="text-right pr-6 text-[10px] uppercase tracking-widest font-black">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredWinners.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground font-bold italic text-sm">Belum ada pemenang saat ini...</TableCell></TableRow>
                          ) : filteredWinners.map((winner, idx) => (
                            <TableRow key={idx} className="hover:bg-slate-50/20 border-b group">
                              <TableCell className="pl-6">
                                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 border-white bg-slate-100 shadow-sm">
                                  {winner.photo_url ? <Image src={winner.photo_url} alt={winner.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-400">N/A</div>}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-black text-xs sm:text-sm text-slate-800 leading-tight">{winner.name}</div>
                                <div className="text-[9px] text-muted-foreground font-mono bg-slate-100 px-2 py-0.5 rounded-md mt-1 inline-block truncate max-w-[150px]">{winner.wallet_info}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black px-3 py-1 rounded-lg text-[10px] sm:text-xs tracking-tight">
                                  Rp {winner.amount.toLocaleString('id-ID')}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right pr-6">
                                <Button size="icon" variant="ghost" className="rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteWinner(winner.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="py-12 bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-2">
           <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
             <span>developed by</span>
             <Link href="https://maudigi.com" target="_blank" className="text-accent hover:underline flex items-center gap-1">maudigi.com <Heart className="w-3 h-3 fill-accent" /></Link>
           </div>
           <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">LuckyTHR Engine v15.2.4-PRO-Standalone</p>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  return (
    <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">{value}</p>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl text-accent">{icon}</div>
        </div>
        <div className="mt-4 flex items-center text-[10px] font-black text-accent bg-primary/20 px-3 py-1 rounded-full w-fit uppercase tracking-widest">{trend}</div>
      </CardContent>
    </Card>
  );
}
