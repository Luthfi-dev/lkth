"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, LogOut, Users, Database, Server, Settings, Heart, Save, Plus, Trash2, Key, RefreshCw, Globe, CreditCard, Layout, ImageIcon, Type, LinkIcon, LayoutGrid, Zap, Shield, Gift, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getEvents, getWinners, getAllUsers, getSystemSettings, updateSystemSettings } from '@/app/actions/db-actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const defaultHomepage = {
    hero: {
      title: "Bagikan Kebahagiaan Lewat Roda Keberuntungan",
      description: "Platform interaktif untuk berbagi THR kepada keluarga, teman, atau komunitas dengan cara yang seru dan transparan.",
      imageUrl: "https://picsum.photos/seed/lucky-thr/1200/800"
    },
    features: [
      { id: "f1", title: "Cepat & Mudah", description: "Hanya butuh 2 menit untuk membuat event dan menyebarkan link ke grup WA.", icon: "Zap" },
      { id: "f2", title: "Anti-Cheat Berbasis IP", description: "Sistem pengunci IP memastikan setiap orang hanya bisa memutar sekali meskipun ganti browser.", icon: "Shield" },
      { id: "f3", title: "Custom Nominal", description: "Atur sendiri nominal THR yang tersedia, mulai dari receh sampai jutaan!", icon: "Gift" }
    ],
    footer: {
      copyright: "© 2024 LuckyTHR. Rayakan hari raya dengan sukacita.",
      linkText: "maudigi.com",
      linkUrl: "https://maudigi.com"
    }
  };

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
      
      const siteSettings = s || {};
      setSettings({
        siteTitle: siteSettings.siteTitle || 'Lucky THR',
        banks: siteSettings.banks || ['Dana', 'OVO', 'GoPay', 'ShopeePay', 'BCA', 'Lainnya'],
        footerText: siteSettings.footerText || 'maudigi.com',
        homepage: siteSettings.homepage || defaultHomepage
      });
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
    toast({ title: "Berhasil", description: "Pengaturan sistem telah diperbarui." });
    fetchAllData();
  };

  const handleAddBank = () => {
    if (!settings) return;
    setSettings({ ...settings, banks: [...(settings.banks || []), "Bank Baru"] });
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

  const handleUpdateHero = (field: string, value: string) => {
    setSettings({
      ...settings,
      homepage: {
        ...settings.homepage,
        hero: { ...settings.homepage.hero, [field]: value }
      }
    });
  };

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateHero('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddFeature = () => {
    const newFeature = {
      id: Math.random().toString(36).substr(2, 9),
      title: "Fitur Baru",
      description: "Deskripsi fitur baru anda...",
      icon: "Zap"
    };
    setSettings({
      ...settings,
      homepage: {
        ...settings.homepage,
        features: [...(settings.homepage.features || []), newFeature]
      }
    });
  };

  const handleUpdateFeature = (id: string, field: string, value: string) => {
    const updatedFeatures = settings.homepage.features.map((f: any) => 
      f.id === id ? { ...f, [field]: value } : f
    );
    setSettings({
      ...settings,
      homepage: { ...settings.homepage, features: updatedFeatures }
    });
  };

  const handleRemoveFeature = (id: string) => {
    const updatedFeatures = settings.homepage.features.filter((f: any) => f.id !== id);
    setSettings({
      ...settings,
      homepage: { ...settings.homepage, features: updatedFeatures }
    });
  };

  const handleUpdateFooter = (field: string, value: string) => {
    setSettings({
      ...settings,
      homepage: {
        ...settings.homepage,
        footer: { ...settings.homepage.footer, [field]: value }
      }
    });
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
      <nav className="border-b bg-white px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <ShieldAlert className="text-red-600 w-5 h-5 sm:w-6 sm:h-6" />
          <span className="font-black text-lg sm:text-xl uppercase tracking-tight">Super<span className="text-red-600">Admin</span></span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl font-bold h-9 px-3"><Key className="w-3.5 h-3.5 mr-1.5" /> Enkripsi</Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] max-w-sm sm:max-w-lg">
              <DialogHeader><DialogTitle className="font-black text-center">Bcrypt Encryptor</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <Input placeholder="Password mentah..." value={plain} onChange={e => setPlain(e.target.value)} className="rounded-xl h-12" />
                <Button onClick={generateHash} className="w-full bg-red-600 rounded-xl h-12 font-black">Generate</Button>
                {hashed && <div className="p-4 bg-slate-100 rounded-xl text-[10px] break-all font-mono text-red-600 border border-dashed border-red-200">{hashed}</div>}
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="sm" className="font-bold text-slate-500 h-9" onClick={handleLogout}>
            <LogOut className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </nav>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8 overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <SystemStat icon={<Users className="w-5 h-5" />} label="Users" value={users.length} bg="bg-blue-50" color="text-blue-600" />
          <SystemStat icon={<Database className="w-5 h-5" />} label="Events" value={events.length} bg="bg-green-50" color="text-green-600" />
          <SystemStat icon={<Server className="w-5 h-5" />} label="Winners" value={winners.length} bg="bg-purple-50" color="text-purple-600" />
          <SystemStat icon={<Globe className="w-5 h-5" />} label="System" value="SAFE" bg="bg-emerald-50" color="text-emerald-600" />
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="bg-white border rounded-2xl h-14 p-1 mb-8 overflow-x-auto no-scrollbar flex justify-start sm:justify-center items-center gap-1 w-full max-w-full">
            <TabsTrigger value="users" className="rounded-xl px-4 sm:px-8 font-bold h-full whitespace-nowrap">User System</TabsTrigger>
            <TabsTrigger value="landing" className="rounded-xl px-4 sm:px-8 font-bold h-full whitespace-nowrap">Home Editor</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl px-4 sm:px-8 font-bold h-full whitespace-nowrap">Config Global</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="rounded-[2rem] sm:rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="bg-slate-50 border-b px-6 py-5"><CardTitle className="text-lg font-black flex items-center gap-2"><Users className="w-5 h-5" /> Pengguna Sistem</CardTitle></CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead className="pl-6 font-black text-[10px] uppercase">Nama</TableHead><TableHead className="font-black text-[10px] uppercase">Email</TableHead><TableHead className="font-black text-[10px] uppercase">Role</TableHead></TableRow></TableHeader>
                  <TableBody>{users.map((u, i) => (<TableRow key={i}><TableCell className="font-bold pl-6 text-sm truncate max-w-[120px]">{u.name}</TableCell><TableCell className="text-slate-500 text-sm truncate max-w-[150px]">{u.email}</TableCell><TableCell><Badge className={u.role === 'superadmin' ? 'bg-red-50 text-red-600 border-none' : 'bg-blue-50 text-blue-600 border-none'}>{u.role}</Badge></TableCell></TableRow>))}</TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="landing" className="space-y-8">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <Card className="rounded-[2rem] sm:rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
                  <CardHeader className="bg-slate-50 border-b flex flex-row items-center gap-2">
                    <Layout className="w-5 h-5 text-accent" />
                    <CardTitle className="text-lg font-black">Hero Section</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase">Judul Hero</Label>
                      <Textarea value={settings?.homepage?.hero?.title} onChange={e => handleUpdateHero('title', e.target.value)} className="rounded-xl font-bold text-lg min-h-[100px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase">Deskripsi Hero</Label>
                      <Textarea value={settings?.homepage?.hero?.description} onChange={e => handleUpdateHero('description', e.target.value)} className="rounded-xl min-h-[100px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase">Gambar Hero</Label>
                      <div className="flex flex-col gap-4">
                         <div className="relative w-full h-40 sm:h-48 rounded-xl overflow-hidden border bg-slate-50">
                           <img src={settings?.homepage?.hero?.imageUrl} className="w-full h-full object-cover" alt="Hero Preview" />
                         </div>
                         <Input type="file" accept="image/*" onChange={handleHeroImageUpload} className="rounded-xl h-11" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] sm:rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
                   <CardHeader className="bg-slate-50 border-b flex flex-row items-center gap-2">
                    <Type className="w-5 h-5 text-accent" />
                    <CardTitle className="text-lg font-black">Footer Branding</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase">Copyright Text</Label>
                      <Input value={settings?.homepage?.footer?.copyright} onChange={e => handleUpdateFooter('copyright', e.target.value)} className="rounded-xl font-bold h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase">Link Text Branding</Label>
                      <Input value={settings?.homepage?.footer?.linkText} onChange={e => handleUpdateFooter('linkText', e.target.value)} className="rounded-xl font-black text-accent h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase">Branding Link URL</Label>
                      <Input value={settings?.homepage?.footer?.linkUrl} onChange={e => handleUpdateFooter('linkUrl', e.target.value)} className="rounded-xl h-11" />
                    </div>
                    <Button onClick={handleUpdateSettings} className="w-full h-14 sm:h-16 bg-accent rounded-2xl font-black text-lg text-white mt-4 gap-2 shadow-lg shadow-accent/20">
                      <Save className="w-5 h-5" /> SIMPAN TAMPILAN
                    </Button>
                  </CardContent>
                </Card>
             </div>

             <Card className="rounded-[2rem] sm:rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between px-6 sm:px-8 py-5">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-accent" />
                    <CardTitle className="text-lg font-black">Fitur Keunggulan</CardTitle>
                  </div>
                  <Button onClick={handleAddFeature} variant="outline" className="rounded-xl font-bold h-9"><Plus className="w-4 h-4 mr-1.5" /> Tambah</Button>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {settings?.homepage?.features?.map((feat: any) => (
                      <div key={feat.id} className="p-6 rounded-[2rem] bg-slate-50 border-2 border-slate-100 space-y-4 relative group">
                        <Button size="icon" variant="ghost" onClick={() => handleRemoveFeature(feat.id)} className="absolute top-4 right-4 text-red-400 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></Button>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase">Ikon</Label>
                          <Select value={feat.icon} onValueChange={(v) => handleUpdateFeature(feat.id, 'icon', v)}>
                            <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="Zap">Zap</SelectItem>
                              <SelectItem value="Shield">Shield</SelectItem>
                              <SelectItem value="Gift">Gift</SelectItem>
                              <SelectItem value="Sparkles">Sparkles</SelectItem>
                              <SelectItem value="Heart">Heart</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase">Judul Fitur</Label>
                          <Input value={feat.title} onChange={e => handleUpdateFeature(feat.id, 'title', e.target.value)} className="rounded-xl font-bold h-10" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase">Deskripsi Fitur</Label>
                          <Textarea value={feat.description} onChange={e => handleUpdateFeature(feat.id, 'description', e.target.value)} className="rounded-xl text-xs min-h-[80px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleUpdateSettings} className="w-full h-14 bg-accent rounded-2xl font-black text-white mt-8 gap-2 shadow-lg shadow-accent/20">
                    <Save className="w-5 h-5" /> SIMPAN FITUR
                  </Button>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="settings" className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <Card className="rounded-[2rem] sm:rounded-[2.5rem] border-none shadow-sm bg-white">
              <CardHeader className="bg-slate-50 border-b"><CardTitle className="text-lg font-black flex items-center gap-2"><Settings className="w-5 h-5" /> Global Config</CardTitle></CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Site Name</Label>
                  <Input value={settings?.siteTitle} onChange={e => setSettings({...settings, siteTitle: e.target.value})} className="h-11 rounded-xl font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Branding Footer Text</Label>
                  <Input value={settings?.footerText} onChange={e => setSettings({...settings, footerText: e.target.value})} className="h-11 rounded-xl font-bold" />
                </div>
                <Button onClick={handleUpdateSettings} className="w-full bg-accent h-14 sm:h-16 rounded-2xl font-black text-lg text-white gap-2 shadow-lg shadow-accent/20">
                  <Save className="w-6 h-6" /> SIMPAN KONFIGURASI
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] sm:rounded-[2.5rem] border-none shadow-sm bg-white">
              <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-black flex items-center gap-2"><CreditCard className="w-5 h-5" /> Master Bank & E-Wallet</CardTitle>
                <Button size="sm" onClick={handleAddBank} variant="outline" className="rounded-xl font-bold h-9"><Plus className="w-4 h-4 mr-1.5" /> Tambah</Button>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                  {settings?.banks?.map((b: string, i: number) => (
                    <div key={i} className="flex gap-2 group">
                      <Input value={b} onChange={e => handleBankChange(i, e.target.value)} className="h-11 rounded-xl font-bold" />
                      {b !== 'Lainnya' && <Button size="icon" variant="ghost" onClick={() => handleRemoveBank(i)} className="text-red-400 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></Button>}
                    </div>
                  ))}
                </div>
                <Button onClick={handleUpdateSettings} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl mt-4 gap-2 shadow-lg shadow-blue-600/20">
                  <Save className="w-5 h-5" /> SIMPAN DAFTAR BANK
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="py-8 bg-white border-t mt-auto text-center px-4">
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
    <Card className="rounded-[1.5rem] sm:rounded-[2rem] border-none shadow-sm bg-white p-4 sm:p-6 flex items-center gap-3 sm:gap-4 overflow-hidden">
      <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shrink-0 ${bg} ${color}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[8px] sm:text-[10px] text-slate-400 uppercase font-black tracking-widest truncate">{label}</p>
        <p className="text-xl sm:text-2xl font-black text-slate-900 truncate">{value}</p>
      </div>
    </Card>
  );
}
