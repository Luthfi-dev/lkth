
-- Skema Database LuckyTHR untuk Migrasi SQL
-- Kompatibel dengan MySQL/PostgreSQL

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'superadmin') DEFAULT 'admin',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
    id INT PRIMARY KEY DEFAULT 1,
    site_title VARCHAR(255) DEFAULT 'Lucky THR',
    banks TEXT, -- JSON Array format
    footer_text VARCHAR(255) DEFAULT 'maudigi.com'
);

CREATE TABLE events (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    interaction_type ENUM('wheel', 'angpao') DEFAULT 'wheel',
    nominals TEXT, -- JSON Array format
    is_active BOOLEAN DEFAULT TRUE,
    allow_multiple_plays BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE TABLE winners (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    wallet_info TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Default Super Admin (Password: 123456)
INSERT INTO users (id, name, email, password, role) 
VALUES ('sa-1', 'Super Admin', 'superadmin@gmail.com', '$2a$10$7R6v7k.e8vWz5oV8yUf1U.I/9yO2h3uP9I8v7K6J5H4G3F2E1D0C', 'superadmin');

-- Default Settings
INSERT INTO settings (site_title, banks, footer_text)
VALUES ('Lucky THR', '["Dana", "OVO", "GoPay", "ShopeePay", "BCA", "Mandiri", "BNI", "BRI", "Lainnya"]', 'maudigi.com');
