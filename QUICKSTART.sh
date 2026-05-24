#!/bin/bash

# DroneMetrics Quick Start Setup Script

echo "🚀 DroneMetrics Industrial Grade - Quick Setup"
echo "================================================"

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Start database container
echo "🗄️  Starting PostgreSQL database..."
docker-compose up -d db

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Initialize database schema
echo "📋 Initializing database schema..."
docker-compose exec -T db psql -U admin -d dronemetrics -f /docker-entrypoint-initdb.d/init.sql

echo "📊 Loading sample data..."
docker-compose exec -T db psql -U admin -d dronemetrics << 'EOF'
-- Frames
INSERT INTO frames (name, size_inches, weight_g, price_usd, drone_type, motor_count, material) VALUES
('Freestyle 5"', 5.0, 30, 45, 'quad', 4, 'Carbon'),
('Racing 5"', 5.0, 28, 50, 'quad', 4, 'Carbon'),
('LongRange 7"', 7.0, 50, 70, 'quad', 4, 'Carbon'),
('Hexa Frame', 5.5, 80, 90, 'hexa', 6, 'Carbon'),
('Octa Frame', 8.0, 150, 150, 'octa', 8, 'Carbon');

-- Motors
INSERT INTO motors (name, kv, weight_g, price_usd, max_current_a) VALUES
('5800KV Racing', 5800, 9, 10, 25),
('2300KV General', 2300, 23, 20, 50),
('590KV Efficient', 590, 10, 18, 35),
('1105KV Compact', 1105, 8, 12, 30),
('380KV Heavy', 15, 20, 40);

-- Propellers
INSERT INTO propellers (name, diameter_inches, pitch_inches, weight_g, price_usd, material) VALUES
('5" Racing', 5.0, 3.0, 2.5, 3, 'Plastic'),
('13" LongRange', 13.0, 4.5, 18, 10, 'Carbon'),
('5.1" Freestyle', 5.1, 3.0, 2.6, 4, 'Plastic');

-- Batteries
INSERT INTO batteries (name, capacity_mah, cells, weight_g, price_usd, c_rating) VALUES
('1300mAh 4S', 1300, 4, 110, 18, 75),
('2200mAh 6S', 2200, 6, 210, 35, 75),
('5000mAh 6S', 5000, 6, 650, 90, 45);

-- ESCs
INSERT INTO escs (name, continuous_current_a, voltage_v, weight_g, price_usd) VALUES
('40A 6S', 40, 6, 9, 12),
('100A 8S', 100, 8, 18, 35),
('60A 6S', 60, 6, 12, 18);

-- Video Systems
INSERT INTO video_systems (name, protocol, weight_g, power_consumption_w, price_usd) VALUES
('DJI Air Unit', 'DJI', 12, 3, 80),
('Analog FPV', 'Analog', 8, 1, 40),
('Walksnail Avatar', 'Walksnail', 22, 3.5, 120);

-- Receivers
INSERT INTO receivers (name, protocol, weight_g, power_consumption_w, price_usd) VALUES
('ELRS Nano', 'ELRS', 1.5, 0.5, 15),
('TBS Crossfire', 'Crossfire', 2, 0.6, 30);

-- Thrust Test Data
INSERT INTO thrust_tests (motor_id, propeller_id, voltage_v, rpm, thrust_g, current_a, power_w, efficiency_gw) VALUES
(1, 1, 14.8, 24000, 450, 8, 25, 18.0),
(2, 2, 14.8, 5800, 1850, 20, 72, 25.7),
(3, 2, 14.8, 9500, 2400, 28, 95, 25.3);
EOF

echo "✅ Database initialized with sample data"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo ""
echo "================================================"
echo "✅ Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Backend (API):    http://localhost:8000"
echo "2. Frontend (UI):    http://localhost:5173"
echo ""
echo "To start development:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Backend is already running in Docker!"
echo "================================================"
