
-- LuckyTHR SQL Schema
-- Synchronized with local db.json structure

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50) REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    interaction_type VARCHAR(20) DEFAULT 'wheel',
    nominals JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    allow_multiple_plays BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE winners (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) REFERENCES events(id),
    name VARCHAR(100) NOT NULL,
    photo_url TEXT,
    amount INT NOT NULL,
    wallet_info TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    site_title VARCHAR(255) DEFAULT 'Lucky THR',
    banks JSONB,
    footer_text VARCHAR(255) DEFAULT 'maudigi.com'
);

-- Default Super Admin (password: 123456)
INSERT INTO users (id, name, email, password, role) 
VALUES ('sa-1', 'Super Admin', 'superadmin@gmail.com', '$2a$10$7R6v7k.e8vWz5oV8yUf1U.I/9yO2h3uP9I8v7K6J5H4G3F2E1D0C', 'superadmin');

-- Default Settings
INSERT INTO settings (site_title, banks, footer_text)
VALUES ('Lucky THR', '["Dana", "OVO", "GoPay", "ShopeePay", "BCA", "Mandiri", "BNI", "BRI", "Lainnya"]', 'maudigi.com');
