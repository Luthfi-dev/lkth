
-- Database Schema for LuckyTHR
-- Synchronized with local db.json storage structure

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    interaction_type VARCHAR(50) DEFAULT 'angpao',
    nominals JSON, -- Array of {value: number, blocked: boolean}
    is_active BOOLEAN DEFAULT TRUE,
    allow_multiple_plays BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS winners (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    wallet_info TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSON NOT NULL
);

-- Default Settings
INSERT INTO settings (key, value) VALUES ('global_config', '{
    "siteTitle": "Lucky THR",
    "banks": ["Dana", "OVO", "GoPay", "ShopeePay", "BCA", "Mandiri", "BNI", "BRI", "Lainnya"],
    "footerText": "maudigi.com"
}') ON CONFLICT (key) DO NOTHING;

-- Default Super Admin (Pass: 123456 hashed)
INSERT INTO users (id, name, email, password, role) 
VALUES ('sa-1', 'Super Admin', 'superadmin@gmail.com', '$2a$10$7R6v7k.e8vWz5oV8yUf1U.I/9yO2h3uP9I8v7K6J5H4G3F2E1D0C', 'superadmin')
ON CONFLICT (id) DO NOTHING;
