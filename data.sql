-- Skema Database LuckyTHR
-- Gunakan skema ini untuk migrasi ke MySQL/PostgreSQL saat DB_STATUS=online

-- 1. Tabel Users (Admin)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Events
CREATE TABLE events (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    nominals JSON, -- Format: [10000, 20000, ...]
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 3. Tabel Winners
CREATE TABLE winners (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    photo_url LONGTEXT, -- Untuk base64 image
    amount INT NOT NULL,
    wallet_info VARCHAR(255),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Contoh Data Awal Event
INSERT INTO events (id, admin_id, title, message, nominals, is_active) 
VALUES ('event-123', 'default-admin', 'THR Keluarga Besar Haji Sulaiman', 'Selamat Hari Raya $nama! Semoga berkah.', '[10000, 20000, 50000, 100000, 5000]', 1);