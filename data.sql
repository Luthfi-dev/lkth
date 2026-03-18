-- Skema Database LuckyTHR
-- Gunakan file ini untuk migrasi ke Database Online (MySQL/PostgreSQL)

CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id VARCHAR(255) PRIMARY KEY,
    admin_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    nominals JSON, -- Simpan array [10000, 5000, ...] sebagai JSON
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE TABLE winners (
    id VARCHAR(255) PRIMARY KEY,
    event_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    amount INT NOT NULL,
    wallet_info VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);