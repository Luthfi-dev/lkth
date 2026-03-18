
-- Skema Database LuckyTHR Engine v15.2.4
-- Dirancang untuk sinkronisasi migrasi data dinamis

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'admin') DEFAULT 'admin',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    nominals JSON, -- Format: [{"value": 5000, "blocked": false}]
    interaction_type ENUM('angpao', 'wheel') DEFAULT 'angpao',
    allow_multiple_plays BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS winners (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    amount INT NOT NULL,
    wallet_info VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1,
    siteTitle VARCHAR(255) DEFAULT 'Lucky THR',
    banks JSON, -- Format: ["Dana", "OVO", "GoPay"]
    footerText VARCHAR(255) DEFAULT 'maudigi.com'
);

-- Initial Data
INSERT INTO users (id, name, email, password, role) 
VALUES ('sa-1', 'Super Admin', 'superadmin@gmail.com', '$2a$10$7R6v7k.e8vWz5oV8yUf1U.I/9yO2h3uP9I8v7K6J5H4G3F2E1D0C', 'superadmin')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO settings (id, siteTitle, banks, footerText)
VALUES (1, 'Lucky THR', '["Dana", "OVO", "GoPay", "ShopeePay", "BCA", "Lainnya"]', 'maudigi.com')
ON DUPLICATE KEY UPDATE id=id;
