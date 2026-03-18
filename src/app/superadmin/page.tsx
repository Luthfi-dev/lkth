"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, LogOut, Users, Database, Server, Terminal, Settings, Heart, Save, Plus, Trash2, Key, RefreshCw, LayoutGrid, Globe, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getEvents, getWinners, getAllUsers, getSystemSettings, updateSystemSettings } from '@/app/actions/db-actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import bcrypt from 'bcryptjs';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Encrypt Tool State
  const [plain, setPlain] = useState('');
  const [hashed, setHashed] = useState('');

  const fetchAllData = async () => {
    try {
      const [u, e, w, s] = await Promise.all([
        getAllUsers(),
        getEvents(undefined, 'superadmin'),
        getWinners(undefined, 'superadmin'),
        getSystemSettings()
      ]);
      setUsers(u);
      setEvents(e);
      setWinners(w);
      setSettings(s || { siteTitle: 'Lucky THR', banks: ['Dana', 'OVO', 'GoPay', 'ShopeePay', 'BCA', 'Lainnya'], footerText: 'maudigi.com' });
    } catch (err) {
      console.error("Error fetching superadmin data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('lucky_thr_admin');
    if (!savedUser) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(savedUser);
    if (user.role !== 'superadmin') {
      router.push('/dashboard');
      return;
    }
    fetchAllData();
  }, []);

  const handleUpdateSettings = async () => {
    await updateSystemSettings(settings);
    toast({ title: "Berhasil", description: "Pengaturan sistem diperbarui." });
  };

  const handleAddBank = () => {
    if (!settings) return;
    const currentBanks = settings.banks || [];
    setSettings({ ...settings, banks: [...currentBanks, "Bank Baru"] });
  };

  const handleBankChange = (idx: number, val: string) => {
    const newBanks = [...(settings.banks || [])];
    newBanks[idx] = val;
    setSettings({ ...settings, banks: newBanks });
  };

  const handleRemoveBank = (idx: number) => {
    const bankToRemove = settings.banks[idx];
    if (bankToRemove === 'Lainnya') {
      toast({ variant: "destructive", title: "Dilarang", description: "Opsi 'Lainnya' tidak boleh dihapus demi fungsionalitas sistem." });
      return;
    }
    const newBanks = (settings.banks || []).filter((_: any, i: number) => i !== idx);
    setSettings({ ...settings, banks: newBanks });
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

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><RefreshCw className="animate-spin text-accent w-10 h-10" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <nav className="border-b bg-white px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-red-500 p-2 rounded-lg shadow-lg shadow-red-500/20">
            <ShieldAlert className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-lg sm:text-xl tracking-tight uppercase">Super<span className="text-red-500">Admin</span></span>
          <Badge variant="outline" className="ml-2 bg-slate-100 border-slate-200 text-slate-500 hidden sm:inline-flex">
            v15.2.4-PRO
          </Badge>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-slate-200 text-xs rounded-xl h-10 font-bold hidden sm:flex">
                <Key className="w-3 h-3 mr-2" /> Bcrypt Tool
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-slate-200 text-slate-900 rounded-[2.5rem]">
              <DialogHeader>
                <DialogTitle className="text-xl font-black">Bcrypt Encryptor 🛡️</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input placeholder="Password mentah..." value={plain} onChange={e => setPlain(e.target.value)} className="rounded-xl h-12" />
                <Button onClick={generateHash} className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 font-black">Generate Hash</Button>
                {hashed && <div className="p-4 bg-slate-100 rounded-xl text-[10px] break-all font-mono border border-slate-200 text-red-600">{hashed}</div>}
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold" onClick={handleLogout}>
            <LogOut className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </nav>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SystemStat icon={<Users className="w-5 h-5" />} label="Users" value={users.length} color="text-blue-600" bg="bg-blue-50" />
          <SystemStat icon={<Database className="w-5 h-5" />} label="Events" value={events.length} color="text-green-600" bg="bg-green-50" />
          <SystemStat icon={<Server className="w-5 h-5" />} label="Winners" value={winners.length} color="text-purple-600" bg="bg-purple-50" />
          <SystemStat icon={<Globe className="w-5 h-5" />} label="Server" value="ONLINE" color="text-emerald-600" bg="bg-emerald-50" />
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="bg-white border p-1 mb-6 flex overflow-x-auto no-scrollbar justify-start rounded-2xl h-14">
            <TabsTrigger value="users" className="data-[state=active]:bg-slate-100 data-[state=active]:shadow-none rounded-xl px-6 font-bold h-full">Manajemen User</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-100 data-[state=active]:shadow-none rounded-xl px-6 font-bold h-full">Pengaturan Sistem</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="bg-slate-50 border-b px-6 py-5">
                <CardTitle className="text-lg font-black flex items-center gap-2"><Users className="w-5 h-5" /> Daftar Pengguna Sistem</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="pl-6 font-black uppercase tracking-widest text-[10px]">Nama</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Email</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Role</TableHead>
                        <TableHead className="text-right pr-6 font-black uppercase tracking-widest text-[10px]">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user, idx) => (
                        <TableRow key={idx} className="hover:bg-slate-50/50">
                          <TableCell className="font-bold pl-6">{user.name}</TableCell>
                          <TableCell className="text-slate-500">{user.email}</TableCell>
                          <TableCell>
                            <Badge className={user.role === 'superadmin' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-blue-100 text-blue-600 border-blue-200'}>
                              {user.role || 'admin'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-accent rounded-xl"><Settings className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white h-fit">
                <CardHeader className="bg-slate-50 border-b px-6 py-5">
                  <CardTitle className="text-lg font-black flex items-center gap-2"><Globe className="w-5 h-5" /> Konfigurasi Global</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Judul Aplikasi Play</Label>
                    <Input 
                      value={settings?.siteTitle} 
                      onChange={e => setSettings({...settings, siteTitle: e.target.value})}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Teks Footer</Label>
                    <Input 
                      value={settings?.footerText} 
                      onChange={e => setSettings({...settings, footerText: e.target.value})}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <Button onClick={handleUpdateSettings} className="w-full bg-accent hover:bg-accent/90 h-16 rounded-2xl font-black text-lg text-white shadow-lg shadow-accent/20">
                    <Save className="w-5 h-5 mr-2" /> SIMPAN PERUBAHAN
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-slate-50 border-b px-6 py-5 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-black flex items-center gap-2"><CreditCard className="w-5 h-5" /> Master Bank & E-Wallet</CardTitle>
                  <Button size="sm" onClick={handleAddBank} variant="outline" className="border-accent text-accent rounded-xl font-bold h-9">
                    <Plus className="w-4 h-4 mr-1" /> Tambah
                  </Button>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                    {settings?.banks?.map((bank: string, idx: number) => (
                      <div key={idx} className="flex gap-2 group">
                        <Input 
                          value={bank} 
                          onChange={e => handleBankChange(idx, e.target.value)}
                          className="h-11 rounded-xl font-bold"
                        />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleRemoveBank(idx)} 
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 h-11 w-11 shrink-0 rounded-xl"
                          disabled={bank === 'Lainnya'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 mt-4">
                    <p className="text-[10px] text-slate-500 italic font-medium leading-relaxed">
                      * Daftar bank ini akan muncul sebagai opsi metode pencairan THR bagi peserta. Opsi "Lainnya" dilindungi oleh sistem.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="py-12 bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-2 text-center">
           <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
             <span>developed by</span>
             <Link href="https://maudigi.com" target="_blank" className="text-accent hover:underline flex items-center gap-1">
               maudigi.com <Heart className="w-3 h-3 fill-accent" />
             </Link>
           </div>
        </div>
      </footer>
    </div>
  );
}

function SystemStat({ icon, label, value, color, bg }: { icon: any, label: string, value: any, color: string, bg: string }) {
  return (
    <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
      <CardContent className="p-5 sm:p-6 flex items-center gap-4">
        <div className={`p-4 rounded-2xl ${bg} ${color}`}>{icon}</div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1.5">{label}</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
