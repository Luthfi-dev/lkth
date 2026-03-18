"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, LogOut, Users, Database, Server, Settings, Heart, Save, Plus, Trash2, Key, RefreshCw, Globe, CreditCard } from 'lucide-react';
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
    const savedSession = localStorage.getItem('lucky_thr_session');
    if (!savedSession) {
      router.push('/login');
      return;
    }
    const session = JSON.parse(savedSession);
    if (session.user.role !== 'superadmin' || session.expiry < Date.now()) {
      localStorage.removeItem('lucky_thr_session');
      router.push('/login');
      return;
    }
    fetchAllData();
  }, [router]);

  const handleUpdateSettings = async () => {
    await updateSystemSettings(settings);
    toast({ title: "Berhasil", description: "Pengaturan sistem diperbarui secara permanen." });
  };

  const handleAddBank = () => {
    if (!settings) return;
    setSettings({ ...settings, banks: [...(settings.banks || []), "Bank Baru"] });
    toast({ title: "Ditambahkan", description: "Daftar bank diperbarui di antrian." });
  };

  const handleBankChange = (idx: number, val: string) => {
    const newBanks = [...(settings.banks || [])];
    newBanks[idx] = val;
    setSettings({ ...settings, banks: newBanks });
  };

  const handleRemoveBank = (idx: number) => {
    if (settings.banks[idx] === 'Lainnya') return;
    const newBanks = (settings.banks || []).filter((_: any, i: number) => i !== idx);
    setSettings({ ...settings, banks: newBanks });
  };

  const handleLogout = () => {
    localStorage.removeItem('lucky_thr_session');
    router.push('/login');
  };

  const generateHash = () => {
    if (!plain) return;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(plain, salt);
    setHashed(hash);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><RefreshCw className="animate-spin text-accent w-10 h-10" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <nav className="border-b bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-red-600 w-6 h-6" />
          <span className="font-black text-xl uppercase tracking-tight">Super<span className="text-red-600">Admin</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl font-bold"><Key className="w-3 h-3 mr-2" /> Encrypt</Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem]">
              <DialogHeader><DialogTitle className="font-black">Bcrypt Encryptor 🛡️</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <Input placeholder="Password mentah..." value={plain} onChange={e => setPlain(e.target.value)} className="rounded-xl h-12" />
                <Button onClick={generateHash} className="w-full bg-red-600 rounded-xl h-12 font-black">Generate</Button>
                {hashed && <div className="p-4 bg-slate-100 rounded-xl text-[10px] break-all font-mono text-red-600">{hashed}</div>}
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" className="font-bold text-slate-500" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Keluar
          </Button>
        </div>
      </nav>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SystemStat icon={<Users className="w-5 h-5" />} label="Users" value={users.length} bg="bg-blue-50" color="text-blue-600" />
          <SystemStat icon={<Database className="w-5 h-5" />} label="Events" value={events.length} bg="bg-green-50" color="text-green-600" />
          <SystemStat icon={<Server className="w-5 h-5" />} label="Winners" value={winners.length} bg="bg-purple-50" color="text-purple-600" />
          <SystemStat icon={<Globe className="w-5 h-5" />} label="System" value="SAFE" bg="bg-emerald-50" color="text-emerald-600" />
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="bg-white border rounded-2xl h-14 p-1 mb-8">
            <TabsTrigger value="users" className="rounded-xl px-8 font-bold h-full">User Management</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl px-8 font-bold h-full">Global Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="bg-slate-50 border-b px-6 py-5"><CardTitle className="text-lg font-black">👥 System Users</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead className="pl-6 font-black text-[10px] uppercase">Name</TableHead><TableHead className="font-black text-[10px] uppercase">Email</TableHead><TableHead className="font-black text-[10px] uppercase">Role</TableHead></TableRow></TableHeader>
                  <TableBody>{users.map((u, i) => (<TableRow key={i}><TableCell className="font-bold pl-6">{u.name}</TableCell><TableCell className="text-slate-500">{u.email}</TableCell><TableCell><Badge className={u.role === 'superadmin' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}>{u.role}</Badge></TableCell></TableRow>))}</TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white">
              <CardHeader className="bg-slate-50 border-b"><CardTitle className="text-lg font-black">🌐 Global Config</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">App Title</Label>
                  <Input value={settings?.siteTitle} onChange={e => setSettings({...settings, siteTitle: e.target.value})} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Footer Text</Label>
                  <Input value={settings?.footerText} onChange={e => setSettings({...settings, footerText: e.target.value})} className="h-12 rounded-xl" />
                </div>
                <Button onClick={handleUpdateSettings} className="w-full bg-accent h-16 rounded-2xl font-black text-lg text-white">SAVE ALL CHANGES 🚀</Button>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white">
              <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-black">🏦 Bank & E-Wallet</CardTitle>
                <Button size="sm" onClick={handleAddBank} variant="outline" className="rounded-xl font-bold h-9"><Plus className="w-4 h-4 mr-1" /> Add Bank</Button>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                  {settings?.banks?.map((b: string, i: number) => (
                    <div key={i} className="flex gap-2 group">
                      <Input value={b} onChange={e => handleBankChange(i, e.target.value)} className="h-11 rounded-xl font-bold" />
                      {b !== 'Lainnya' && <Button size="icon" variant="ghost" onClick={() => handleRemoveBank(i)} className="text-red-400 group-hover:opacity-100 opacity-0 transition-opacity"><Trash2 className="w-4 h-4" /></Button>}
                    </div>
                  ))}
                </div>
                <Button onClick={handleUpdateSettings} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl mt-4">💾 SAVE BANK LIST</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="py-8 bg-white border-t mt-auto text-center">
        <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-xs">
          <span>developed by</span>
          <Link href="https://maudigi.com" target="_blank" className="text-accent hover:underline flex items-center gap-1">maudigi.com <Heart className="w-3 h-3 fill-accent" /></Link>
        </div>
      </footer>
    </div>
  );
}

function SystemStat({ icon, label, value, color, bg }: { icon: any, label: string, value: any, color: string, bg: string }) {
  return (
    <Card className="rounded-[2rem] border-none shadow-sm bg-white p-6 flex items-center gap-4">
      <div className={`p-4 rounded-2xl ${bg} ${color}`}>{icon}</div>
      <div>
        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </Card>
  );
}
