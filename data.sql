-- Skema Database LuckyTHR untuk Migrasi Online (MySQL/PostgreSQL)

-- Tabel Pengguna/Admin
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Event
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(50) PRIMARY KEY,
  admin_id VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  nominals TEXT, -- Disimpan sebagai string JSON array
  allow_multiple_plays BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Pemenang
CREATE TABLE IF NOT EXISTS winners (
  id VARCHAR(50) PRIMARY KEY,
  event_id VARCHAR(50),
  name VARCHAR(100) NOT NULL,
  photo_url LONGTEXT, -- Untuk menyimpan data URI foto jika perlu
  amount INT NOT NULL,
  wallet_info VARCHAR(255) NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Super Admin Default
INSERT INTO users (id, name, email, password, role) 
VALUES ('sa-1', 'Super Admin', 'superadmin@gmail.com', '123456', 'superadmin')
ON DUPLICATE KEY UPDATE id=id;