-- Skema Database LuckyTHR
-- Persiapan migrasi dari JSON ke MySQL/PostgreSQL

-- Tabel Pengguna (Admin & Superadmin)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'superadmin') DEFAULT 'admin',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Event THR
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    nominals JSON, -- Format: [{"value": 10000, "blocked": false}, ...]
    allow_multiple_plays BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel Pemenang (Transaksi)
CREATE TABLE IF NOT EXISTS winners (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    photo_url TEXT,
    amount INT NOT NULL,
    wallet_info VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Data Awal (Seeder)
INSERT INTO users (id, name, email, password, role) 
VALUES ('sa-1', 'Super Admin', 'superadmin@gmail.com', '123456', 'superadmin')
ON DUPLICATE KEY UPDATE id=id;

-- Contoh Event Awal
INSERT INTO events (id, admin_id, title, message, nominals, allow_multiple_plays, is_active)
VALUES ('event-123', 'sa-1', 'THR Keluarga Besar Haji Sulaiman', 'Selamat Hari Raya $nama! Semoga berkah.', '[{"value": 5000, "blocked": false}, {"value": 10000, "blocked": false}, {"value": 20000, "blocked": false}]', FALSE, TRUE)
ON DUPLICATE KEY UPDATE id=id;