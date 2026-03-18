-- Skema Database Lucky THR Standalone
-- Sinkron dengan struktur db.json untuk migrasi SQL

-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Events
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    nominals JSON, -- Format: [{"value": 1000, "blocked": false}, ...]
    allow_multiple_plays BOOLEAN DEFAULT FALSE,
    interaction_type VARCHAR(20) DEFAULT 'angpao',
    admin_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Tabel Winners
CREATE TABLE IF NOT EXISTS winners (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    amount INT NOT NULL,
    wallet_info TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 4. Tabel System Settings
CREATE TABLE IF NOT EXISTS settings (
    key_name VARCHAR(50) PRIMARY KEY,
    value JSON
);

-- Data Awal Standar
INSERT INTO users (id, name, email, password, role) 
VALUES ('sa-1', 'Super Admin', 'superadmin@gmail.com', '$2a$10$7R6v7k.e8vWz5oV8yUf1U.I/9yO2h3uP9I8v7K6J5H4G3F2E1D0C', 'superadmin')
ON CONFLICT DO NOTHING;

INSERT INTO settings (key_name, value)
VALUES ('global', '{"siteTitle": "Lucky THR", "banks": ["Dana", "OVO", "GoPay", "ShopeePay", "BCA", "Mandiri", "BNI", "BRI", "Lainnya"], "footerText": "maudigi.com"}')
ON CONFLICT DO NOTHING;
