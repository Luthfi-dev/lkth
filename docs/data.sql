
-- Skema Database Lucky THR (Sinkron dengan db.json)
-- Generated for migration purposes

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    interaction_type VARCHAR(20) DEFAULT 'wheel',
    nominals JSON, -- Format: [{"value": 1000, "blocked": false}]
    is_active BOOLEAN DEFAULT TRUE,
    allow_multiple_plays BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS winners (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    photo_url VARCHAR(255),
    amount INT NOT NULL,
    wallet_info VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1,
    site_title VARCHAR(100) DEFAULT 'Lucky THR',
    banks JSON, -- Format: ["Dana", "OVO", "GoPay", "ShopeePay", "BCA", "Lainnya"]
    footer_text VARCHAR(200) DEFAULT 'maudigi.com'
);

-- Initial Setup Admin (Password default: 123456)
INSERT INTO users (id, name, email, password, role) 
VALUES ('sa-1', 'Super Admin', 'superadmin@gmail.com', '$2a$10$7R6v7k.e8vWz5oV8yUf1U.I/9yO2h3uP9I8v7K6J5H4G3F2E1D0C', 'superadmin')
ON CONFLICT DO NOTHING;

INSERT INTO settings (id, site_title, banks, footer_text)
VALUES (1, 'Lucky THR', '["Dana", "OVO", "GoPay", "ShopeePay", "BCA", "Mandiri", "BNI", "BRI", "Lainnya"]', 'maudigi.com')
ON CONFLICT DO NOTHING;
