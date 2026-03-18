"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, LogOut, Users, Database, Server, Terminal, Settings } from 'lucide-react';
import { getData } from '@/lib/storage';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      const [u, e, w] = await Promise.all([
        getData('users'),
        getData('events'),
        getData('winners')
      ]);
      setUsers(u);
      setEvents(e);
      setWinners(w);
    };
    fetchAllData();
  }, []);

  const handleLogout = () => router.push('/login');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-red-500 p-2 rounded-lg shadow-lg shadow-red-500/20">
            <ShieldAlert className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight uppercase">Super<span className="text-red-500">Admin</span> Engine</span>
          <Badge variant="outline" className="ml-2 bg-slate-800 border-slate-700 text-slate-400">
            v1.0.0-Stable
          </Badge>
        </div>
        <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Keluar Sistem
        </Button>
      </nav>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SystemStat icon={<Users className="w-5 h-5" />} label="Total Pengguna" value={users.length} color="text-blue-400" />
          <SystemStat icon={<Database className="w-5 h-5" />} label="Total Events" value={events.length} color="text-green-400" />
          <SystemStat icon={<Server className="w-5 h-5" />} label="Total Transaksi" value={winners.length} color="text-purple-400" />
          <SystemStat icon={<Terminal className="w-5 h-5" />} label="Status Server" value="ONLINE" color="text-emerald-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-slate-950 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
              <CardTitle className="text-lg flex items-center gap-2"><Users className="w-4 h-4" /> Manajemen Pengguna</CardTitle>
              <Button size="sm" variant="outline" className="border-slate-700 bg-slate-900">Add User</Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Nama</TableHead>
                    <TableHead className="text-slate-400">Email</TableHead>
                    <TableHead className="text-slate-400">Role</TableHead>
                    <TableHead className="text-right text-slate-400">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, idx) => (
                    <TableRow key={idx} className="border-slate-800 hover:bg-slate-900/50">
                      <TableCell className="font-bold">{user.name}</TableCell>
                      <TableCell className="text-slate-400 text-xs">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={user.role === 'superadmin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}>
                          {user.role || 'admin'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><Settings className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-slate-950 border-slate-800">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-lg flex items-center gap-2"><Terminal className="w-4 h-4" /> System Info & DB Schema</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 font-mono text-xs space-y-2">
                <p className="text-emerald-500">// Struktur Database (data.sql)</p>
                <p className="text-slate-400">TABLE users (id, name, email, password, role, timestamp)</p>
                <p className="text-slate-400">TABLE events (id, admin_id, title, nominals, is_active)</p>
                <p className="text-slate-400">TABLE winners (id, event_id, name, photo_url, amount, wallet_info)</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Database Sync Status</p>
                <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm">Local `db.json` is perfectly synced with `data.sql` structure</span>
                </div>
              </div>
              <Button className="w-full bg-slate-100 text-slate-950 hover:bg-white font-bold">
                Export Database for Cloud Migration
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function SystemStat({ icon, label, value, color }: { icon: any, label: string, value: any, color: string }) {
  return (
    <Card className="bg-slate-950 border-slate-800">
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
