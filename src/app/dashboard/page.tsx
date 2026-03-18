"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { PlusCircle, Share2, LogOut, Users, Gift, LayoutGrid, Trash2, Settings2, Plus, Coins, MousePointer2, RefreshCw, Sparkles, Heart, CreditCard, Search, XCircle, Save, Type, MessageCircle, Link as LinkIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
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
  
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editNominals, setEditNominals] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    message: 'Selamat Hari Raya $nama! Semoga berkah selalu.',
    nominals: '1000, 2000, 5000, 10000, 20000, 50000, 100000',
    allow_multiple_plays: false,
    interaction_type: 'angpao'
  });

  useEffect(() => {
    const savedSession = localStorage.getItem('lucky_thr_session');
    if (!savedSession) {
      router.push('/login');
      return;
    }
    const session = JSON.parse(savedSession);
    if (session.expiry < Date.now()) {
      localStorage.removeItem('lucky_thr_session');
      router.push('/login');
      return;
    }
    setCurrentUser(session.user);
    fetchData(session.user);
  }, [router]);

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
      
      if (eventsData.length > 0) {
        const initialEvent = selectedEventId ? eventsData.find((e: any) => e.id === selectedEventId) : eventsData[0];
        if (initialEvent) {
          setSelectedEventId(initialEvent.id);
          setEditTitle(initialEvent.title);
          setEditMessage(initialEvent.message);
          setEditNominals(initialEvent.nominals.map((n: any) => n.value).join(', '));
        }
      }
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lucky_thr_session');
    router.push('/login');
  };

  const handleSaveEventDetails = async () => {
    if (!selectedEventId) return;
    
    const nominalArray = editNominals.split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n))
      .map(n => ({ value: n, blocked: false }));

    try {
      await updateEvent(selectedEventId, {
        title: editTitle,
        message: editMessage,
        nominals: nominalArray
      });
      toast({ title: "Berhasil", description: "Detail event telah diperbarui." });
      fetchData(currentUser);
    } catch (err) {
      toast({ variant: "destructive", title: "Gagal", description: "Terjadi kesalahan saat menyimpan." });
    }
  };

  const handleDeleteWinner = async (id: string) => {
    await deleteWinner(id);
    toast({ title: "Dihapus", description: "Data pemenang telah dihapus." });
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
    setNewEvent({
      title: '',
      message: 'Selamat Hari Raya $nama! Semoga berkah selalu.',
      nominals: '1000, 2000, 5000, 10000, 20000, 50000, 100000',
      allow_multiple_plays: false,
      interaction_type: 'angpao'
    });
  };

  const handleDeleteEvent = async () => {
    if (!selectedEventId) return;
    await deleteEvent(selectedEventId);
    toast({ title: "Dihapus", description: "Event telah dihapus permanen." });
    const remaining = events.filter(e => e.id !== selectedEventId);
    if (remaining.length > 0) {
      setSelectedEventId(remaining[0].id);
    } else {
      setSelectedEventId('');
    }
    fetchData(currentUser);
  };

  const handleAddBank = async () => {
    if (!newBank.trim()) return;
    const updatedBanks = [...(settings?.banks || []), newBank.trim()];
    setSettings({...settings, banks: updatedBanks});
    setNewBank('');
    toast({ title: "Siap Disimpan", description: `${newBank} ditambahkan ke daftar antrian.` });
  };

  const handleSaveBanks = async () => {
    await updateSystemSettings({ banks: settings.banks });
    toast({ title: "Tersimpan", description: "Daftar bank sistem telah diperbarui." });
    fetchData(currentUser);
  };

  const handleRemoveBank = (idx: number) => {
    if (settings.banks[idx] === 'Lainnya') return;
    const updatedBanks = settings.banks.filter((_: any, i: number) => i !== idx);
    setSettings({...settings, banks: updatedBanks});
  };

  const copyLink = (id: string) => {
    const link = `${window.location.origin}/play/${id}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link Tersalin", description: "Tautan event telah disalin ke clipboard." });
  };

  const filteredWinners = winners.filter(w => 
    w.event_id === selectedEventId && w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalThr = filteredWinners.reduce((acc, curr) => acc + curr.amount, 0);

  if (isLoading || !currentUser) return <div className="min-h-screen flex items-center justify-center"><RefreshCw className="animate-spin text-accent" /></div>;

  const currentEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Gift className="text-accent w-6 h-6" />
          <span className="font-black text-xl text-accent">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="font-bold text-muted-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Keluar
          </Button>
        </div>
      </nav>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-8">
        {events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border shadow-sm">
             <Sparkles className="w-16 h-16 text-accent mx-auto mb-6" />
             <h2 className="text-3xl font-black">Selamat Datang, {currentUser.name}</h2>
             <p className="mt-4 text-muted-foreground">Mulai buat event THR pertama Anda sekarang.</p>
             <Button onClick={() => setIsDialogOpen(true)} className="mt-8 bg-accent h-14 px-10 rounded-2xl font-black gap-2">
               <Plus className="w-5 h-5" /> BUAT EVENT BARU
             </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
              <button 
                onClick={() => setIsDialogOpen(true)} 
                className="flex-shrink-0 w-48 h-24 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-2 hover:bg-white hover:border-accent transition-all group"
              >
                <Plus className="w-6 h-6 text-slate-300 group-hover:text-accent" />
                <span className="text-xs font-black text-slate-400 group-hover:text-accent">TAMBAH EVENT</span>
              </button>
              
              {events.map((e) => (
                <button 
                  key={e.id} 
                  onClick={() => {
                    setSelectedEventId(e.id);
                    setEditTitle(e.title);
                    setEditMessage(e.message);
                    setEditNominals(e.nominals.map((n: any) => n.value).join(', '));
                  }} 
                  className={cn(
                    "flex-shrink-0 w-64 h-24 p-5 rounded-[2rem] text-left transition-all border-2", 
                    selectedEventId === e.id ? "bg-white border-accent shadow-xl" : "bg-white border-transparent"
                  )}
                >
                  <h3 className="font-black text-sm truncate">{e.title}</h3>
                  <Badge variant="secondary" className="mt-2 text-[8px] uppercase">{e.interaction_type}</Badge>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                <Card className="rounded-[2.5rem] border-none shadow-sm">
                  <CardHeader><CardTitle className="text-lg font-black flex items-center gap-2"><Settings2 className="w-5 h-5" /> Pengaturan Event</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">Judul Event</Label>
                      <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">Pesan Ucapan</Label>
                      <Textarea value={editMessage} onChange={e => setEditMessage(e.target.value)} className="rounded-xl min-h-[80px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">Nominal (Pemisah Koma)</Label>
                      <Textarea value={editNominals} onChange={e => setEditNominals(e.target.value)} className="rounded-xl h-20" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <span className="text-xs font-black uppercase">Main Berkali-kali</span>
                      <Switch checked={currentEvent?.allow_multiple_plays} onCheckedChange={async (v) => { await updateEvent(selectedEventId, { allow_multiple_plays: v }); fetchData(currentUser); }} />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Button onClick={handleSaveEventDetails} className="w-full h-12 rounded-xl bg-accent font-black gap-2">
                        <Save className="w-4 h-4" /> SIMPAN PERUBAHAN
                      </Button>
                      <Button onClick={() => copyLink(selectedEventId)} variant="outline" className="w-full h-12 rounded-xl border-accent text-accent font-black gap-2">
                        <LinkIcon className="w-4 h-4" /> BAGIKAN TAUTAN
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" className="w-full h-12 rounded-xl text-red-500 font-black gap-2 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" /> HAPUS EVENT
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[2.5rem]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Event Ini?</AlertDialogTitle>
                            <AlertDialogDescription>Semua data pemenang akan tetap ada, namun link permainan tidak akan bisa diakses lagi.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>BATAL</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteEvent} className="bg-red-600 hover:bg-red-700">HAPUS PERMANEN</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-none shadow-sm">
                  <CardHeader><CardTitle className="text-lg font-black flex items-center gap-2"><CreditCard className="w-5 h-5" /> Master Bank</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input placeholder="Nama bank baru..." value={newBank} onChange={e => setNewBank(e.target.value)} className="rounded-xl" />
                      <Button onClick={handleAddBank} className="bg-accent rounded-xl px-4"><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 no-scrollbar">
                      {settings?.banks.map((b: string, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                          <span className="text-xs font-black">{b}</span>
                          {b !== 'Lainnya' && <Button size="icon" variant="ghost" onClick={() => handleRemoveBank(i)} className="h-8 w-8 text-red-400 opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></Button>}
                        </div>
                      ))}
                    </div>
                    <Button onClick={handleSaveBanks} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black gap-2">
                      <Save className="w-4 h-4" /> SIMPAN DAFTAR BANK
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-8">
                <Card className="rounded-[2.5rem] border-none shadow-sm h-full">
                  <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle className="text-lg font-black flex items-center gap-2"><Users className="w-5 h-5" /> Monitoring Pemenang</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          placeholder="Cari pemenang..." 
                          value={searchTerm} 
                          onChange={e => setSearchTerm(e.target.value)} 
                          className="pl-9 h-10 w-48 rounded-xl bg-slate-50 border-none"
                        />
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-600 border-none font-bold px-4 h-10">Rp {totalThr.toLocaleString('id-ID')}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-6 text-[10px] font-black uppercase">Pemenang</TableHead>
                          <TableHead className="text-[10px] font-black uppercase">Nominal</TableHead>
                          <TableHead className="text-[10px] font-black uppercase">Alamat IP</TableHead>
                          <TableHead className="text-right pr-6 text-[10px] font-black uppercase">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredWinners.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-20 text-slate-400 font-bold">Belum ada pemenang di event ini.</TableCell>
                          </TableRow>
                        ) : (
                          filteredWinners.map((w, i) => (
                            <TableRow key={i}>
                              <TableCell className="pl-6">
                                <div className="font-black text-sm">{w.name}</div>
                                <div className="text-[10px] text-muted-foreground">{w.wallet_info}</div>
                              </TableCell>
                              <TableCell className="font-black text-emerald-600">Rp {w.amount.toLocaleString('id-ID')}</TableCell>
                              <TableCell className="text-[10px] font-mono text-muted-foreground">{w.ip_address || '-'}</TableCell>
                              <TableCell className="text-right pr-6">
                                <Button size="icon" variant="ghost" onClick={() => handleDeleteWinner(w.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[2.5rem] p-10 max-w-lg border-none shadow-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-black">Buat Event Baru</DialogTitle></DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Judul Event</Label>
              <Input placeholder="Contoh: THR Keluarga Besar" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Pesan Ucapan</Label>
              <Textarea value={newEvent.message} onChange={e => setNewEvent({...newEvent, message: e.target.value})} className="rounded-xl h-24" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Nominal THR (Pemisah Koma)</Label>
              <Textarea placeholder="1000, 5000, 10000..." value={newEvent.nominals} onChange={e => setNewEvent({...newEvent, nominals: e.target.value})} className="rounded-xl h-24" />
            </div>
          </div>
          <DialogFooter><Button onClick={handleCreateEvent} className="w-full h-14 bg-accent font-black rounded-xl text-lg shadow-lg">BUAT SEKARANG</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="py-8 bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 font-bold text-xs flex items-center justify-center gap-2">
          <span>developed by</span>
          <Link href="https://maudigi.com" target="_blank" className="text-accent hover:underline flex items-center gap-1">maudigi.com <Heart className="w-3 h-3 fill-accent" /></Link>
        </div>
      </footer>
    </div>
  );
}
