# DroneMetrics - Industrial Grade Drone Configuration System

## Overview

This is an advanced drone configuration optimizer system that uses industrial-grade mathematical calculations to design optimal multicopter configurations. The system supports quad (4x), hexa (6x), and octa (8x) configurations with comprehensive performance analysis.

## Key Improvements & Features

### 1. **Industrial-Grade Calculations** 

The backend now includes a sophisticated `DroneCalculator` class with the following mathematical models:

#### A. Weight Management
- **Total Weight Calculation**: Precise weight accounting for all components
  - Frame weight (motor_count × motor_weight)
  - Propeller weight (motor_count × prop_weight)
  - ESC weight (motor_count × esc_weight)
  - Battery, video system, receiver, and payload weights

#### B. Thrust Analysis
- **Required Thrust**: Calculates needed thrust with 30% safety factor (1.3x multiplier)
- **Thrust-to-Weight Ratio (T/W)**: Essential for flight characteristics
  - > 5:1 = Acrobatic/Racing ⚡
  - 3-5:1 = Cinematic/LongRange 📹
  - < 3:1 = Heavy Lifter 🏗️

#### C. Disk Loading
- **Formula**: Total Thrust / Total Disk Area
- **Range Optimization**:
  - < 2.5 g/cm² = Very efficient, smooth flight
  - 2.5-3.5 g/cm² = Optimal balance
  - > 3.5 g/cm² = Aggressive, less efficient

#### D. Flight Time Calculation
- **Complex Model** accounting for:
  - Battery capacity (mAh) and nominal voltage
  - Total system weight
  - Motor KV characteristics
  - Propeller diameter (affects blade tip speed)
  - 80% usable capacity (20% reserve)
- **Formula Foundation**:
  ```
  Flight Time = (Battery Energy (Wh) / Power Consumption (W)) × 0.8
  ```

#### E. Maximum Speed
- **Calculation**:
  - Max RPM = Motor KV × Battery Voltage (max) × 0.95
  - Speed = (RPM × Prop Circumference) / 60
  - Output in km/h

#### F. Maximum Altitude
- **Empirical Model**:
  - Base altitude = (Total Thrust - Total Weight) × 2 meters
  - Propeller diameter factor applied (larger props better at altitude)

#### G. Efficiency Scoring (0-100)
- **Components**:
  - Motor Efficiency (35%): grams per watt
  - Disk Loading Optimization (35%): 3.0 g/cm² is optimal
  - Power Efficiency (30%): wattage consumption

#### H. Optimization Score (Multi-Factor)
- **Weighted Formula**:
  - Efficiency: 30%
  - T/W Ratio: 30%
  - Price: 20%
  - Flight Time: 20%

### 2. **Enhanced Configurator Interface**

**Key Features:**
- **Drone Type Selection**: Switch between Quad (4x), Hexa (6x), Octa (8x) with instant calculation updates
- **Text Input Fields**: All numeric parameters are now text inputs instead of dropdowns
  - Frame Size (inches): Custom values
  - Payload Weight (g): Fine-tuned weight control
  - Battery Capacity (mAh): Full capacity range
  - Battery Cells: 3S to 8S LiPo support
- **Optional Performance Targets**:
  - Desired Speed (km/h)
  - Desired Flight Time (minutes)
- **Real-Time Visual Feedback**: Color-coded metrics

**Result Display:**
Each generated configuration shows:
- Configuration Score
- Industrial Metrics Panel:
  - Thrust-to-Weight Ratio
  - Flight Time (minutes)
  - Maximum Speed (km/h)
  - Maximum Altitude (meters)
- Advanced Specifications:
  - Total Weight (g)
  - Total Thrust (g)
  - Disk Loading (g/cm²)
  - Power Consumption (W)
  - Efficiency Score
  - Motor KV
- Complete Component Breakdown with prices
- Save Configuration button for history

### 3. **Advanced Analytics Dashboard**

**Key Metrics Panel:**
- Total Configurations
- Average Price
- Average T/W Ratio
- Average Flight Time

**Visual Analytics:**
1. **T/W Ratio Distribution**: Bar chart showing configuration frequency by T/W ratio
2. **Drone Type Distribution**: Pie chart showing quad/hexa/octa usage
3. **Weight Distribution**: Bar chart of recent configuration weights
4. **Price Distribution**: Bar chart of recent configuration costs
5. **Performance Matrix**: Flight Time vs T/W Ratio comparison (latest 15 configs)
6. **Configuration Summary Table**: 
   - Shows latest 10 configurations
   - Displays: Name, Type, Weight, T/W, Flight Time, Price

**Technology**: Uses Recharts library for interactive visualizations

### 4. **Database Schema Enhancements**

**New Tables:**
- `frames`: Drone frames with motor_count, drone_type support
- `motors`: Motor specifications with KV, weight, price
- `propellers`: Propeller data with diameter, pitch, material
- `batteries`: Battery specifications with capacity, cells, C-rating
- `escs`: Electronic Speed Controller specifications
- `thrust_tests`: Motor + Propeller test data benchmarks
- `video_systems`: FPV camera/video transmitter specs
- `receivers`: RC receiver specifications
- `configurations`: Saved drone builds with all specs
- `configuration_analysis`: Detailed analysis results

**Indexes**: Optimized queries with strategic indexing

### 5. **API Endpoints**

#### `/api/optimize` (POST)
- **Input**: DroneRequest with:
  - `drone_type`: 'quad', 'hexa', or 'octa'
  - `frame_size_inches`: Frame diameter
  - `payload_weight_g`: Additional payload
  - `battery_capacity_mah`: Battery capacity
  - `battery_cells`: Number of cells (3-8S)
  - `video_protocol`: 'DJI', 'Analog', 'Walksnail'
  - `radio_protocol`: 'ELRS' or 'Crossfire'
  - Optional: `desired_speed_kmh`, `desired_flight_time_min`

- **Output**: Sorted list of optimal configurations with full analysis

#### `/api/analytics` (GET)
- Returns comprehensive statistics and distributions

#### `/api/configurations` (GET/POST)
- Save and retrieve configuration history

#### `/api/configuration-analysis/{id}` (GET)
- Detailed analysis for specific configuration

## Technical Stack

### Backend
- **FastAPI**: Modern async Python framework
- **PostgreSQL**: Robust relational database
- **psycopg2**: PostgreSQL driver with connection pooling
- **Pydantic**: Data validation
- **Python math module**: Precise calculations

### Frontend
- **React 19**: Component-based UI
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Interactive charting library
- **React Router**: Navigation
- **Vite**: Build tool

### Deployment
- **Docker**: Containerization
- **docker-compose**: Multi-container orchestration

## Usage Guide

### 1. Start the System
```bash
# Start Docker containers
docker-compose up -d

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev

# Backend runs on http://localhost:8000
# Frontend runs on http://localhost:5173
```

### 2. Configure a Drone

1. Go to **Configurator** tab
2. Select drone type (Quad/Hexa/Octa)
3. Input specifications:
   - Frame size
   - Payload weight
   - Battery capacity & cells
   - Video & radio systems
4. Click **Generate Build**
5. Review results and **Save Config** for history

### 3. Analyze Performance

1. Go to **Analytics** tab
2. View key metrics
3. Analyze charts:
   - T/W distribution trends
   - Drone type preferences
   - Performance correlations
4. Reference summary table for specific configs

## Industrial Recommendations

### Thrust-to-Weight Ratios
- **Acrobatic (> 5:1)**: High power consumption, excellent maneuverability, ~8-12 min flight time
- **Cinematic (3-5:1)**: Balanced performance, smooth flying, ~15-25 min flight time
- **Heavy Lift (< 3:1)**: Low efficiency, heavy payloads, ~20-40 min flight time (with large batteries)

### Disk Loading Guidelines
- **< 2.5 g/cm²**: Highly efficient, long flights, gentle throttle feel
- **2.5-3.5 g/cm²**: Sweet spot for most applications
- **> 3.5 g/cm²**: Aggressive performance, higher power demand

### Motor KV Selection
- **High KV (3000+)**: Racing, low payload capacity, high current
- **Medium KV (1200-2300)**: General purpose, versatile
- **Low KV (300-600)**: Heavy lift, low current, high torque

## Performance Optimization Tips

1. **For Long Flight Time**:
   - Lower T/W ratio (< 3:1)
   - Larger battery capacity
   - Lower KV motors
   - Larger propellers
   - Minimize weight

2. **For Speed**:
   - Higher T/W ratio (> 4:1)
   - High KV motors
   - Smaller propellers
   - Lightweight frame

3. **For Smooth Cinematic Flight**:
   - T/W ratio 3.5-4.5:1
   - Disk loading 2.8-3.2 g/cm²
   - Medium KV motors
   - Smooth power curve

## Sample Configurations

### Freestyle Racing Quad
- Frame: 5" freestyle
- Motors: 5800KV lightweight
- T/W: ~3.2:1
- Flight Time: ~12 min
- Max Speed: ~140 km/h

### Cinematic LongRange
- Frame: 5" heavy
- Motors: 590KV efficient
- T/W: ~2.8:1
- Flight Time: ~18+ min
- Smooth flight characteristics

### Heavy Lift Hexacopter
- Motors: 6x 380KV
- Payload: 500g+
- T/W: ~2.2:1
- Stability over speed
- Redundancy with 6 motors

## Future Enhancements

- Wind resistance calculation
- Gimbal/camera vibration analysis
- Weather impact modeling
- Battery discharge rate profiling
- Motor heat management
- Signal propagation analysis
- 3D stability modeling
- Cost-per-minute-of-flight analysis

## Troubleshooting

### "Database connection failed"
- Ensure Docker is running
- Check PostgreSQL container: `docker ps`
- Verify connection string in main.py

### "No configurations generated"
- Verify database has sample data
- Check that frame size matches database entries
- Ensure motor/propeller combinations exist

### Charts not displaying
- Install recharts: `npm install recharts`
- Clear browser cache
- Check browser console for errors

## References

### Drone Physics
- Disk Loading Theory: Momentum Theory in Rotorcraft
- T/W Ratio Industry Standards
- Propeller Efficiency: Blade Element Momentum Theory

### Component Specifications
- Motor KV and efficiency curves
- Propeller thrust coefficients
- Battery discharge characteristics
- ESC power dissipation

## License & Support

For issues or feature requests, please refer to project documentation.

---

**System Version**: Industrial Grade v1.0
**Last Updated**: 2026-05-16
