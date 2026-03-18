
-- LuckyTHR Master Database Schema v15.2.4
-- Developed by maudigi.com

-- Table: Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin', -- 'superadmin' or 'admin'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Events
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50) REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    interaction_type VARCHAR(20) DEFAULT 'wheel', -- 'wheel' or 'angpao'
    nominals JSON, -- Array of {value: number, blocked: boolean}
    is_active BOOLEAN DEFAULT TRUE,
    allow_multiple_plays BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Winners
CREATE TABLE IF NOT EXISTS winners (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) REFERENCES events(id),
    name VARCHAR(100) NOT NULL,
    photo_url TEXT,
    amount INT NOT NULL,
    wallet_info TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Settings
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1,
    site_title VARCHAR(255) DEFAULT 'Lucky THR',
    banks JSON, -- Array of bank names
    footer_text VARCHAR(255) DEFAULT 'maudigi.com',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Master Data
INSERT INTO users (id, name, email, password, role) 
VALUES ('sa-1', 'Super Admin', 'superadmin@gmail.com', '$2a$10$7R6v7k.e8vWz5oV8yUf1U.I/9yO2h3uP9I8v7K6J5H4G3F2E1D0C', 'superadmin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO settings (id, site_title, banks, footer_text)
VALUES (1, 'Lucky THR', '["Dana", "OVO", "GoPay", "ShopeePay", "BCA", "Mandiri", "BNI", "BRI", "Lainnya"]', 'maudigi.com')
ON CONFLICT (id) DO NOTHING;
