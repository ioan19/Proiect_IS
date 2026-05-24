import random
import os

# Liste de branduri pentru realism
frame_brands = ["iFlight", "TBS", "GEPRC", "Lumenier", "BetaFPV", "Diatone", "Holybro", "Flywoo", "Armattan", "Tarot"]
motor_brands = ["T-Motor", "XING", "EMAX", "BrotherHobby", "RCINPOWER", "GEPRC", "Hyperlite", "KDE", "DJI", "Sunnysky"]
prop_brands = ["HQProp", "Gemfan", "Ethix", "APC", "DALPROP", "T-Motor", "Master Airscrew"]
battery_brands = ["Tattu", "CNHL", "GNB", "Lumenier", "ThunderPower", "Turnigy", "RDQ", "Ovonic"]
esc_brands = ["SpeedyBee", "Hobbywing", "Diatone", "T-Motor", "Foxeer", "Aikon", "Spedix", "Tekko32"]
video_brands = ["DJI", "Walksnail", "HDZero", "Caddx", "RunCam", "Foxeer", "TBS", "RushFPV"]
rx_brands = ["Radiomaster", "BetaFPV", "TBS", "FrSky", "FlySky", "Happymodel", "Matek", "Jumper"]

os.makedirs('init.sql', exist_ok=True)

with open('init.sql/03_massive_data.sql', 'w', encoding='utf-8') as f:
    f.write("-- AUTOMATICALLY GENERATED DATASET (50+ per category)\n\n")
    # Stergem tabelele si resetam ID-urile la 1 pentru a evita erorile de chei straine
    f.write("TRUNCATE TABLE configuration_analysis, configurations, thrust_tests, receivers, video_systems, escs, batteries, propellers, motors, frames RESTART IDENTITY CASCADE;\n\n")

    # 1. FRAMES
    f.write("INSERT INTO frames (name, size_inches, weight_g, price_usd, drone_type, motor_count, material, max_takeoff_weight_g) VALUES\n")
    frame_values = []
    for _ in range(55):
        brand = random.choice(frame_brands)
        size = random.choice([2.0, 2.5, 3.0, 3.5, 4.0, 5.0, 6.0, 7.0, 8.0, 10.0, 12.0, 15.0])
        if size <= 7.0:
            dtype, mcount = "quad", 4
        elif size <= 10.0:
            dtype, mcount = random.choice([("quad", 4), ("hexa", 6)])
        else:
            dtype, mcount = random.choice([("hexa", 6), ("octa", 8)])

        weight = size * random.uniform(15, 30) * (mcount/4)
        price = size * random.uniform(8, 20)
        mtow = weight * random.uniform(8, 15)
        frame_values.append(f"('{brand} Frame V{random.randint(1,5)} {size}\"', {size}, {weight:.1f}, {price:.1f}, '{dtype}', {mcount}, 'Carbon', {mtow:.0f})")
    f.write(",\n".join(frame_values) + ";\n\n")

    # 2. MOTORS
    f.write("INSERT INTO motors (name, kv, weight_g, price_usd, max_current_a, shaft_diameter_mm, pole_count) VALUES\n")
    motor_values, motors = [], []
    for i in range(1, 56):
        brand = random.choice(motor_brands)
        category = random.choice(["micro", "freestyle", "longrange", "heavy"])
        if category == "micro":
            kv, weight, price, amps = random.randint(3500, 7000), random.uniform(5, 12), random.uniform(10, 16), random.uniform(10, 20)
        elif category == "freestyle":
            kv, weight, price, amps = random.randint(1700, 2800), random.uniform(25, 35), random.uniform(15, 28), random.uniform(30, 50)
        elif category == "longrange":
            kv, weight, price, amps = random.randint(900, 1500), random.uniform(35, 50), random.uniform(20, 35), random.uniform(40, 60)
        else:
            kv, weight, price, amps = random.randint(300, 800), random.uniform(80, 150), random.uniform(40, 80), random.uniform(25, 60)

        name = f"{brand} {random.randint(11,32)}{random.randint(0,1)}{random.randint(2,8)} {kv}KV"
        motor_values.append(f"('{name}', {kv}, {weight:.1f}, {price:.1f}, {amps:.1f}, 5.0, 14)")
        motors.append({'id': i, 'name': name, 'kv': kv, 'category': category})
    f.write(",\n".join(motor_values) + ";\n\n")

    # 3. PROPELLERS
    f.write("INSERT INTO propellers (name, diameter_inches, pitch_inches, weight_g, price_usd, material, blade_count) VALUES\n")
    prop_values, props = [], []
    for i in range(1, 56):
        brand = random.choice(prop_brands)
        category = random.choice(["micro", "freestyle", "longrange", "heavy"])
        if category == "micro": dia, pitch, weight = random.choice([2.0, 2.5, 3.0, 3.5]), random.uniform(1.5, 3.0), random.choice([2.0, 2.5, 3.0]) * 0.8
        elif category == "freestyle": dia, pitch, weight = random.choice([5.0, 5.1, 5.2]), random.uniform(3.0, 4.5), 5.0 * 0.9
        elif category == "longrange": dia, pitch, weight = random.choice([6.0, 7.0]), random.uniform(3.5, 5.0), 7.0 * 1.2
        else: dia, pitch, weight = random.choice([8.0, 10.0, 12.0, 15.0]), random.uniform(4.0, 6.0), 10.0 * 2.0

        price, blades = dia * random.uniform(0.5, 1.5), random.choice([2, 3]) if dia > 7 else random.choice([3, 4])
        name = f"{brand} {dia}x{pitch:.1f}x{blades}"
        prop_values.append(f"('{name}', {dia}, {pitch:.1f}, {weight:.1f}, {price:.1f}, 'Polycarbonate', {blades})")
        props.append({'id': i, 'dia': dia, 'category': category})
    f.write(",\n".join(prop_values) + ";\n\n")

    # 4. BATTERIES
    f.write("INSERT INTO batteries (name, capacity_mah, cells, weight_g, price_usd, c_rating, max_continuous_a) VALUES\n")
    batt_values = []
    for _ in range(55):
        brand, cells = random.choice(battery_brands), random.choice([2, 3, 4, 6, 8, 12])
        cap = random.choice([450, 650, 850, 1100, 1300, 1500]) if cells <= 4 else (random.choice([1000, 1200, 1400, 2200, 4000, 8000]) if cells == 6 else random.choice([5000, 8000, 10000, 16000, 22000]))
        weight, price, c_rating = (cap / 1000) * cells * 40, (cap / 1000) * cells * random.uniform(3, 5), random.choice([45, 60, 100, 120, 150])
        batt_values.append(f"('{brand} {cap}mAh {cells}S', {cap}, {cells}, {weight:.0f}, {price:.0f}, {c_rating}, {(cap / 1000) * c_rating:.0f})")
    f.write(",\n".join(batt_values) + ";\n\n")

    # 5. ESCs
    f.write("INSERT INTO escs (name, continuous_current_a, burst_current_a, voltage_v, weight_g, price_usd, firmware) VALUES\n")
    esc_values = []
    for _ in range(55):
        brand, amps = random.choice(esc_brands), random.choice([15, 20, 35, 45, 55, 60, 65, 80, 100, 150])
        volts = 4 if amps < 30 else (6 if amps <= 80 else random.choice([8, 14]))
        fw = random.choice(["BLHeli_S", "BLHeli_32", "AM32", "Custom"])
        esc_values.append(f"('{brand} {amps}A V{random.randint(1,3)}', {amps}, {amps*1.2:.0f}, {volts}, {amps * random.uniform(0.2, 0.4):.1f}, {amps * random.uniform(0.8, 1.2):.0f}, '{fw}')")
    f.write(",\n".join(esc_values) + ";\n\n")

    # 6. VIDEO SYSTEMS
    f.write("INSERT INTO video_systems (name, protocol, weight_g, power_consumption_w, price_usd, latency_ms, resolution) VALUES\n")
    vid_values = []
    for _ in range(55):
        brand = random.choice(video_brands)
        is_digital = brand in ["DJI", "Walksnail", "HDZero"]
        proto, res = (brand, random.choice(["720p", "1080p"])) if is_digital else ("Analog", "480p")
        lat, weight = (random.randint(15, 40), random.uniform(10, 30)) if is_digital else (random.randint(5, 12), random.uniform(2, 10))
        price, pwr = (random.uniform(80, 200), random.uniform(3, 8)) if is_digital else (random.uniform(20, 50), random.uniform(0.5, 2))
        vid_values.append(f"('{brand} VTX {random.randint(100,999)}', '{proto}', {weight:.1f}, {pwr:.1f}, {price:.0f}, {lat}, '{res}')")
    f.write(",\n".join(vid_values) + ";\n\n")

    # 7. RECEIVERS
    f.write("INSERT INTO receivers (name, protocol, weight_g, power_consumption_w, price_usd, frequency_mhz) VALUES\n")
    rx_values = []
    for _ in range(55):
        brand, proto = random.choice(rx_brands), random.choice(["ELRS", "Crossfire", "Tracer", "FrSky", "FlySky"])
        freq = 915 if proto == "Crossfire" else 2400
        rx_values.append(f"('{brand} {proto} Nano', '{proto}', {random.uniform(0.5, 3.5):.1f}, {random.uniform(0.3, 1.0):.1f}, {random.uniform(12, 35):.0f}, {freq})")
    f.write(",\n".join(rx_values) + ";\n\n")

    # 8. THRUST TESTS (Imperecheate corect fizic)
    f.write("INSERT INTO thrust_tests (motor_id, propeller_id, voltage_v, rpm, thrust_g, current_a, power_w, efficiency_gw) VALUES\n")
    thrust_values = []
    for m in motors:
        compatible_props = [p for p in props if p['category'] == m['category']]
        for p in random.sample(compatible_props, min(3, len(compatible_props))):
            volts = random.choice([14.8, 22.2]) if m['category'] in ['freestyle', 'longrange'] else (14.8 if m['category'] == 'micro' else 29.6)
            thrust = (p['dia'] ** 3) * (m['kv'] / 1000) * volts * random.uniform(0.2, 0.3)
            pwr = thrust / random.uniform(2.0, 4.5) 
            amps, rpm, eff = pwr / volts, volts * m['kv'] * random.uniform(0.7, 0.85), thrust / pwr
            thrust_values.append(f"({m['id']}, {p['id']}, {volts}, {rpm:.0f}, {thrust:.0f}, {amps:.1f}, {pwr:.1f}, {eff:.2f})")
    f.write(",\n".join(thrust_values) + ";\n\n")

print("Gata! Baza de date imensa a fost salvata in init.sql/03_massive_data.sql")