-- LuckyTHR Database Schema
-- Last Updated: 2024-03-18
-- Use this script to migrate from db.json to MySQL/PostgreSQL

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'superadmin') DEFAULT 'admin',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: events
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    nominals JSON NOT NULL, -- Array of integers
    allow_multiple_plays BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Table: winners
CREATE TABLE IF NOT EXISTS winners (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    photo_url LONGTEXT, -- Base64 encoded image
    amount INT NOT NULL,
    wallet_info VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Seed Initial Superadmin
INSERT INTO users (id, name, email, password, role) 
VALUES ('sa-1', 'Super Admin', 'superadmin@gmail.com', '123456', 'superadmin')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Default Admin
INSERT INTO users (id, name, email, password, role) 
VALUES ('adm-1', 'Admin Fifi', 'dilfarisna@gmail.com', '123456', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Default Event
INSERT INTO events (id, admin_id, title, message, nominals, allow_multiple_plays)
VALUES ('event-123', 'sa-1', 'THR Keluarga Besar Haji Sulaiman', 'Selamat Hari Raya $nama! Semoga berkah selalu.', '[1000, 2000, 5000, 10000, 20000, 50000, 100000]', FALSE)
ON DUPLICATE KEY UPDATE id=id;
