'use server';

import { getData, saveData, deleteData, updateData, saveFile } from '@/lib/storage';

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
  
  const { password, ...userWithoutPassword } = user;
  return { success: true, user: userWithoutPassword };
}

export async function getAllUsers() {
  return await getData('users');
}

export async function getEvents(adminId?: string, role?: string) {
  const events = await getData('events');
  if (role === 'superadmin') return events;
  if (adminId) return events.filter((e: any) => e.admin_id === adminId);
  return events;
}

export async function createEvent(eventData: any) {
  return await saveData('events', eventData);
}

export async function updateEvent(id: string, data: any) {
  await updateData('events', id, data);
  return { success: true };
}

export async function deleteEvent(id: string) {
  await deleteData('events', id);
  // Hapus pemenang terkait agar data bersih
  const winners = await getData('winners');
  const filtered = winners.filter((w: any) => w.event_id !== id);
  
  const dbPath = require('path').join(process.cwd(), 'src/data/db.json');
  const fs = require('fs');
  if (fs.existsSync(dbPath)) {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    db.winners = filtered;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  }
  return { success: true };
}

export async function getWinners(adminId?: string, role?: string) {
  const winners = await getData('winners');
  const events = await getData('events');
  
  if (role === 'superadmin') return winners;
  if (!adminId) return winners;

  const userEventIds = events
    .filter((e: any) => e.admin_id === adminId)
    .map((e: any) => e.id);
    
  return winners.filter((w: any) => userEventIds.includes(w.event_id));
}

export async function addWinner(winnerData: any) {
  let photoUrl = winnerData.photo_url;
  if (photoUrl && photoUrl.startsWith('data:image')) {
    photoUrl = await saveFile(photoUrl);
  }
  
  await saveData('winners', { ...winnerData, photo_url: photoUrl });
  return { success: true };
}

export async function deleteWinner(winnerId: string) {
  await deleteData('winners', winnerId);
  return { success: true };
}

export async function getSystemSettings() {
  return await getData('settings');
}

export async function updateSystemSettings(newSettings: any) {
  await updateData('settings', null, newSettings);
  return { success: true };
}

export async function checkIpPlayed(eventId: string, ip: string) {
  const winners = await getData('winners');
  // Mencocokkan IP dan Event ID untuk validasi anti-curang
  return winners.some((w: any) => w.event_id === eventId && w.ip_address === ip);
}
