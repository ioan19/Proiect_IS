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
    cursor = conn.cursor()
    try:
        # Preluăm sistemul video și receptorul ales
        cursor.execute("SELECT * FROM video_systems WHERE protocol = %s LIMIT 1", (req.video_protocol,))
        video = cursor.fetchone()
        
        cursor.execute("SELECT * FROM receivers WHERE protocol = %s LIMIT 1", (req.radio_protocol,))
        rx = cursor.fetchone()

        # Query-ul principal pentru propulsie
        query = """
            SELECT 
                m.name AS motor_name, m.price_usd AS motor_price, m.weight_g AS motor_weight,
                p.name AS prop_name, p.price_usd AS prop_price, p.weight_g AS prop_weight,
                t.efficiency_50_gw, t.thrust_100_g, t.current_100_a,
                e.name AS esc_name, e.price_usd AS esc_price, e.weight_g AS esc_weight,
                f.weight_g AS frame_weight, f.name AS frame_name
            FROM thrust_tests t
            JOIN motors m ON t.motor_id = m.id
            JOIN propellers p ON t.propeller_id = p.id
            JOIN frames f ON f.max_prop_size_inch >= p.diameter_inches
            JOIN escs e ON e.continuous_current_a >= (t.current_100_a * 1.2)
            WHERE p.diameter_inches = %s AND t.voltage_v = %s
            AND f.max_prop_size_inch = %s -- Filtrăm să luăm frame-ul potrivit mărimii
        """
        
        voltage = 14.8 if req.battery_cells == 4 else 22.2
        cursor.execute(query, (req.frame_size_inches, voltage, req.frame_size_inches))
        results = cursor.fetchall()

        valid_configs = []
        unique_keys = set()

        for row in results:
            combo_key = f"{row['motor_name']}_{row['prop_name']}"
            if combo_key not in unique_keys:
                # CALCULATE TOTALS
                total_weight = (
                    (row['motor_weight'] * 4) + (row['prop_weight'] * 4) + 
                    row['esc_weight'] + row['frame_weight'] + 
                    video['weight_g'] + rx['weight_g'] + req.payload_weight_g
                )
                
                total_thrust = row['thrust_100_g'] * 4
                tw_ratio = round(total_thrust / total_weight, 1) if total_weight > 0 else 0
                
                total_price = (
                    (row['motor_price'] * 4) + (row['prop_price'] * 4) + 
                    row['esc_price'] + video['price_usd'] + rx['price_usd']
                )

                tags = []
                if tw_ratio > 5: tags.append("Racing/Freestyle ⚡")
                elif tw_ratio > 3: tags.append("Cinematic/LongRange 📹")
                else: tags.append("Heavy Lifter 🏗️")

                if row['efficiency_50_gw'] > 4.5: tags.append("Eficiență Max 🔋")

                valid_configs.append({
                    **dict(row),
                    "video_name": video['name'],
                    "rx_name": rx['name'],
                    "total_weight_auw": round(total_weight, 1),
                    "tw_ratio": tw_ratio,
                    "total_price": round(total_price, 2),
                    "tags": tags
                })
                unique_keys.add(combo_key)

        return {"data": sorted(valid_configs, key=lambda x: x['tw_ratio'], reverse=True)}

    finally:
        cursor.close()
        conn.close()