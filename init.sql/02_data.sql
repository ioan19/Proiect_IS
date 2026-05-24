-- Sample Data for DroneMetrics Database

-- Frames
INSERT INTO frames (name, size_inches, weight_g, price_usd, drone_type, motor_count, material, max_takeoff_weight_g) VALUES
('TinyWhoop Frame', 3.5, 15, 25, 'quad', 4, 'Plastic', 300),
('Freestyle Frame 5"', 5.0, 30, 45, 'quad', 4, 'Carbon', 1200),
('Racing Frame 5"', 5.0, 28, 50, 'quad', 4, 'Carbon', 1100),
('LongRange Frame 7"', 7.0, 50, 70, 'quad', 4, 'Carbon', 2500),
('Hexa Lift Frame', 5.5, 80, 90, 'hexa', 6, 'Carbon', 3000),
('Heavy Lift Octa', 8.0, 150, 150, 'octa', 8, 'Carbon', 5000);

-- Motors
INSERT INTO motors (name, kv, weight_g, price_usd, max_current_a, shaft_diameter_mm, pole_count) VALUES
('T-Motor U3', 390, 9, 15, 35, 3.5, 12),
('DJI E800', 500, 8, 12, 30, 3.5, 12),
('TMotor U8 Pro', 570, 6.5, 18, 45, 3.5, 12),
('Emax RS 1105', 5800, 9, 10, 25, 4.0, 14),
('Emax RSII 2207', 2300, 23, 20, 50, 4.0, 12),
('T-Motor U8 Hexa', 380, 12, 20, 40, 4.0, 12),
('DJI E305', 590, 10, 18, 35, 3.5, 12);

-- Propellers
INSERT INTO propellers (name, diameter_inches, pitch_inches, weight_g, price_usd, material, blade_count) VALUES
('DJI 1145', 11.45, 4.5, 15, 8, 'Plastic', 2),
('T-Prop 13x4.5', 13, 4.5, 18, 10, 'Carbon', 2),
('Emax AVAN Plus', 5, 3, 2.5, 3, 'Plastic', 2),
('Emax AVAN Plus 5.1x3', 5.1, 3, 2.6, 4, 'Plastic', 2),
('Gemfan 5152', 5, 1.5, 3, 2, 'Plastic', 3),
('DAL 13x5.5', 13, 5.5, 20, 12, 'Carbon', 2),
('APC 15x5', 15, 5, 25, 15, 'Carbon', 2);

-- Batteries
INSERT INTO batteries (name, capacity_mah, cells, weight_g, price_usd, c_rating, max_continuous_a) VALUES
('Tattu 450mAh 4S', 450, 4, 45, 8, 75, 35),
('Tattu 1300mAh 4S', 1300, 4, 110, 18, 75, 100),
('Tattu 2600mAh 4S', 2600, 4, 220, 28, 60, 160),
('Tattu 6S 1000mAh', 1000, 6, 95, 20, 100, 100),
('Tattu 6S 2200mAh', 2200, 6, 210, 35, 75, 165),
('Tattu 8S 5000mAh', 5000, 8, 650, 90, 45, 225);

-- ESCs
INSERT INTO escs (name, continuous_current_a, burst_current_a, voltage_v, weight_g, price_usd, firmware) VALUES
('Emax 40A BLHeli', 40, 60, 6, 9, 12, 'BLHeli_32'),
('Hobbywing 60A', 60, 100, 6, 12, 18, 'BLHeli_S'),
('T-Motor 50A', 50, 80, 6, 10, 20, 'SimonK'),
('Emax 100A', 100, 150, 8, 18, 35, 'BLHeli_32'),
('Hobbywing 150A', 150, 200, 8, 25, 45, 'BLHeli_S'),
('T-Motor 120A', 120, 180, 8, 20, 40, 'BLHeli_32');

-- Video Systems
INSERT INTO video_systems (name, protocol, weight_g, power_consumption_w, price_usd, latency_ms, resolution) VALUES
('DJI Air Unit', 'DJI', 12, 3, 80, 130, '720p'),
('DJI O3', 'DJI', 18, 4, 200, 100, '1080p'),
('Fatshark Analog', 'Analog', 8, 1, 40, 50, '480p'),
('Walksnail Avatar HD', 'Walksnail', 22, 3.5, 120, 80, '1080p'),
('Caddx Nebula Pro', 'Analog', 6, 0.8, 35, 60, '480p');

-- Receivers
INSERT INTO receivers (name, protocol, weight_g, power_consumption_w, price_usd, frequency_mhz) VALUES
('ELRS Nano', 'ELRS', 1.5, 0.5, 15, 2400),
('ELRS Diversity', 'ELRS', 2.5, 0.8, 25, 2400),
('TBS Crossfire Nano', 'Crossfire', 2, 0.6, 30, 915),
('TBS Crossfire Micro', 'Crossfire', 1.8, 0.5, 35, 915),
('ELRS 915MHz', 'ELRS', 2, 0.6, 18, 915);

-- Thrust Test Data (Motor + Propeller Combinations)
INSERT INTO thrust_tests (motor_id, propeller_id, voltage_v, rpm, thrust_g, current_a, power_w, efficiency_gw) VALUES
-- 4S Tests (14.8V)
(1, 1, 14.8, 7500, 2100, 25, 85, 24.7),
(1, 2, 14.8, 6800, 1950, 22, 78, 25.0),
(2, 1, 14.8, 9500, 2400, 28, 95, 25.3),
(2, 2, 14.8, 8800, 2250, 26, 92, 24.5),
(3, 3, 14.8, 12000, 850, 15, 45, 18.9),
(3, 4, 14.8, 11800, 920, 16, 48, 19.2),
(4, 5, 14.8, 24000, 450, 8, 25, 18.0),
(5, 6, 14.8, 5800, 1850, 20, 72, 25.7),
(5, 7, 14.8, 4800, 1600, 18, 68, 23.5),
-- 6S Tests (22.2V)
(6, 2, 22.2, 7200, 2350, 35, 130, 18.1),
(6, 1, 22.2, 8000, 2600, 38, 142, 18.3),
(7, 2, 22.2, 9500, 2950, 42, 158, 18.7),
(7, 1, 22.2, 10800, 3200, 45, 165, 19.4);

-- Create some test configurations
INSERT INTO configurations (name, drone_type, frame_size_inches, payload_weight_g, battery_capacity_mah, battery_cells, video_protocol, radio_protocol, motor_name, motor_kv, prop_name, prop_diameter, esc_name, frame_name, total_price, total_weight_g, tw_ratio, flight_time_min, created_at)
VALUES
('Freestyle Racing', 'quad', 5.0, 0, 1300, 4, 'DJI', 'ELRS', 'Emax RS 1105', 5800, 'Gemfan 5152', 5, 'Emax 40A BLHeli', 'Freestyle Frame 5"', 280, 350, 3.2, 12.5, NOW()),
('Cinematic Quad', 'quad', 5.0, 200, 2600, 4, 'Walksnail', 'ELRS', 'DJI E305', 590, 'DAL 13x5.5', 13, 'Hobbywing 60A', 'Freestyle Frame 5"', 420, 680, 2.8, 18.3, NOW()),
('Heavy Lift Hexa', 'hexa', 5.5, 500, 2200, 6, 'DJI', 'ELRS', 'T-Motor U8 Hexa', 380, 'DAL 13x5.5', 13, 'T-Motor 120A', 'Hexa Lift Frame', 850, 1200, 2.2, 22.5, NOW());
