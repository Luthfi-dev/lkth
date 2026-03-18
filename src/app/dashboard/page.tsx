"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { PlusCircle, Copy, LogOut, Users, Gift, Share2, Search, Database, Trash2, Settings2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { getWinners, getEvents, deleteWinner, createEvent, updateEvent } from '@/app/actions/db-actions';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function AdminDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [winners, setWinners] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  
  // State for New Event Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    message: 'Selamat Hari Raya $nama! Semoga berkah selalu.',
    nominals: '10000,20000,50000,100000',
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
    const nominalArray = newEvent.nominals.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
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

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/play/${id}`);
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
                className="bg-transparent font-semibold text-accent border-none focus:ring-0 cursor-pointer"
              >
                {events.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={() => copyLink(selectedEventId)} variant="outline" className="flex-1 sm:flex-none border-primary text-primary">
              <Share2 className="w-4 h-4 mr-2" /> Salin Link
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 sm:flex-none bg-accent hover:bg-accent/90">
                  <PlusCircle className="w-4 h-4 mr-2" /> Event Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Buat Event Baru</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Judul Event</Label>
                    <Input placeholder="THR Keluarga..." value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Pesan Kartu Pemenang</Label>
                    <Input placeholder="Selamat Hari Raya $nama..." value={newEvent.message} onChange={e => setNewEvent({...newEvent, message: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nominal THR (pisahkan dengan koma)</Label>
                    <Input placeholder="5000, 10000, 20000" value={newEvent.nominals} onChange={e => setNewEvent({...newEvent, nominals: e.target.value})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateEvent} className="bg-accent">Simpan Event</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Pemenang" value={filteredWinners.length.toString()} trend="Event Ini" />
          <StatCard icon={<Gift className="w-5 h-5" />} label="Total THR Keluar" value={`Rp ${totalThr.toLocaleString('id-ID')}`} trend="Saldo Keluar" />
          <StatCard icon={<Database className="w-5 h-5" />} label="Status Link" value={currentEvent?.is_active ? "Aktif" : "Nonaktif"} trend="Live" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 border-none shadow-sm h-fit">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Settings2 className="w-4 h-4" /> Pengaturan Akses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
                <div>
                  <p className="font-bold text-sm">Izinkan Main Berkali-kali</p>
                  <p className="text-[10px] text-muted-foreground">Matikan sistem cek IP/Device lock</p>
                </div>
                <Switch 
                  checked={currentEvent?.allow_multiple_plays} 
                  onCheckedChange={() => toggleMultiPlay(selectedEventId, currentEvent?.allow_multiple_plays)} 
                />
              </div>
              
              <div className="space-y-2">
                 <Label className="text-xs">Nominal Dalam Roda</Label>
                {currentEvent?.nominals.map((val: number) => (
                  <div key={val} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border text-sm">
                    <span className="font-bold">Rp {val.toLocaleString('id-ID')}</span>
                    <Badge variant="outline" className="bg-white">Aktif</Badge>
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
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWinners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Belum ada pemenang di event ini</TableCell>
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
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {winner.wallet_info}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 font-bold">
                          Rp {winner.amount.toLocaleString('id-ID')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => {
                            navigator.clipboard.writeText(winner.wallet_info);
                            toast({ title: "Tersalin", description: "Nomor rekening telah disalin." });
                          }}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteWinner(winner.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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