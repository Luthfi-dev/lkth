-- Skema Database LuckyTHR (MySQL / PostgreSQL Ready)
-- Dibuat untuk rencana migrasi dari local JSON ke Database Online

-- Tabel Pengguna (Admin & Superadmin)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'superadmin') DEFAULT 'admin',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Event THR
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(255) PRIMARY KEY,
  admin_id VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  nominals JSON, -- Format: [{"value": 50000, "blocked": false}, ...]
  allow_multiple_plays BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Pemenang / Peserta yang sudah memutar roda
CREATE TABLE IF NOT EXISTS winners (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  photo_url LONGTEXT,
  amount INT NOT NULL,
  wallet_info VARCHAR(255),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Seeder Data Awal (Superadmin Default)
INSERT INTO users (id, name, email, password, role) 
VALUES ('sa-1', 'Super Admin', 'superadmin@gmail.com', '123456', 'superadmin')
ON DUPLICATE KEY UPDATE id=id;

-- Contoh Event Awal
INSERT INTO events (id, admin_id, title, message, nominals, is_active)
VALUES ('event-123', 'sa-1', 'THR Keluarga Besar Haji Sulaiman', 'Selamat Hari Raya $nama! Semoga berkah selalu.', '[{"value": 50000, "blocked": false}, {"value": 100000, "blocked": false}]', 1)
ON DUPLICATE KEY UPDATE id=id;
