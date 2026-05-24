from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi.middleware.cors import CORSMiddleware
import json
import math
from decimal import Decimal
from fastapi.responses import JSONResponse
from datetime import datetime

app = FastAPI(title="DroneMetrics API - Industrial Grade")

# Custom JSON encoder for Decimal types
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DB_CONFIG = {
    "dbname": "dronemetrics",
    "user": "admin",
    "password": "password123",
    "host": "localhost",
    "port": "5432"
}

def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

# ============== INDUSTRIAL CALCULATIONS ==============

class DroneCalculator:
    """Industrial-grade drone configuration calculator"""
    
    # Motor count for drone types
    DRONE_TYPES = {
        "quad": 4,
        "hexa": 6,
        "octa": 8
    }
    
    # Thrust safety factor (30% headroom for maneuvers)
    THRUST_SAFETY_FACTOR = 1.3
    
    # Motor efficiency constant (Kv relationship)
    MOTOR_EFFICIENCY_CONSTANT = 0.85
    
    @staticmethod
    def calculate_total_weight(
        frame_weight_g: float,
        motor_weight_g: float,
        motor_count: int,
        prop_weight_g: float,
        esc_weight_g: float,
        battery_weight_g: float,
        video_weight_g: float,
        receiver_weight_g: float,
        payload_weight_g: float
    ) -> float:
        """Calculate total system weight in grams"""
        return (
            frame_weight_g +
            (motor_weight_g * motor_count) +
            (prop_weight_g * motor_count) +
            (esc_weight_g * motor_count) +
            battery_weight_g +
            video_weight_g +
            receiver_weight_g +
            payload_weight_g
        )
    
    @staticmethod
    def calculate_required_thrust(total_weight_g: float, motor_count: int) -> float:
        """Calculate required thrust per motor with safety factor"""
        total_thrust_needed = total_weight_g * DroneCalculator.THRUST_SAFETY_FACTOR
        return total_thrust_needed / motor_count
    
    @staticmethod
    def calculate_tw_ratio(total_thrust_g: float, total_weight_g: float) -> float:
        """Calculate thrust-to-weight ratio"""
        return round(total_thrust_g / total_weight_g, 2) if total_weight_g > 0 else 0
    
    @staticmethod
    def calculate_disk_loading(total_thrust_g: float, prop_diameter_inches: float, motor_count: int) -> float:
        """
        Calculate disk loading in g/cm²
        Disk loading = Total thrust / Total disk area
        Higher = more aggressive, lower = more efficient
        """
        prop_diameter_cm = prop_diameter_inches * 2.54
        disk_area_cm2 = (math.pi * (prop_diameter_cm / 2) ** 2) * motor_count
        return round(total_thrust_g / disk_area_cm2, 2) if disk_area_cm2 > 0 else 0
    
    @staticmethod
    def calculate_flight_time(
        battery_capacity_mah: int,
        battery_cells: int,
        total_weight_g: float,
        motor_kv: int,
        prop_diameter_inches: float,
        motor_count: int
    ) -> float:
        """
        Calculate estimated flight time in minutes
        Uses empirical formula based on weight, motor KV, and battery capacity
        """
        try:
            # Battery specs
            voltage_nominal = battery_cells * 3.7  # LiPo nominal voltage
            battery_capacity_ah = battery_capacity_mah / 1000
            battery_energy_wh = battery_capacity_ah * voltage_nominal
            
            # Power consumption estimation
            # Heavier drones and higher KV = higher current draw
            # Empirical: current_draw_a ≈ (weight_kg * 9.81 * motor_count) / (voltage * motor_kv_factor)
            
            weight_kg = total_weight_g / 1000
            thrust_per_motor = (weight_kg * 9.81 * DroneCalculator.THRUST_SAFETY_FACTOR) / motor_count
            
            # Simplified power model: P = T * V_tip / efficiency
            # V_tip = 0.1 * KV * Voltage (simplified for 2D propellers)
            prop_radius_cm = (prop_diameter_inches * 2.54) / 2
            v_tip = 0.1 * motor_kv * voltage_nominal
            
            # Power per motor (watts)
            power_per_motor = (thrust_per_motor * v_tip) / (DroneCalculator.MOTOR_EFFICIENCY_CONSTANT * 1000)
            total_power_w = power_per_motor * motor_count
            
            # Flight time = battery energy / power consumption * 0.8 (reserve)
            flight_time_hours = (battery_energy_wh / total_power_w) * 0.8
            flight_time_minutes = flight_time_hours * 60
            
            return round(max(flight_time_minutes, 1), 1)
        except Exception as e:
            print(f"Flight time calculation error: {e}")
            return 0
    
    @staticmethod
    def calculate_max_speed(motor_kv: int, battery_cells: int, prop_diameter_inches: float) -> float:
        """
        Calculate theoretical maximum speed in km/h
        Based on motor KV, battery voltage, and propeller diameter
        """
        try:
            voltage_nominal = battery_cells * 3.7
            voltage_max = battery_cells * 4.2  # Fully charged LiPo
            
            # Max RPM at full throttle
            max_rpm = motor_kv * voltage_max * 0.95  # 95% efficiency factor
            
            # Linear speed = RPM * circumference / 1000 (to get m/s then km/h)
            prop_circumference_mm = math.pi * (prop_diameter_inches * 2.54 * 10)
            speed_ms = (max_rpm * prop_circumference_mm) / (60 * 1000)
            speed_kmh = speed_ms * 3.6
            
            return round(speed_kmh, 1)
        except:
            return 0
    
    @staticmethod
    def calculate_max_altitude(total_weight_g: float, total_thrust_g: float, prop_diameter_inches: float) -> float:
        """
        Calculate theoretical maximum altitude in meters
        Based on atmospheric density, weight, and propeller characteristics
        """
        try:
            # Simplified: max altitude limited by thrust margin and air density
            # Empirical data shows ~2m altitude per gram of excess thrust
            excess_thrust_g = total_thrust_g - total_weight_g
            base_altitude = excess_thrust_g * 2
            
            # Propeller diameter effect (larger props perform better at altitude)
            prop_factor = math.sqrt(prop_diameter_inches / 5.0)
            
            max_altitude = base_altitude * prop_factor * 1000 / 1000
            return round(max(max_altitude, 50), 0)
        except:
            return 0
    
    @staticmethod
    def calculate_efficiency_score(
        efficiency_gw: float,
        disk_loading: float,
        power_consumption_w: float
    ) -> float:
        """
        Calculate overall efficiency score (0-100)
        Based on motor efficiency, disk loading, and power consumption
        """
        try:
            # Efficiency score (motor efficiency)
            efficiency_score = min((efficiency_gw / 5.0) * 33, 33)
            
            # Disk loading score (optimal is 2.5-3.5 g/cm²)
            optimal_disk_loading = 3.0
            disk_loading_score = 33 * math.exp(-((disk_loading - optimal_disk_loading) ** 2) / 4)
            
            # Power efficiency score
            power_score = min((200 / power_consumption_w) * 34, 34) if power_consumption_w > 0 else 0
            
            return round(efficiency_score + disk_loading_score + power_score, 1)
        except:
            return 0
    
    @staticmethod
    def calculate_distance_range(
        flight_time_min: float,
        max_speed_kmh: float,
        wind_speed_kmh: float = 0
    ) -> dict:
        """
        Calculate distance range estimations
        Returns: dict with hovering distance, forward/backward distance with different speeds
        """
        try:
            # Convert flight time to hours
            flight_time_h = flight_time_min / 60
            
            # Hovering (0 speed)
            hover_distance = 0
            
            # Forward flight at different speeds
            # Headwind reduces distance, tailwind increases it
            speeds = [0.3, 0.5, 0.7]  # 30%, 50%, 70% max speed
            
            range_data = {
                "hover_distance_m": hover_distance,
                "max_speed_kmh": round(max_speed_kmh, 1),
                "flight_time_min": round(flight_time_min, 1),
                "range_estimates": []
            }
            
            for speed_ratio in speeds:
                cruise_speed = max_speed_kmh * speed_ratio
                headwind_speed = cruise_speed - wind_speed_kmh
                tailwind_speed = cruise_speed + wind_speed_kmh
                
                # Assume 2x flight time at cruise (conservative)
                cruise_flight_time = flight_time_min * 0.7 / 60  # 70% of flight time at cruise
                
                # Range = speed * time / 2 (out and back)
                headwind_range = (headwind_speed * cruise_flight_time) / 2 * 1000  # meters
                tailwind_range = (tailwind_speed * cruise_flight_time) / 2 * 1000  # meters
                avg_range = (headwind_speed + tailwind_speed) / 2 * cruise_flight_time / 2 * 1000
                
                range_data["range_estimates"].append({
                    "speed_percent": int(speed_ratio * 100),
                    "cruise_speed_kmh": round(cruise_speed, 1),
                    "headwind_range_m": round(max(headwind_range, 0), 0),
                    "average_range_m": round(avg_range, 0),
                    "tailwind_range_m": round(tailwind_range, 0)
                })
            
            return range_data
        except Exception as e:
            print(f"Distance range calculation error: {e}")
            return {"error": str(e)}
    
    @staticmethod
    def calculate_motor_performance(
        motor_kv: int,
        battery_cells: int,
        thrust_g: float,
        motor_weight_g: float,
        prop_diameter_inches: float,
        current_a: float,
        power_w: float
    ) -> dict:
        """
        Calculate motor performance metrics under full acceleration
        Returns: power, efficiency, losses, temperature estimation
        """
        try:
            voltage = battery_cells * 3.7  # nominal voltage
            
            # Full throttle (100% power)
            max_voltage = battery_cells * 4.2  # fully charged
            max_rpm = motor_kv * max_voltage
            
            # Power calculations
            power_input_w = power_w  # from thrust tests
            
            # Motor losses (copper + friction)
            # Typical motor efficiency is 80-90%, so losses are 10-20%
            motor_efficiency = 0.85  # 85% typical for brushless motors
            mechanical_power_w = power_input_w * motor_efficiency
            power_losses_w = power_input_w * (1 - motor_efficiency)
            
            # Temperature rise estimation
            # Each watt of losses increases temp by ~0.5-1°C above ambient
            # Ambient = 25°C
            ambient_temp_c = 25
            temp_rise_c = power_losses_w * 0.7  # 0.7°C per watt
            motor_temp_c = ambient_temp_c + temp_rise_c
            
            # Thrust power efficiency (grams per watt)
            thrust_efficiency = thrust_g / power_input_w if power_input_w > 0 else 0
            
            # Propeller efficiency based on disk loading
            prop_diameter_cm = prop_diameter_inches * 2.54
            disk_area_cm2 = math.pi * (prop_diameter_cm / 2) ** 2
            disk_loading = thrust_g / disk_area_cm2 if disk_area_cm2 > 0 else 0
            
            # Efficiency at different throttle levels
            throttle_levels = [25, 50, 75, 100]
            throttle_data = []
            
            for throttle_percent in throttle_levels:
                throttle_ratio = throttle_percent / 100
                throttle_power = power_input_w * (throttle_ratio ** 2)  # Power scales with square of throttle
                throttle_thrust = thrust_g * throttle_ratio
                throttle_losses = throttle_power * (1 - motor_efficiency)
                throttle_temp = ambient_temp_c + (throttle_losses * 0.7)
                throttle_efficiency = throttle_thrust / throttle_power if throttle_power > 0 else 0
                
                throttle_data.append({
                    "throttle_percent": throttle_percent,
                    "power_w": round(throttle_power, 1),
                    "thrust_g": round(throttle_thrust, 1),
                    "losses_w": round(throttle_losses, 1),
                    "motor_temp_c": round(throttle_temp, 1),
                    "efficiency_g_per_w": round(throttle_efficiency, 2)
                })
            
            performance = {
                "motor_kv": motor_kv,
                "max_rpm": round(max_rpm, 0),
                "max_voltage_v": round(max_voltage, 1),
                "full_throttle": {
                    "power_input_w": round(power_input_w, 1),
                    "mechanical_power_w": round(mechanical_power_w, 1),
                    "power_losses_w": round(power_losses_w, 1),
                    "motor_temp_c": round(motor_temp_c, 1),
                    "motor_efficiency_percent": round(motor_efficiency * 100, 1),
                    "thrust_efficiency_g_per_w": round(thrust_efficiency, 2),
                    "disk_loading_g_cm2": round(disk_loading, 2)
                },
                "throttle_progression": throttle_data
            }
            
            return performance
        except Exception as e:
            print(f"Motor performance calculation error: {e}")
            return {"error": str(e)}

# ============== PYDANTIC MODELS ==============

class DroneRequest(BaseModel):
    drone_type: str  # 'quad', 'hexa', 'octa'
    frame_size_inches: float
    payload_weight_g: float
    battery_capacity_mah: int
    battery_cells: int
    video_protocol: str
    radio_protocol: str
    desired_speed_kmh: Optional[float] = None
    desired_flight_time_min: Optional[float] = None

class ConfigurationSave(BaseModel):
    name: str
    drone_type: str
    frame_size_inches: float
    payload_weight_g: float
    battery_capacity_mah: int
    battery_cells: int
    video_protocol: str
    radio_protocol: str
    motor_name: str
    motor_kv: int
    prop_name: str
    prop_diameter: float
    esc_name: str
    frame_name: str
    total_price: float
    total_weight_g: float
    tw_ratio: float
    flight_time_min: float

# ============== API ENDPOINTS ==============

@app.get("/")
def read_root():
    return {"message": "DroneMetrics Industrial Grade API"}

@app.get("/api/frames")
def get_frames():
    """Get all available frames"""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT * FROM frames 
            ORDER BY drone_type, size_inches ASC
        """)
        frames = cursor.fetchall()
        return {"data": frames}
    finally:
        cursor.close()
        conn.close()

@app.post("/api/optimize")
def optimize_drone(req: DroneRequest):
    """
    Optimize drone configuration with industrial calculations
    Supports quad, hexa, and octa configurations
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    cursor = conn.cursor()
    try:
        motor_count = DroneCalculator.DRONE_TYPES.get(req.drone_type, 4)
        voltage = 14.8 if req.battery_cells == 4 else (22.2 if req.battery_cells == 6 else 29.6)
        
        # Get video and receiver systems
        cursor.execute(
            "SELECT * FROM video_systems WHERE protocol = %s LIMIT 1",
            (req.video_protocol,)
        )
        video = cursor.fetchone()
        
        cursor.execute(
            "SELECT * FROM receivers WHERE protocol = %s LIMIT 1",
            (req.radio_protocol,)
        )
        rx = cursor.fetchone()
        
        if not video or not rx:
            raise HTTPException(status_code=400, detail="Video or receiver system not found")
        
        # Get frames matching drone type
        cursor.execute(
            "SELECT * FROM frames WHERE drone_type = %s AND size_inches = %s LIMIT 1",
            (req.drone_type, req.frame_size_inches)
        )
        frame = cursor.fetchone()
        
        if not frame:
            raise HTTPException(status_code=400, detail="Frame not found")
        
        # Get battery specs
        cursor.execute(
            "SELECT * FROM batteries WHERE cells = %s ORDER BY capacity_mah DESC LIMIT 1",
            (req.battery_cells,)
        )
        battery = cursor.fetchone()
        
        if not battery:
            raise HTTPException(status_code=400, detail="Battery not found")
        
        # Find matching motor/propeller combinations
        query = """
            SELECT 
                m.id as motor_id, m.name as motor_name, m.kv as motor_kv, 
                m.weight_g as motor_weight, m.price_usd as motor_price,
                p.id as prop_id, p.name as prop_name, p.diameter_inches as prop_diameter,
                p.weight_g as prop_weight, p.price_usd as prop_price,
                t.thrust_g as thrust_100g, t.current_a, t.power_w, t.efficiency_gw,
                e.name as esc_name, e.price_usd as esc_price, e.weight_g as esc_weight,
                e.continuous_current_a as esc_max_current
            FROM thrust_tests t
            JOIN motors m ON t.motor_id = m.id
            JOIN propellers p ON t.propeller_id = p.id
            JOIN escs e ON e.continuous_current_a >= (t.current_a * 1.2)
            WHERE t.voltage_v = %s AND p.diameter_inches = %s
            ORDER BY t.efficiency_gw DESC
            LIMIT 50
        """
        
        cursor.execute(query, (voltage, req.frame_size_inches))
        results = cursor.fetchall()
        
        valid_configs = []
        unique_combos = set()
        
        for row in results:
            combo_key = f"{row['motor_name']}_{row['prop_name']}"
            if combo_key in unique_combos:
                continue
            
            # INDUSTRIAL CALCULATIONS
            total_weight = DroneCalculator.calculate_total_weight(
                frame_weight_g=float(frame['weight_g']),
                motor_weight_g=float(row['motor_weight']),
                motor_count=motor_count,
                prop_weight_g=float(row['prop_weight']),
                esc_weight_g=float(row['esc_weight']),
                battery_weight_g=float(battery['weight_g']),
                video_weight_g=float(video['weight_g']),
                receiver_weight_g=float(rx['weight_g']),
                payload_weight_g=req.payload_weight_g
            )
            
            total_thrust = float(row['thrust_100g']) * motor_count
            tw_ratio = DroneCalculator.calculate_tw_ratio(total_thrust, total_weight)
            disk_loading = DroneCalculator.calculate_disk_loading(total_thrust, float(row['prop_diameter']), motor_count)
            
            total_price = (
                float(row['motor_price']) * motor_count +
                float(row['prop_price']) * motor_count +
                float(row['esc_price']) * motor_count +
                float(video['price_usd']) +
                float(rx['price_usd']) +
                float(frame['price_usd']) +
                float(battery['price_usd'])
            )
            
            # Power consumption
            total_power_w = float(row['power_w']) * motor_count + float(video['power_consumption_w']) + float(rx['power_consumption_w'])
            
            # Flight time calculation
            flight_time = DroneCalculator.calculate_flight_time(
                req.battery_capacity_mah,
                req.battery_cells,
                total_weight,
                row['motor_kv'],
                float(row['prop_diameter']),
                motor_count
            )
            
            # Max speed
            max_speed = DroneCalculator.calculate_max_speed(row['motor_kv'], req.battery_cells, float(row['prop_diameter']))
            
            # Max altitude
            max_altitude = DroneCalculator.calculate_max_altitude(total_weight, total_thrust, float(row['prop_diameter']))
            
            # Efficiency score
            efficiency_score = DroneCalculator.calculate_efficiency_score(
                float(row['efficiency_gw']),
                disk_loading,
                total_power_w
            )
            
            # Optimization score (weighted)
            efficiency_weight = 0.3
            tw_weight = 0.3
            price_weight = 0.2
            flight_time_weight = 0.2
            
            norm_efficiency = min(efficiency_score / 100, 1.0)
            norm_tw = min(tw_ratio / 5, 1.0)
            norm_price = max(1 - (total_price / 3000), 0)
            norm_flight_time = min(flight_time / 30, 1.0)
            
            optimization_score = round(
                (norm_efficiency * efficiency_weight +
                 norm_tw * tw_weight +
                 norm_price * price_weight +
                 norm_flight_time * flight_time_weight) * 100,
                1
            )
            
            # Tags
            tags = []
            if tw_ratio > 5:
                tags.append("⚡ Acrobatic")
            elif tw_ratio > 3:
                tags.append("📹 Cinematic")
            else:
                tags.append("🏗️ Heavy Lifter")
            
            if flight_time > 20:
                tags.append("🔋 Long Range")
            
            if float(row['efficiency_gw']) > 4.5:
                tags.append("✨ Efficient")
            
            if disk_loading < 3.0:
                tags.append("🎯 Smooth Flight")
            
            # Components list
            components = [
                {"type": f"Motor x{motor_count}", "name": row['motor_name'], "price": f"${float(row['motor_price']) * motor_count:.2f}"},
                {"type": f"Propeller x{motor_count}", "name": row['prop_name'], "price": f"${float(row['prop_price']) * motor_count:.2f}"},
                {"type": f"ESC x{motor_count}", "name": row['esc_name'], "price": f"${float(row['esc_price']) * motor_count:.2f}"},
                {"type": "Frame", "name": frame['name'], "price": f"${float(frame['price_usd']):.2f}"},
                {"type": "Battery", "name": battery['name'], "price": f"${float(battery['price_usd']):.2f}"},
                {"type": "Video System", "name": video['name'], "price": f"${float(video['price_usd']):.2f}"},
                {"type": "Receiver", "name": rx['name'], "price": f"${float(rx['price_usd']):.2f}"}
            ]
            
            valid_configs.append({
                "name": f"{row['motor_name']} + {row['prop_name']}",
                "drone_type": req.drone_type,
                "motor_count": motor_count,
                "components": components,
                "total_price": round(total_price, 2),
                "total_weight_g": round(total_weight, 1),
                "motor_name": row['motor_name'],
                "motor_kv": row['motor_kv'],
                "prop_name": row['prop_name'],
                "prop_diameter": float(row['prop_diameter']),
                "esc_name": row['esc_name'],
                "frame_name": frame['name'],
                "tw_ratio": tw_ratio,
                "total_thrust_g": round(total_thrust, 1),
                "disk_loading": disk_loading,
                "flight_time_min": flight_time,
                "max_speed_kmh": max_speed,
                "max_altitude_m": int(max_altitude),
                "power_consumption_w": round(total_power_w, 1),
                "efficiency_score": efficiency_score,
                "optimization_score": optimization_score,
                "tags": tags
            })
            
            unique_combos.add(combo_key)
        
        # Sort by optimization score
        valid_configs.sort(key=lambda x: x['optimization_score'], reverse=True)
        
        response_data = {"data": valid_configs}
        return JSONResponse(content=json.loads(json.dumps(response_data, cls=DecimalEncoder)))
    
    finally:
        cursor.close()
        conn.close()

@app.post("/api/configurations")
def save_configuration(config: ConfigurationSave):
    """Save drone configuration to database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO configurations 
            (name, drone_type, frame_size_inches, payload_weight_g, battery_capacity_mah, 
             battery_cells, video_protocol, radio_protocol, motor_name, motor_kv, 
             prop_name, prop_diameter, esc_name, frame_name, total_price, total_weight_g, 
             tw_ratio, flight_time_min)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            config.name, config.drone_type, config.frame_size_inches, config.payload_weight_g,
            config.battery_capacity_mah, config.battery_cells, config.video_protocol,
            config.radio_protocol, config.motor_name, config.motor_kv, config.prop_name,
            config.prop_diameter, config.esc_name, config.frame_name, config.total_price,
            config.total_weight_g, config.tw_ratio, config.flight_time_min
        ))
        result = cursor.fetchone()
        if result is None:
            raise HTTPException(status_code=500, detail="Insert failed")
        config_id = result['id']
        conn.commit()
        return {"id": config_id, "message": "Configuration saved successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/configurations")
def get_configurations(limit: int = 20):
    """Get saved configurations"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT * FROM configurations 
            ORDER BY created_at DESC 
            LIMIT %s
        """, (limit,))
        configs = cursor.fetchall()
        return {"data": [dict(row) for row in configs]}
    finally:
        cursor.close()
        conn.close()

@app.get("/api/analytics")
def get_analytics():
    """Get comprehensive analytics"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) as total FROM configurations")
        total_configs = cursor.fetchone()['total']
        
        cursor.execute("SELECT AVG(total_price) as avg_price FROM configurations")
        avg_price = float(cursor.fetchone()['avg_price'] or 0)
        
        cursor.execute("SELECT AVG(tw_ratio) as avg_tw FROM configurations")
        avg_tw = float(cursor.fetchone()['avg_tw'] or 0)
        
        cursor.execute("SELECT AVG(flight_time_min) as avg_flight FROM configurations")
        avg_flight = float(cursor.fetchone()['avg_flight'] or 0)
        
        cursor.execute("""
            SELECT drone_type, COUNT(*) as count 
            FROM configurations 
            GROUP BY drone_type
        """)
        type_distribution = cursor.fetchall()
        
        cursor.execute("""
            SELECT 
                ROUND(tw_ratio::numeric, 1) as tw_bucket,
                COUNT(*) as count
            FROM configurations
            GROUP BY ROUND(tw_ratio::numeric, 1)
            ORDER BY tw_bucket
        """)
        tw_distribution = cursor.fetchall()
        
        return {
            "total_configurations": total_configs,
            "average_price": round(avg_price, 2),
            "average_tw_ratio": round(avg_tw, 2),
            "average_flight_time": round(avg_flight, 1),
            "drone_type_distribution": [dict(row) for row in type_distribution],
            "tw_ratio_distribution": [dict(row) for row in tw_distribution]
        }
    finally:
        cursor.close()
        conn.close()

@app.get("/api/configuration-analysis/{config_id}")
@app.options("/api/configuration-analysis/{config_id}")
def get_configuration_analysis(config_id: int):
    """Get detailed analysis for a configuration including range and motor performance"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Get configuration details
        cursor.execute("""
            SELECT * FROM configurations 
            WHERE id = %s
        """, (config_id,))
        config = cursor.fetchone()
        
        if not config:
            raise HTTPException(status_code=404, detail="Configuration not found")
        
        config_dict = dict(config)
        
        # Get motor count from drone type
        motor_count = DroneCalculator.DRONE_TYPES.get(config_dict['drone_type'], 4)
        
        # Get motor specs from database
        cursor.execute("""
            SELECT * FROM motors WHERE name = %s LIMIT 1
        """, (config_dict['motor_name'],))
        motor = cursor.fetchone()
        
        # Get propeller specs
        cursor.execute("""
            SELECT * FROM propellers WHERE name = %s LIMIT 1
        """, (config_dict['prop_name'],))
        propeller = cursor.fetchone()
        
        # Get thrust test data for this motor-propeller combo at the battery voltage
        voltage = config_dict['battery_cells'] * 3.7
        cursor.execute("""
            SELECT * FROM thrust_tests 
            WHERE motor_id = (SELECT id FROM motors WHERE name = %s LIMIT 1)
            AND propeller_id = (SELECT id FROM propellers WHERE name = %s LIMIT 1)
            AND voltage_v = %s
            LIMIT 1
        """, (config_dict['motor_name'], config_dict['prop_name'], voltage))
        thrust_test = cursor.fetchone()
        
        # Prepare response with detailed analysis
        analysis = {
            "configuration": config_dict,
            "motor_specs": dict(motor) if motor else None,
            "propeller_specs": dict(propeller) if propeller else None,
            "thrust_test": dict(thrust_test) if thrust_test else None
        }
        
        # Calculate max speed and other metrics if not in config
        if motor and propeller and thrust_test:
            max_speed = DroneCalculator.calculate_max_speed(
                config_dict['motor_kv'],
                config_dict['battery_cells'],
                float(propeller['diameter_inches'])
            )
            
            total_weight = config_dict['total_weight_g']
            total_thrust = float(thrust_test['thrust_g']) * motor_count
            
            max_altitude = DroneCalculator.calculate_max_altitude(
                total_weight,
                total_thrust,
                float(propeller['diameter_inches'])
            )
            
            # Calculate distance range
            range_data = DroneCalculator.calculate_distance_range(
                float(config_dict['flight_time_min']),
                max_speed,
                wind_speed_kmh=0
            )
            analysis["distance_range"] = range_data
            analysis["max_speed_kmh"] = max_speed
            analysis["max_altitude_m"] = max_altitude
            
            # Calculate motor performance
            motor_perf = DroneCalculator.calculate_motor_performance(
                motor_kv=int(motor['kv']),
                battery_cells=int(config_dict['battery_cells']),
                thrust_g=float(thrust_test['thrust_g']),
                motor_weight_g=float(motor['weight_g']),
                prop_diameter_inches=float(propeller['diameter_inches']),
                current_a=float(thrust_test['current_a']),
                power_w=float(thrust_test['power_w'])
            )
            analysis["motor_performance"] = motor_perf
        
        return {"data": analysis}
    
    except Exception as e:
        print(f"Configuration analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")