# 🚀 DroneMetrics - Industrial Grade Drone Configuration System

A professional-grade multicopter configuration optimizer featuring industrial-grade mathematical calculations, multi-type drone support (Quad, Hexa, Octa), and advanced performance analytics.

## 🎯 Quick Links

| Document | Purpose |
|----------|---------|
| **[QUICKSTART.bat](QUICKSTART.bat)** | Windows setup (run this first!) |
| **[QUICKSTART.sh](QUICKSTART.sh)** | Linux/Mac setup |
| **[INDUSTRIAL_GUIDE.md](INDUSTRIAL_GUIDE.md)** | Complete system documentation |
| **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** | What was built & changed |
| **[TESTING_GUIDE.md](TESTING_GUIDE.md)** | How to test & verify |

## ⚡ Quick Start (5 minutes)

### Windows:
```bash
# 1. Double-click QUICKSTART.bat
# 2. Wait for setup to complete
# 3. Run: npm run dev
# 4. Open: http://localhost:5173
```

### Mac/Linux:
```bash
chmod +x QUICKSTART.sh
./QUICKSTART.sh
npm run dev
# Open: http://localhost:5173
```

## 📊 Key Features

### Industrial Calculations
- ✅ **8 Advanced Algorithms**: Weight, thrust, T/W ratio, disk loading, flight time, speed, altitude, efficiency
- ✅ **Multi-Type Support**: Quad (4x), Hexa (6x), Octa (8x) motors automatically
- ✅ **Safety Factors**: 30% thrust headroom built-in
- ✅ **Empirical Models**: Flight time with battery reserve, speed calculations

### Smart Configurator
- ✅ **Text Input Fields**: Not limited to presets - any frame size, battery capacity
- ✅ **Real-Time Calculation**: Instant optimization on parameter change
- ✅ **Advanced Metrics Display**: T/W, flight time, speed, altitude, disk loading, efficiency
- ✅ **Drone Type Toggle**: Quad/Hexa/Octa with automatic calculations

### Analytics Dashboard
- ✅ **5 Interactive Charts**: T/W distribution, drone type breakdown, weight/price analysis, performance matrix
- ✅ **KPI Metrics**: Total configs, avg price, avg T/W, avg flight time
- ✅ **Configuration Summary**: Browse and compare all saved builds
- ✅ **Recharts Integration**: Professional interactive visualizations

## 📈 What's New

### Compared to Original:
| Feature | Before | After |
|---------|--------|-------|
| Drone Types | Quad only | Quad, Hexa, Octa |
| Calculations | Basic T/W | 8 industrial models |
| Input Method | Dropdowns | Text inputs + custom ranges |
| Metrics | T/W ratio only | T/W, flight time, speed, altitude, disk loading, efficiency |
| Analytics | Basic stats | 5 interactive charts + summary table |
| Database | Simple | 10 tables, relationships, indexes |
| Documentation | Minimal | 2,000+ lines guides |

## 🏗️ Architecture

### Backend (FastAPI + PostgreSQL)
```
main.py
├── DroneCalculator (8 calculation methods)
├── Database Layer (psycopg2)
├── API Endpoints (5 main routes)
└── Pydantic Models (input validation)
```

### Frontend (React + Tailwind + Recharts)
```
frontend/
├── Configurator.jsx (enhanced form + results)
├── Analytics.jsx (charts + metrics)
├── Dashboard.jsx (main layout)
├── Sidebar.jsx (navigation)
└── Tailwind CSS (styling)
```

### Database (PostgreSQL)
```
10 Tables:
- frames, motors, propellers
- batteries, escs, thrust_tests
- video_systems, receivers
- configurations, configuration_analysis
```

## 🔧 System Requirements

- **OS**: Windows, Mac, or Linux
- **Docker**: Latest version (for PostgreSQL)
- **Node.js**: 16+ (frontend)
- **Python**: 3.8+ (backend)
- **RAM**: 2GB minimum (4GB recommended)
- **Disk**: 500MB free space

## 📚 Documentation

### For Users:
1. **[INDUSTRIAL_GUIDE.md](INDUSTRIAL_GUIDE.md)** - Complete feature guide
   - Calculation explanations
   - Industrial recommendations
   - Usage examples
   - Performance tips

### For Developers:
1. **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical details
   - Architecture overview
   - Code changes
   - Database schema
   - API reference

### For QA/Testing:
1. **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Verification procedures
   - Test cases
   - Performance benchmarks
   - Edge case handling
   - Checklist

## 🚀 Getting Started

### Step 1: Initial Setup
```bash
# Windows
QUICKSTART.bat

# Mac/Linux
./QUICKSTART.sh
```

### Step 2: Start Development
```bash
cd frontend
npm run dev
```

### Step 3: Configure Your First Drone
1. Go to **Configurator** tab
2. Select drone type (Quad/Hexa/Octa)
3. Enter frame size, payload, battery specs
4. Click **Generate Build**
5. View results with industrial metrics
6. Click **Save Config** to store

### Step 4: Analyze Performance
1. Go to **Analytics** tab
2. View KPI metrics
3. Explore 5 interactive charts
4. Compare configurations in summary table

## 🎓 Industrial Metrics Explained

### Thrust-to-Weight Ratio (T/W)
- **>5:1**: Acrobatic, racing, high power consumption
- **3-5:1**: Cinematic, balanced performance
- **<3:1**: Heavy lift, cargo, low efficiency

### Disk Loading (g/cm²)
- **<2.5**: Very efficient, smooth flight
- **2.5-3.5**: Optimal range for most applications
- **>3.5**: Aggressive, high power demand

### Flight Time (minutes)
- **8-12**: Racing/freestyle configurations
- **15-20**: Cinematic/balanced builds
- **20+**: Heavy lift/long range

### Motor KV
- **High (>3000)**: Racing, lightweight
- **Medium (1200-2300)**: General purpose
- **Low (300-600)**: Heavy lift, efficient

## 🔄 API Endpoints

### POST /api/optimize
Generates optimized configurations for given parameters
- Input: Drone type, frame size, payload, battery, video/radio
- Output: List of sorted configurations (up to 50)
- Key Metrics: All 8 calculated values

### GET /api/analytics
Returns comprehensive statistics and distributions
- Total configurations, average metrics
- Drone type and T/W ratio distributions
- Used by analytics dashboard

### POST /api/configurations
Save a configuration to database
- Fields: All drone specs + calculated metrics

### GET /api/configurations
Retrieve saved configurations
- Parameters: limit (default 20)

### GET /api/frames
List available frames from database
- Returns: All frame types with specifications

## 🛠️ Configuration Examples

### Racing Quad
```json
{
  "drone_type": "quad",
  "frame_size_inches": 5.0,
  "payload_weight_g": 0,
  "battery_capacity_mah": 1300,
  "battery_cells": 4
}
```
Expected: T/W >4, flight time 10-12 min, speed >140 km/h

### Cinematic Hexa
```json
{
  "drone_type": "hexa",
  "frame_size_inches": 5.5,
  "payload_weight_g": 200,
  "battery_capacity_mah": 2200,
  "battery_cells": 6
}
```
Expected: T/W 2.5-3, flight time 15-20 min, smooth performance

### Heavy Lift Octa
```json
{
  "drone_type": "octa",
  "frame_size_inches": 8.0,
  "payload_weight_g": 500,
  "battery_capacity_mah": 5000,
  "battery_cells": 6
}
```
Expected: T/W <2, flight time 20+ min, high stability

## 🐛 Troubleshooting

### Backend not connecting
```bash
docker-compose up -d  # Start database
python main.py        # Start backend
```

### No configurations generated
- Check database has sample data
- Verify frame size exists in database
- Ensure motor/propeller combinations available

### Charts not rendering
```bash
npm install recharts
npm run dev  # Restart dev server
```

### CORS errors
- Already configured in main.py
- Check frontend URL matches allow_origins

## 📊 Sample Data

System comes with pre-loaded sample data:
- **6 Frame Types**: Quad, Hexa, Octa variants
- **7 Motors**: 380KV to 5800KV range
- **7 Propellers**: 5" to 15" variants
- **6 Batteries**: 3S to 8S configurations
- **6 ESCs**: Various current ratings
- **5 Video Systems**: DJI, Analog, Walksnail
- **5 Receivers**: ELRS, Crossfire options
- **13 Thrust Test Points**: Performance benchmarks
- **3 Example Configs**: Reference builds

## 🎯 Next Steps

1. ✅ **Run Setup**: Execute QUICKSTART.bat/sh
2. ✅ **Start Frontend**: Run `npm run dev`
3. ✅ **Configure Drone**: Test with sample parameters
4. ✅ **Check Analytics**: Review charts
5. ✅ **Read Guide**: Study INDUSTRIAL_GUIDE.md
6. ✅ **Add Custom Data**: Insert your own motors/props
7. ✅ **Optimize Builds**: Run multiple configurations

## 📖 Full Documentation

- **[INDUSTRIAL_GUIDE.md](INDUSTRIAL_GUIDE.md)** - Feature guide & tutorials
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical deep dive
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Test procedures

## 🤝 Support

For issues:
1. Check [TESTING_GUIDE.md](TESTING_GUIDE.md) troubleshooting
2. Review error messages in console
3. Verify Docker is running
4. Check database connection

## 📝 License

Educational & Professional Use

## 🎉 Credits

**System Version**: Industrial Grade v1.0
**Built**: 2026-05-16
**Architecture**: Full-stack (React + FastAPI + PostgreSQL)

---

## ✨ Key Features At A Glance

| Category | Features |
|----------|----------|
| **Calculations** | Weight, Thrust, T/W, Disk Loading, Flight Time, Speed, Altitude, Efficiency |
| **Drone Types** | Quad (4x), Hexa (6x), Octa (8x) |
| **Inputs** | Text fields for all parameters, no presets required |
| **Outputs** | 8 industrial metrics + component list |
| **Analytics** | 5 charts + 4 KPIs + summary table |
| **Database** | 10 tables, 30+ sample records, production-ready |
| **API** | 5 endpoints, JSON responses, error handling |
| **Frontend** | React components, Tailwind CSS, Recharts |
| **Documentation** | 2,000+ lines of guides and explanations |

---

**Ready to optimize your drone configuration? [Start here!](#quick-start-5-minutes)**

