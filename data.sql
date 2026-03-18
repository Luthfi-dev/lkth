-- Skema Database LuckyTHR (Struktur Terakhir)
-- Gunakan skema ini untuk migrasi ke MySQL/PostgreSQL Online

-- 1. Tabel Pengguna (Admin)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Simpan hash dari /enc
    role ENUM('admin', 'superadmin') DEFAULT 'admin',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Event THR
CREATE TABLE events (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    message TEXT, -- Pesan yang muncul di kartu pemenang
    nominals JSON, -- Array nominal tersedia
    is_active BOOLEAN DEFAULT TRUE,
    allow_multiple_plays BOOLEAN DEFAULT FALSE, -- Fitur baru: Bypass IP/Device lock
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 3. Tabel Pemenang
CREATE TABLE winners (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    photo_url LONGTEXT, -- Base64 data
    amount INT NOT NULL,
    wallet_info VARCHAR(255), -- Format: "Bank - NoRek"
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Data Awal (Seeder)
INSERT INTO users (id, name, email, password, role) 
VALUES ('sa-1', 'Super Admin', 'superadmin@gmail.com', '654321_ytkl_atlas', 'superadmin');

INSERT INTO events (id, admin_id, title, message, nominals, allow_multiple_plays)
VALUES ('event-123', 'sa-1', 'THR Keluarga Besar Haji Sulaiman', 'Selamat Hari Raya $nama! Semoga berkah.', '[10000, 20000, 50000, 100000]', FALSE);