"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, LogOut, Users, Database, Server, Terminal, Settings, Heart, Save, Plus, Trash2, Key } from 'lucide-react';
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

  useEffect(() => {
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
        setSettings(s);
      } catch (err) {
        console.error("Error fetching superadmin data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleUpdateSettings = async () => {
    await updateSystemSettings(settings);
    toast({ title: "Berhasil", description: "Pengaturan sistem diperbarui." });
  };

  const handleAddBank = () => {
    setSettings({ ...settings, banks: [...settings.banks, "Bank Baru"] });
  };

  const handleBankChange = (idx: number, val: string) => {
    const newBanks = [...settings.banks];
    newBanks[idx] = val;
    setSettings({ ...settings, banks: newBanks });
  };

  const handleRemoveBank = (idx: number) => {
    const newBanks = settings.banks.filter((_: any, i: number) => i !== idx);
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

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Terminal className="animate-spin text-red-500 w-10 h-10" /></div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-red-500 p-2 rounded-lg shadow-lg shadow-red-500/20">
            <ShieldAlert className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight uppercase">Super<span className="text-red-500">Admin</span> Engine</span>
          <Badge variant="outline" className="ml-2 bg-slate-800 border-slate-700 text-slate-400">
            v3.0.0-PRO
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-slate-800 border-slate-700 text-xs">
                <Key className="w-3 h-3 mr-2" /> Encrypt Tool
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle>Bcrypt Tool</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input placeholder="Password mentah..." value={plain} onChange={e => setPlain(e.target.value)} className="bg-slate-800 border-slate-700" />
                <Button onClick={generateHash} className="w-full bg-red-600 hover:bg-red-700">Generate Hash</Button>
                {hashed && <div className="p-3 bg-black rounded text-[10px] break-all font-mono">{hashed}</div>}
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Keluar
          </Button>
        </div>
      </nav>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SystemStat icon={<Users className="w-5 h-5" />} label="Total Pengguna" value={users.length} color="text-blue-400" />
          <SystemStat icon={<Database className="w-5 h-5" />} label="Total Events" value={events.length} color="text-green-400" />
          <SystemStat icon={<Server className="w-5 h-5" />} label="Total Transaksi" value={winners.length} color="text-purple-400" />
          <SystemStat icon={<Terminal className="w-5 h-5" />} label="Status Server" value="ONLINE" color="text-emerald-400" />
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="bg-slate-950 border border-slate-800 p-1 mb-6">
            <TabsTrigger value="users" className="data-[state=active]:bg-slate-800">Manajemen User</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-800">Pengaturan Sistem</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="bg-slate-950 border-slate-800 rounded-[2rem] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
                <CardTitle className="text-lg flex items-center gap-2"><Users className="w-4 h-4" /> Manajemen Pengguna</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400 pl-6">Nama</TableHead>
                      <TableHead className="text-slate-400">Email</TableHead>
                      <TableHead className="text-slate-400">Role</TableHead>
                      <TableHead className="text-right text-slate-400 pr-6">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, idx) => (
                      <TableRow key={idx} className="border-slate-800 hover:bg-slate-900/50">
                        <TableCell className="font-bold pl-6">{user.name}</TableCell>
                        <TableCell className="text-slate-400 text-xs">{user.email}</TableCell>
                        <TableCell>
                          <Badge className={user.role === 'superadmin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}>
                            {user.role || 'admin'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><Settings className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-slate-950 border-slate-800 rounded-[2rem] overflow-hidden h-fit">
                <CardHeader className="border-b border-slate-800">
                  <CardTitle className="text-lg flex items-center gap-2"><Settings className="w-4 h-4" /> Global Config</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-slate-400">Judul Aplikasi Play</Label>
                    <Input 
                      value={settings?.siteTitle} 
                      onChange={e => setSettings({...settings, siteTitle: e.target.value})}
                      className="bg-slate-900 border-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Footer Text</Label>
                    <Input 
                      value={settings?.footerText} 
                      onChange={e => setSettings({...settings, footerText: e.target.value})}
                      className="bg-slate-900 border-slate-800"
                    />
                  </div>
                  <Button onClick={handleUpdateSettings} className="w-full bg-red-600 hover:bg-red-700 h-12">
                    <Save className="w-4 h-4 mr-2" /> Simpan Konfigurasi
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-950 border-slate-800 rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b border-slate-800 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2"><Database className="w-4 h-4" /> Master Data Bank</CardTitle>
                  <Button size="sm" onClick={handleAddBank} variant="outline" className="bg-slate-900 border-slate-800"><Plus className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
                    {settings?.banks.map((bank: string, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <Input 
                          value={bank} 
                          onChange={e => handleBankChange(idx, e.target.value)}
                          className="bg-slate-900 border-slate-800 h-10"
                        />
                        <Button size="icon" variant="ghost" onClick={() => handleRemoveBank(idx)} className="text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="py-8 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-2">
           <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
             <span>by</span>
             <Link href="https://maudigi.com" target="_blank" className="text-red-500 hover:underline flex items-center gap-1">
               maudigi.com <Heart className="w-3 h-3 fill-red-500" />
             </Link>
           </div>
           <p className="text-[10px] text-slate-600 uppercase tracking-widest">© 2024 LuckyTHR Engine v3.0.0-SuperAdmin</p>
        </div>
      </footer>
    </div>
  );
}

function SystemStat({ icon, label, value, color }: { icon: any, label: string, value: any, color: string }) {
  return (
    <Card className="bg-slate-950 border-slate-800 rounded-2xl overflow-hidden">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-slate-900 ${color}`}>{icon}</div>
        <div>
          <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">{label}</p>
          <p className="text-2xl font-black">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
