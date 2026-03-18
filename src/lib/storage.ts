import fs from 'fs';
import path from 'path';

// Path ke file penyimpanan lokal
const DB_PATH = path.join(process.cwd(), 'src/data/db.json');

// Pastikan direktori dan file ada
function ensureDbExists() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      users: [],
      events: [{
        id: 'event-123',
        admin_id: 'default-admin',
        title: 'THR Keluarga Besar Haji Sulaiman',
        message: 'Selamat Hari Raya $nama! Semoga berkah dan bahagia selalu.',
        nominals: [10000, 20000, 50000, 100000, 5000, 2000],
        is_active: true
      }],
      winners: []
    }, null, 2));
  }
}

export async function getData(collection: 'users' | 'events' | 'winners') {
  if (process.env.NEXT_PUBLIC_DB_STATUS === 'online') {
    // Implementasi fetch ke API/DB Online di sini nantinya
    console.log('Fetching from Online DB...');
    return [];
  }

  ensureDbExists();
  const fileData = fs.readFileSync(DB_PATH, 'utf-8');
  const db = JSON.parse(fileData);
  return db[collection];
}

export async function saveData(collection: 'users' | 'events' | 'winners', data: any) {
  if (process.env.NEXT_PUBLIC_DB_STATUS === 'online') {
    // Implementasi push ke API/DB Online di sini nantinya
    console.log('Saving to Online DB...');
    return;
  }

  ensureDbExists();
  const fileData = fs.readFileSync(DB_PATH, 'utf-8');
  const db = JSON.parse(fileData);
  
  db[collection].push({
    ...data,
    id: data.id || Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString()
  });

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}