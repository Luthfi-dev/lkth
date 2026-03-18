
-- Skema Database Lucky THR Multi-User
-- Gunakan file ini untuk migrasi ke MySQL/PostgreSQL di database online

-- 1. Tabel Users (Admin & Superadmin)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'superadmin') DEFAULT 'admin',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Events
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    nominals TEXT, -- Disimpan sebagai JSON string atau comma-separated values
    is_active BOOLEAN DEFAULT TRUE,
    allow_multiple_plays BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 3. Tabel Winners (Monitoring Pemenang)
CREATE TABLE IF NOT EXISTS winners (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    photo_url LONGTEXT, -- Base64 atau URL Image
    amount INT NOT NULL,
    wallet_info VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- SEEDER AWAL (Superadmin)
INSERT INTO users (id, name, email, password, role) 
VALUES ('sa-1', 'Super Admin', 'superadmin@gmail.com', '123456', 'superadmin')
ON DUPLICATE KEY UPDATE id=id;
