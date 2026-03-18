-- LuckyTHR Database Schema Blueprint
-- Gunakan skema ini untuk migrasi ke database online (MySQL/PostgreSQL)

-- 1. Tabel Pengguna (Admin & Superadmin)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role ENUM('admin', 'superadmin') DEFAULT 'admin',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Event
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    message TEXT,
    nominals JSON, -- Format: [1000, 5000, 10000]
    allow_multiple_plays BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 3. Tabel Pemenang
CREATE TABLE IF NOT EXISTS winners (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    photo_url TEXT,
    amount INT NOT NULL,
    wallet_info VARCHAR(200) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- SEEDER: Akun Super Admin Default
-- Password: '123456' (Gunakan /enc untuk generate hash jika ingin mengubah)
INSERT INTO users (id, name, email, password, role) 
VALUES ('sa-1', 'Super Admin', 'superadmin@gmail.com', '654321_ytkl_atlas', 'superadmin')
ON DUPLICATE KEY UPDATE id=id;

-- SEEDER: Event Contoh
INSERT INTO events (id, admin_id, title, message, nominals, allow_multiple_plays, is_active)
VALUES ('event-123', 'sa-1', 'THR Keluarga Besar Haji Sulaiman', 'Selamat Hari Raya $nama! Semoga berkah.', '[5000, 10000, 20000, 50000, 100000]', FALSE, TRUE)
ON DUPLICATE KEY UPDATE id=id;
