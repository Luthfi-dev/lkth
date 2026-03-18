import fs from 'fs';
import path from 'path';

// DB tersimpan di src/data/db.json
const DB_PATH = path.join(process.cwd(), 'src/data/db.json');
// Gambar tersimpan di root proyek /uploads (sejajar dengan src)
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

function ensureDbExists() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      users: [
        {
          id: "sa-1",
          name: "Super Admin",
          email: "superadmin@gmail.com",
          password: "123456",
          role: "superadmin",
          timestamp: new Date().toISOString()
        }
      ],
      events: [],
      winners: [],
      settings: {
        siteTitle: "Lucky THR",
        banks: ['Dana', 'OVO', 'GoPay', 'ShopeePay', 'BCA', 'Mandiri', 'BNI', 'BRI', 'Lainnya'],
        footerText: "maudigi.com",
        homepage: {
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
        }
      }
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
  }
}

export async function getData(collection: 'users' | 'events' | 'winners' | 'settings') {
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

export async function updateData(collection: 'users' | 'events' | 'winners' | 'settings', id: string | null, newData: any) {
  ensureDbExists();
  const fileData = fs.readFileSync(DB_PATH, 'utf-8');
  const db = JSON.parse(fileData);
  
  if (collection === 'settings') {
    db.settings = { ...db.settings, ...newData };
  } else {
    const index = db[collection].findIndex((item: any) => item.id === id);
    if (index !== -1) {
      db[collection][index] = { ...db[collection][index], ...newData };
    }
  }
  
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export async function saveFile(base64Data: string) {
  ensureDbExists();
  if (!base64Data || !base64Data.includes('base64,')) return '';
  
  const base64Content = base64Data.split(';base64,').pop();
  if (!base64Content) return '';

  const fileName = `img_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.png`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  
  fs.writeFileSync(filePath, base64Content, { encoding: 'base64' });
  return `/api/uploads/${fileName}`;
}
