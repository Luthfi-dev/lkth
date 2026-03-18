-- Skema Database LuckyTHR Online (Blueprint)
-- Gunakan file ini saat melakukan migrasi ke MySQL atau PostgreSQL

-- 1. Tabel Users (Admin & Superadmin)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'superadmin') DEFAULT 'admin',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Events
-- nominals disimpan sebagai JSON string untuk fleksibilitas
CREATE TABLE events (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50),
    title VARCHAR(100) NOT NULL,
    message TEXT,
    nominals JSON, -- Format: [{"value": 10000, "blocked": false}, ...]
    allow_multiple_plays BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 3. Tabel Winners
CREATE TABLE winners (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    photo_url TEXT,
    amount INT NOT NULL,
    wallet_info VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- SEEDER DATA AWAL
-- Akun Superadmin Default
INSERT INTO users (id, name, email, password, role) 
VALUES ('sa-1', 'Super Admin', 'superadmin@gmail.com', '123456', 'superadmin');

-- Event Contoh
INSERT INTO events (id, admin_id, title, message, nominals, allow_multiple_plays)
VALUES ('event-123', 'sa-1', 'THR Keluarga Haji Sulaiman', 'Selamat $nama! Berkah selalu.', '[{"value": 10000, "blocked": false}, {"value": 50000, "blocked": true}]', FALSE);
