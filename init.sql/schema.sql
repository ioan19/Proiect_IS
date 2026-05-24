-- DRONE METRICS DATABASE SCHEMA (Industrial Grade)

-- DROP OLD TABLES (for schema updates)
DROP TABLE IF EXISTS configuration_analysis CASCADE;
DROP TABLE IF EXISTS configurations CASCADE;
DROP TABLE IF EXISTS thrust_tests CASCADE;
DROP TABLE IF EXISTS receivers CASCADE;
DROP TABLE IF EXISTS video_systems CASCADE;
DROP TABLE IF EXISTS escs CASCADE;
DROP TABLE IF EXISTS batteries CASCADE;
DROP TABLE IF EXISTS propellers CASCADE;
DROP TABLE IF EXISTS motors CASCADE;
DROP TABLE IF EXISTS frames CASCADE;

-- 1. FRAMES TABLE (with motor count)
CREATE TABLE frames (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    size_inches FLOAT NOT NULL,
    weight_g FLOAT NOT NULL,
    price_usd FLOAT NOT NULL,
    drone_type VARCHAR(20) NOT NULL, -- 'quad', 'hexa', 'octa'
    motor_count INT NOT NULL DEFAULT 4,
    material VARCHAR(50),
    max_takeoff_weight_g FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. MOTORS TABLE (with KV and specs)
CREATE TABLE motors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    kv INT NOT NULL,
    weight_g FLOAT NOT NULL,
    price_usd FLOAT NOT NULL,
    max_current_a FLOAT,
    shaft_diameter_mm FLOAT,
    pole_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. PROPELLERS TABLE
CREATE TABLE propellers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    diameter_inches FLOAT NOT NULL,
    pitch_inches FLOAT NOT NULL,
    weight_g FLOAT NOT NULL,
    price_usd FLOAT NOT NULL,
    material VARCHAR(50),
    blade_count INT DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. THRUST TEST DATA (industrial benchmark)
CREATE TABLE thrust_tests (
    id SERIAL PRIMARY KEY,
    motor_id INT REFERENCES motors(id),
    propeller_id INT REFERENCES propellers(id),
    voltage_v FLOAT NOT NULL,
    rpm INT NOT NULL,
    thrust_g FLOAT NOT NULL,
    current_a FLOAT NOT NULL,
    power_w FLOAT NOT NULL,
    efficiency_gw FLOAT NOT NULL, -- grams per watt
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. BATTERIES TABLE
CREATE TABLE batteries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity_mah INT NOT NULL,
    cells INT NOT NULL, -- voltage in S (series)
    weight_g FLOAT NOT NULL,
    price_usd FLOAT NOT NULL,
    c_rating FLOAT NOT NULL, -- discharge rate
    max_continuous_a FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. ESCs TABLE
CREATE TABLE escs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    continuous_current_a FLOAT NOT NULL,
    burst_current_a FLOAT,
    voltage_v INT NOT NULL, -- max voltage in S
    weight_g FLOAT NOT NULL,
    price_usd FLOAT NOT NULL,
    firmware VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. VIDEO SYSTEMS TABLE
CREATE TABLE video_systems (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    protocol VARCHAR(50) NOT NULL,
    weight_g FLOAT NOT NULL,
    power_consumption_w FLOAT NOT NULL,
    price_usd FLOAT NOT NULL,
    latency_ms INT,
    resolution VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. RECEIVERS TABLE
CREATE TABLE receivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    protocol VARCHAR(50) NOT NULL,
    weight_g FLOAT NOT NULL,
    power_consumption_w FLOAT NOT NULL,
    price_usd FLOAT NOT NULL,
    frequency_mhz INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. ENHANCED CONFIGURATIONS TABLE
CREATE TABLE configurations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    drone_type VARCHAR(20) NOT NULL, -- quad, hexa, octa
    frame_size_inches FLOAT NOT NULL,
    payload_weight_g FLOAT NOT NULL,
    battery_capacity_mah INT NOT NULL,
    battery_cells INT NOT NULL,
    video_protocol VARCHAR(50),
    radio_protocol VARCHAR(50),
    motor_name VARCHAR(100),
    motor_kv INT,
    prop_name VARCHAR(100),
    prop_diameter FLOAT,
    esc_name VARCHAR(100),
    frame_name VARCHAR(100),
    total_price FLOAT,
    total_weight_g FLOAT,
    tw_ratio FLOAT,
    thrust_per_motor_g FLOAT,
    total_thrust_g FLOAT,
    power_consumption_w FLOAT,
    flight_time_min FLOAT,
    max_current_a FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. CONFIGURATION ANALYSIS TABLE (for storing analysis results)
CREATE TABLE configuration_analysis (
    id SERIAL PRIMARY KEY,
    configuration_id INT REFERENCES configurations(id),
    drone_type VARCHAR(20),
    motor_count INT,
    total_weight_g FLOAT,
    max_takeoff_weight_g FLOAT,
    disk_loading_g_sqcm FLOAT,
    power_loading_w_g FLOAT,
    thrust_margin_percent FLOAT,
    efficiency_score FLOAT,
    flight_time_min FLOAT,
    max_altitude_m FLOAT,
    max_speed_kmh FLOAT,
    optimization_score FLOAT,
    analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_thrust_tests_motor ON thrust_tests(motor_id);
CREATE INDEX IF NOT EXISTS idx_thrust_tests_prop ON thrust_tests(propeller_id);
CREATE INDEX IF NOT EXISTS idx_configurations_date ON configurations(created_at);
CREATE INDEX IF NOT EXISTS idx_analysis_config ON configuration_analysis(configuration_id);
