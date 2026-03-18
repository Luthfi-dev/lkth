'use server';

import { getData, saveData, deleteData, updateData } from '@/lib/storage';

export async function registerUser(formData: any) {
  const users = await getData('users');
  const exists = users.find((u: any) => u.email === formData.email);
  if (exists) throw new Error('Email sudah terdaftar');
  await saveData('users', { ...formData, role: 'admin' });
  return { success: true };
}

export async function loginUser(email: string, pass: string) {
  const users = await getData('users');
  const user = users.find((u: any) => u.email === email && u.password === pass);
  if (!user) throw new Error('Email atau password salah');
  
  // Return user without password for safety
  const { password, ...userWithoutPassword } = user;
  return { success: true, user: userWithoutPassword };
}

export async function getAllUsers() {
  return await getData('users');
}

export async function getEvents(adminId?: string, role?: string) {
  const events = await getData('events');
  // Jika role superadmin, kembalikan semua
  if (role === 'superadmin') return events;
  // Jika adminId diberikan (akses dari dashboard), filter berdasarkan admin
  if (adminId) return events.filter((e: any) => e.admin_id === adminId);
  // Jika tidak ada adminId (akses publik dari halaman Play), kembalikan semua agar bisa dicari berdasarkan ID di client
  return events;
}

export async function createEvent(eventData: any) {
  return await saveData('events', eventData);
}

export async function updateEvent(id: string, data: any) {
  await updateData('events', id, data);
  return { success: true };
}

export async function getWinners(adminId?: string, role?: string) {
  const winners = await getData('winners');
  const events = await getData('events');
  
  if (role === 'superadmin') return winners;
  if (!adminId) return [];

  // Filter winners based on events owned by this admin
  const userEventIds = events
    .filter((e: any) => e.admin_id === adminId)
    .map((e: any) => e.id);
    
  return winners.filter((w: any) => userEventIds.includes(w.event_id));
}

export async function addWinner(winnerData: any) {
  await saveData('winners', winnerData);
  return { success: true };
}

export async function deleteWinner(winnerId: string) {
  await deleteData('winners', winnerId);
  return { success: true };
}

export async function clearWinnersByEvent(eventId: string) {
  const winners = await getData('winners');
  const filtered = winners.filter((w: any) => w.event_id !== eventId);
  
  // This is a simplified bulk delete for local storage
  const dbPath = require('path').join(process.cwd(), 'src/data/db.json');
  const fs = require('fs');
  if (fs.existsSync(dbPath)) {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    db.winners = filtered;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  }
  return { success: true };
}
