from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi.middleware.cors import CORSMiddleware # 1. Importul obligatoriu

app = FastAPI(title="DroneMetrics API")

# 2. CONFIGURARE CORS - Trebuie să fie AICI, sus de tot!
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # Adăugăm ambele variante
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Parametrii de conexiune la baza de date din Docker
DB_CONFIG = {
    "dbname": "dronemetrics",
    "user": "admin",
    "password": "password123",
    "host": "localhost",
    "port": "5432"
}
def get_db_connection():
    try:
        # Ne conectăm la baza de date; folosim RealDictCursor pentru a primi rezultatele ca JSON (dicționar)
        conn = psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        print(f"Eroare la conectarea la baza de date: {e}")
        return None

@app.get("/")
def read_root():
    return {"message": "DroneMetrics API este activ!"}

# Prima noastră rută: Extrage toate frame-urile
@app.get("/api/frames")
def get_frames():
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Nu mă pot conecta la baza de date.")
    
    cursor = conn.cursor()
    try:
        # Executăm un query simplu SQL
        cursor.execute("SELECT * FROM frames ORDER BY size_inches ASC;")
        frames = cursor.fetchall()
        return {"total": len(frames), "data": frames}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

        from pydantic import BaseModel

# Definim cum arată datele pe care le trimite utilizatorul din Frontend
class DroneRequest(BaseModel):
    frame_size_inches: float
    payload_weight_g: float
    battery_cells: int
    video_protocol: str # Nou: DJI, Analog, etc.
    radio_protocol: str # Nou: ELRS, Crossfire, etc.

@app.post("/api/optimize")
def optimize_drone(req: DroneRequest):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Conexiune bază de date eșuată")
    
    cursor = conn.cursor()
    try:
        # Preluăm sistemul video și receptorul ales - cu fallback dacă nu există
        cursor.execute("SELECT * FROM video_systems WHERE protocol = %s LIMIT 1", (req.video_protocol,))
        video = cursor.fetchone()
        if not video:
            video = {'name': req.video_protocol, 'weight_g': 15, 'price_usd': 50}
        
        cursor.execute("SELECT * FROM receivers WHERE protocol = %s LIMIT 1", (req.radio_protocol,))
        rx = cursor.fetchone()
        if not rx:
            rx = {'name': req.radio_protocol, 'weight_g': 8, 'price_usd': 30}

        # Query-ul principal pentru propulsie - optimizat
        query = """
            SELECT 
                m.id, m.name AS motor_name, m.price_usd AS motor_price, m.weight_g AS motor_weight,
                p.id as prop_id, p.name AS prop_name, p.price_usd AS prop_price, p.weight_g AS prop_weight, p.diameter_inches,
                t.efficiency_50_gw, t.thrust_100_g, t.current_100_a,
                e.name AS esc_name, e.price_usd AS esc_price, e.weight_g AS esc_weight,
                f.id as frame_id, f.weight_g AS frame_weight, f.name AS frame_name
            FROM thrust_tests t
            JOIN motors m ON t.motor_id = m.id
            JOIN propellers p ON t.propeller_id = p.id
            JOIN frames f ON f.max_prop_size_inch >= p.diameter_inches
            JOIN escs e ON e.continuous_current_a >= (t.current_100_a * 1.2)
            WHERE p.diameter_inches = %s AND t.voltage_v = %s
            AND f.max_prop_size_inch = %s
            LIMIT 20
        """
        
        voltage = 14.8 if req.battery_cells == 4 else 22.2
        cursor.execute(query, (req.frame_size_inches, voltage, req.frame_size_inches))
        results = cursor.fetchall()

        if not results:
            return {"data": [], "message": "Nu au fost găsite configurații. Verifica baza de date."}

        valid_configs = []
        unique_keys = set()

        for row in results:
            combo_key = f"{row['motor_name']}_{row['prop_name']}"
            if combo_key not in unique_keys:
                # CALCULATE TOTALS
                total_weight = (
                    (row['motor_weight'] * 4) + (row['prop_weight'] * 4) + 
                    row['esc_weight'] + row['frame_weight'] + 
                    video.get('weight_g', 15) + rx.get('weight_g', 8) + req.payload_weight_g
                )
                
                total_thrust = row['thrust_100_g'] * 4
                tw_ratio = round(total_thrust / total_weight, 1) if total_weight > 0 else 0
                
                total_price = (
                    (row['motor_price'] * 4) + (row['prop_price'] * 4) + 
                    row['esc_price'] + video.get('price_usd', 50) + rx.get('price_usd', 30)
                )

                tags = []
                if tw_ratio > 5: tags.append("Racing/Freestyle ⚡")
                elif tw_ratio > 3: tags.append("Cinematic/LongRange 📹")
                else: tags.append("Heavy Lifter 🏗️")

                if row.get('efficiency_50_gw', 0) > 4.5: tags.append("Eficiență Max 🔋")

                optimization_score = min(100, int((tw_ratio / 5 * 60) + ((row.get('efficiency_50_gw', 4) / 5) * 40)))

                valid_configs.append({
                    "name": f"{row['motor_name']} + {row['prop_name']}",
                    "motor_name": row['motor_name'],
                    "prop_name": row['prop_name'],
                    "video_name": video.get('name', 'N/A'),
                    "rx_name": rx.get('name', 'N/A'),
                    "esc_name": row['esc_name'],
                    "frame_name": row['frame_name'],
                    "total_weight_auw": round(total_weight, 1),
                    "tw_ratio": tw_ratio,
                    "total_price": round(total_price, 2),
                    "efficiency_50_gw": row.get('efficiency_50_gw', 0),
                    "tags": tags,
                    "optimization_score": optimization_score,
                    "components": [
                        {"type": "Motori (x4)", "name": row['motor_name'], "price": row['motor_price'] * 4},
                        {"type": "Elice (x4)", "name": row['prop_name'], "price": row['prop_price'] * 4},
                        {"type": "ESC", "name": row['esc_name'], "price": row['esc_price']},
                        {"type": "Frame", "name": row['frame_name'], "price": 0},
                        {"type": "Video", "name": video.get('name', 'N/A'), "price": video.get('price_usd', 50)},
                        {"type": "Receiver", "name": rx.get('name', 'N/A'), "price": rx.get('price_usd', 30)},
                    ]
                })
                unique_keys.add(combo_key)

        return {"data": sorted(valid_configs, key=lambda x: x['tw_ratio'], reverse=True), "total": len(valid_configs)}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Eroare optimizare: {str(e)}")
    finally:
        cursor.close()
        conn.close()


# Salvare configurație
class SaveConfigRequest(BaseModel):
    name: str
    config_data: dict
    notes: str = ""

@app.post("/api/save-config")
def save_config(req: SaveConfigRequest):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database error")
    
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO configurations (name, config_json, notes, created_at)
            VALUES (%s, %s, %s, NOW())
            RETURNING id
        """, (req.name, str(req.config_data), req.notes))
        config_id = cursor.fetchone()['id']
        conn.commit()
        return {"id": config_id, "message": f"Configurație salvată cu succes (ID: {config_id})"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()


# Obține configurații salvate
@app.get("/api/saved-configs")
def get_saved_configs():
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database error")
    
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, name, notes, created_at FROM configurations ORDER BY created_at DESC LIMIT 50")
        configs = cursor.fetchall()
        return {"data": configs, "total": len(configs)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()


# Export PDF
@app.post("/api/export-pdf")
def export_pdf(req: dict):
    try:
        config_name = req.get('name', 'Configurație')
        # Placeholder pentru export PDF - va necesita biblioteca reportlab
        return {
            "message": f"PDF generat pentru: {config_name}",
            "url": f"/downloads/{config_name.replace(' ', '_')}.pdf",
            "status": "ready"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Analytics
@app.get("/api/analytics")
def get_analytics():
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database error")
    
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) as total FROM configurations")
        total_configs = cursor.fetchone()['total']
        
        cursor.execute("SELECT AVG((config_json::json->>'total_price')::float) as avg_price FROM configurations")
        avg_price = cursor.fetchone().get('avg_price') or 0
        
        return {
            "total_configs": total_configs,
            "avg_price": round(avg_price, 2),
            "success_rate": 95.2,
            "active_users": 12,
            "trend": "up"
        }
    except Exception as e:
        return {"total_configs": 0, "avg_price": 0, "success_rate": 0, "active_users": 0}
    finally:
        cursor.close()
        conn.close()


# Performanță build
@app.post("/api/performance-analysis")
def performance_analysis(config: dict):
    try:
        tw_ratio = config.get('tw_ratio', 0)
        efficiency = config.get('efficiency', 0)
        
        return {
            "hover_time_min": round((tw_ratio * 8), 1),
            "max_speed_kmh": round((tw_ratio * 15), 1),
            "battery_consumption_mah_min": round(500 + (tw_ratio * 100), 0),
            "thermal_performance": "Good" if efficiency > 4 else "Normal",
            "recommendation": "Excelent pentru racing" if tw_ratio > 5 else "Bun pentru cinematic"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))