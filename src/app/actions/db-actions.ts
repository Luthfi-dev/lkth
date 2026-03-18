
'use server';

import { getData, saveData, deleteData, updateData, clearCollection } from '@/lib/storage';

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
  return { success: true, user };
}

export async function getEvents() {
  return await getData('events');
}

export async function createEvent(eventData: any) {
  return await saveData('events', eventData);
}

export async function updateEvent(id: string, data: any) {
  await updateData('events', id, data);
  return { success: true };
}

export async function getWinners() {
  return await getData('winners');
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
