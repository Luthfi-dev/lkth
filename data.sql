-- Skema Database Lucky THR
-- Gunakan ini untuk migrasi ke MySQL / PostgreSQL online

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
CREATE TABLE events (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    message TEXT,
    nominals JSON, -- Berisi array object {value: 10000, blocked: false}
    allow_multiple_plays BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 3. Tabel Winners (Monitoring Pemenang)
CREATE TABLE winners (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    photo_url TEXT,
    amount INT NOT NULL,
    wallet_info VARCHAR(200) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Data Awal (Seeder)
INSERT INTO users (id, name, email, password, role) 
VALUES ('sa-1', 'Super Admin', 'superadmin@gmail.com', '123456', 'superadmin');
