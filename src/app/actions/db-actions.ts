'use server';

import { getData, saveData, deleteData, updateData, saveFile, cleanupEventWinners } from '@/lib/storage';

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
  if (adminId) return (events || []).filter((e: any) => e.admin_id === adminId);
  return events || [];
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
  // Hapus pemenang terkait agar data bersih menggunakan storage helper
  await cleanupEventWinners(id);
  return { success: true };
}

export async function getWinners(adminId?: string, role?: string) {
  const winners = await getData('winners');
  const events = await getData('events');
  
  if (role === 'superadmin') return winners || [];
  if (!adminId) return winners || [];

  const userEventIds = (events || [])
    .filter((e: any) => e.admin_id === adminId)
    .map((e: any) => e.id);
    
  return (winners || []).filter((w: any) => userEventIds.includes(w.event_id));
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
  return (winners || []).some((w: any) => w.event_id === eventId && w.ip_address === ip);
}

export async function generateSqlExport() {
  const users = await getData('users');
  const events = await getData('events');
  const winners = await getData('winners');
  const settings = await getData('settings');

  let sql = `-- Lucky THR Database Export\n-- Generated on ${new Date().toISOString()}\n\n`;

  // Users Table
  sql += `CREATE TABLE IF NOT EXISTS users (\n  id VARCHAR(50) PRIMARY KEY,\n  name VARCHAR(255),\n  email VARCHAR(255) UNIQUE,\n  password VARCHAR(255),\n  role VARCHAR(50),\n  timestamp DATETIME\n);\n\n`;
  (users || []).forEach((u: any) => {
    sql += `INSERT INTO users (id, name, email, password, role, timestamp) VALUES ('${u.id}', '${(u.name || '').replace(/'/g, "''")}', '${u.email}', '${u.password}', '${u.role}', '${u.timestamp}');\n`;
  });

  // Events Table
  sql += `\nCREATE TABLE IF NOT EXISTS events (\n  id VARCHAR(50) PRIMARY KEY,\n  title VARCHAR(255),\n  message TEXT,\n  nominals TEXT,\n  allow_multiple_plays BOOLEAN,\n  interaction_type VARCHAR(50),\n  admin_id VARCHAR(50),\n  is_active BOOLEAN,\n  timestamp DATETIME\n);\n\n`;
  (events || []).forEach((e: any) => {
    sql += `INSERT INTO events (id, title, message, nominals, allow_multiple_plays, interaction_type, admin_id, is_active, timestamp) VALUES ('${e.id}', '${(e.title || '').replace(/'/g, "''")}', '${(e.message || '').replace(/'/g, "''")}', '${JSON.stringify(e.nominals).replace(/'/g, "''")}', ${e.allow_multiple_plays ? 1 : 0}, '${e.interaction_type}', '${e.admin_id}', ${e.is_active ? 1 : 0}, '${e.timestamp}');\n`;
  });

  // Winners Table
  sql += `\nCREATE TABLE IF NOT EXISTS winners (\n  id VARCHAR(50) PRIMARY KEY,\n  event_id VARCHAR(50),\n  name VARCHAR(255),\n  photo_url TEXT,\n  amount INT,\n  wallet_info TEXT,\n  ip_address VARCHAR(50),\n  timestamp DATETIME\n);\n\n`;
  (winners || []).forEach((w: any) => {
    sql += `INSERT INTO winners (id, event_id, name, photo_url, amount, wallet_info, ip_address, timestamp) VALUES ('${w.id}', '${w.event_id}', '${(w.name || '').replace(/'/g, "''")}', '${w.photo_url}', ${w.amount}, '${(w.wallet_info || '').replace(/'/g, "''")}', '${w.ip_address}', '${w.timestamp}');\n`;
  });

  // Settings Table
  sql += `\nCREATE TABLE IF NOT EXISTS settings (\n  id INT PRIMARY KEY AUTO_INCREMENT,\n  config_json TEXT\n);\n\n`;
  sql += `INSERT INTO settings (config_json) VALUES ('${JSON.stringify(settings || {}).replace(/'/g, "''")}');\n`;

  return sql;
}
