import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/data/db.json');

function ensureDbExists() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      users: [
        {
          id: "sa-1",
          name: "Super Admin",
          email: "superadmin@gmail.com",
          password: "654321_ytkl_atlas",
          role: "superadmin",
          timestamp: new Date().toISOString()
        }
      ],
      events: [{
        id: 'event-123',
        admin_id: 'sa-1',
        title: 'THR Keluarga Besar Haji Sulaiman',
        message: 'Selamat Hari Raya $nama! Semoga berkah dan bahagia selalu.',
        nominals: [10000, 20000, 50000, 100000, 5000, 2000],
        is_active: true,
        allow_multiple_plays: false
      }],
      winners: []
    }, null, 2));
  }
}

export async function getData(collection: 'users' | 'events' | 'winners') {
  ensureDbExists();
  const fileData = fs.readFileSync(DB_PATH, 'utf-8');
  const db = JSON.parse(fileData);
  return db[collection];
}

export async function saveData(collection: 'users' | 'events' | 'winners', data: any) {
  ensureDbExists();
  const fileData = fs.readFileSync(DB_PATH, 'utf-8');
  const db = JSON.parse(fileData);
  
  const newItem = {
    ...data,
    id: data.id || Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString()
  };

  db[collection].push(newItem);
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  return newItem;
}

export async function deleteData(collection: 'users' | 'events' | 'winners', id: string) {
  ensureDbExists();
  const fileData = fs.readFileSync(DB_PATH, 'utf-8');
  const db = JSON.parse(fileData);
  db[collection] = db[collection].filter((item: any) => item.id !== id);
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export async function updateData(collection: 'users' | 'events' | 'winners', id: string, newData: any) {
  ensureDbExists();
  const fileData = fs.readFileSync(DB_PATH, 'utf-8');
  const db = JSON.parse(fileData);
  const index = db[collection].findIndex((item: any) => item.id === id);
  if (index !== -1) {
    db[collection][index] = { ...db[collection][index], ...newData };
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  }
}