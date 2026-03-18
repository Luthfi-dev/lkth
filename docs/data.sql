-- LuckyTHR Database Schema
-- Sinkron dengan struktur db.json lokal

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- BcryptJS Hash
    role VARCHAR(50) DEFAULT 'admin',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50) REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    interaction_type VARCHAR(50) DEFAULT 'angpao',
    nominals JSONB, -- Simpan array of objects {value, blocked}
    is_active BOOLEAN DEFAULT TRUE,
    allow_multiple_plays BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS winners (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) REFERENCES events(id),
    name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    wallet_info TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    siteTitle VARCHAR(255) DEFAULT 'Lucky THR',
    banks JSONB,
    footerText VARCHAR(255) DEFAULT 'maudigi.com'
);