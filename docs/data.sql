-- LuckyTHR Database Schema
-- Synchronized with local data storage structure

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    nominals JSON, -- Format: Array of {value: number, blocked: boolean}
    allow_multiple_plays BOOLEAN DEFAULT FALSE,
    interaction_type VARCHAR(50) DEFAULT 'angpao',
    is_active BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE TABLE winners (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    amount INT NOT NULL,
    wallet_info TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE settings (
    id INT PRIMARY KEY DEFAULT 1,
    site_title VARCHAR(255),
    banks JSON, -- Format: Array of strings ['Bank A', 'Bank B']
    footer_text VARCHAR(255)
);

-- Default Super Admin Initialization
-- Password Plain: 123456
-- Secure Hash: $2a$10$7R6v7k.e8vWz5oV8yUf1U.I/9yO2h3uP9I8v7K6J5H4G3F2E1D0C
INSERT INTO users (id, name, email, password, role) 
VALUES ('sa-1', 'Super Admin', 'superadmin@gmail.com', '$2a$10$7R6v7k.e8vWz5oV8yUf1U.I/9yO2h3uP9I8v7K6J5H4G3F2E1D0C', 'superadmin');