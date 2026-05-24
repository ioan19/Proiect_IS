# Testing & Verification Guide

## ✅ Pre-Deployment Checklist

### 1. Backend Setup
- [ ] Python 3.8+ installed
- [ ] FastAPI installed (`pip install fastapi`)
- [ ] psycopg2 installed (`pip install psycopg2-binary`)
- [ ] Docker running
- [ ] PostgreSQL container ready

### 2. Database
- [ ] PostgreSQL container started (`docker-compose up -d`)
- [ ] Database `dronemetrics` created
- [ ] Schema loaded from `init.sql/schema.sql`
- [ ] Sample data inserted
- [ ] Can connect to DB on localhost:5432

### 3. Frontend
- [ ] Node.js 16+ installed
- [ ] npm dependencies installed (`npm install`)
- [ ] Recharts library present
- [ ] Tailwind CSS configured
- [ ] Build system (Vite) ready

## 🧪 Testing Steps

### Step 1: Database Connection Test

**Backend Console:**
```bash
python main.py
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Test API:**
```bash
curl http://localhost:8000/
# Expected: {"message": "DroneMetrics Industrial Grade API"}
```

### Step 2: Database Query Test

**Test /api/frames endpoint:**
```bash
curl http://localhost:8000/api/frames
# Expected: JSON array of frame objects
```

**Verify response contains:**
- `name`: Frame name
- `size_inches`: Diameter
- `drone_type`: 'quad', 'hexa', or 'octa'
- `motor_count`: 4, 6, or 8

### Step 3: Optimization Engine Test

**Test configuration optimization:**
```bash
curl -X POST http://localhost:8000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "drone_type": "quad",
    "frame_size_inches": 5.0,
    "payload_weight_g": 150,
    "battery_capacity_mah": 1300,
    "battery_cells": 4,
    "video_protocol": "DJI",
    "radio_protocol": "ELRS"
  }'
```

**Expected Response Structure:**
```json
{
  "data": [
    {
      "name": "...",
      "drone_type": "quad",
      "motor_count": 4,
      "tw_ratio": 3.2,
      "total_weight_g": 560,
      "total_thrust_g": 1800,
      "disk_loading": 3.1,
      "flight_time_min": 12.5,
      "max_speed_kmh": 145,
      "max_altitude_m": 420,
      "power_consumption_w": 450,
      "efficiency_score": 78.5,
      "optimization_score": 82.1,
      "total_price": 450,
      "components": [...],
      "tags": ["⚡ Acrobatic", "✨ Efficient"]
    }
  ]
}
```

### Step 4: Frontend Test

**Start development server:**
```bash
cd frontend
npm run dev
```

**Expected:**
- Vite dev server starts on http://localhost:5173
- No build errors
- Hot module replacement working

**Manual Tests:**

#### Configurator Page:
1. [ ] Drone type toggle works (Quad/Hexa/Octa buttons)
2. [ ] Frame size accepts text input
3. [ ] Payload weight accepts numbers
4. [ ] Battery capacity text input works
5. [ ] Battery cells dropdown shows 3S-8S options
6. [ ] "Generate Build" button submits form
7. [ ] Results display with metrics grid
8. [ ] Advanced metrics panel shows all 6 values
9. [ ] Components grid displays all 7 items
10. [ ] Save Config button works

#### Analytics Page:
1. [ ] KPI metrics display (4 cards)
2. [ ] T/W Ratio bar chart renders
3. [ ] Drone Type pie chart renders
4. [ ] Weight distribution chart appears
5. [ ] Price distribution chart appears
6. [ ] Performance matrix dual-axis chart works
7. [ ] Configuration table displays latest configs
8. [ ] Charts are interactive (hover, tooltip)

### Step 5: Data Validation

**Verify Optimization Calculations:**

Create a simple test configuration manually:
- Quad frame: 30g
- 4x Motors @ 9g each: 36g
- 4x Props @ 2.5g each: 10g
- Battery: 110g
- 4x ESCs @ 9g each: 36g
- Video: 12g
- Receiver: 1.5g
- Payload: 150g

**Expected Total Weight:** 30+36+10+110+36+12+1.5+150 = 385.5g

**Expected T/W Ratio at 1800g thrust:** 1800/385.5 ≈ 4.67

### Step 6: Multi-Type Test

**Test Hexacopter Configuration:**
```bash
curl -X POST http://localhost:8000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "drone_type": "hexa",
    "frame_size_inches": 5.5,
    "payload_weight_g": 300,
    "battery_capacity_mah": 2200,
    "battery_cells": 6,
    "video_protocol": "DJI",
    "radio_protocol": "ELRS"
  }'
```

**Verify:**
- [ ] Results show "motor_count": 6
- [ ] Components show "Motor x6" and "Propeller x6"
- [ ] Weight calculations are correct for 6 motors
- [ ] Thrust calculations divide by 6 motors

### Step 7: Analytics Test

**Test /api/analytics:**
```bash
curl http://localhost:8000/api/analytics
```

**Expected Fields:**
- `total_configurations`: Number
- `average_price`: Float
- `average_tw_ratio`: Float
- `average_flight_time`: Float
- `drone_type_distribution`: Array of {drone_type, count}
- `tw_ratio_distribution`: Array of {tw_bucket, count}

### Step 8: Edge Cases

**Test Invalid Inputs:**
```bash
# Missing drone_type
curl -X POST http://localhost:8000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{"frame_size_inches": 5.0}'
# Expected: Error response

# Invalid drone_type
curl -X POST http://localhost:8000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "drone_type": "invalid",
    "frame_size_inches": 5.0,
    "payload_weight_g": 150,
    "battery_capacity_mah": 1300,
    "battery_cells": 4,
    "video_protocol": "DJI",
    "radio_protocol": "ELRS"
  }'
# Expected: Graceful error handling

# Zero payload
curl -X POST http://localhost:8000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "drone_type": "quad",
    "frame_size_inches": 5.0,
    "payload_weight_g": 0,
    "battery_capacity_mah": 1300,
    "battery_cells": 4,
    "video_protocol": "DJI",
    "radio_protocol": "ELRS"
  }'
# Expected: Valid results for lightweight config
```

## 🔍 Performance Benchmarks

### Expected Performance:
- **API Response Time**: < 500ms for /api/optimize
- **Analytics Load**: < 1s for /api/analytics
- **UI Render**: < 2s for results display
- **Chart Render**: < 3s for all 5 charts

### Test with Apache Bench:
```bash
ab -n 100 -c 10 http://localhost:8000/api/frames
# Expected: 100 completed requests in < 5 seconds
```

## 🐛 Common Issues & Solutions

### Issue: "Database connection refused"
**Solution:**
```bash
docker-compose up -d
docker ps  # Verify PostgreSQL is running
```

### Issue: "No results generated"
**Solution:**
1. Check database has motors/propellers
2. Verify frame size exists
3. Ensure thrust_tests data exists
4. Check voltage calculation (4S=14.8, 6S=22.2)

### Issue: Charts not displaying
**Solution:**
```bash
cd frontend
npm install recharts
npm run dev  # Restart dev server
```

### Issue: CORS error
**Solution:**
- Verify CORS middleware in main.py (already added)
- Check frontend URL in allow_origins list
- Clear browser cache

## ✅ Final Verification Checklist

- [ ] Backend API responds on all 7 endpoints
- [ ] Database contains sample data
- [ ] Optimizer generates results (> 5 configs)
- [ ] Frontend loads without errors
- [ ] Configurator form submits successfully
- [ ] Results display all metrics
- [ ] Save Configuration works
- [ ] Analytics charts render
- [ ] Multi-type drones work (Quad/Hexa/Octa)
- [ ] Optional parameters accepted (speed, flight time)
- [ ] Edge cases handled gracefully
- [ ] Optimization score calculated correctly
- [ ] Flight time estimates reasonable
- [ ] Price calculations accurate

## 📊 Sample Test Scenarios

### Scenario 1: Racing Quad
- Drone Type: Quad
- Frame: 5.0"
- Payload: 0g
- Battery: 1300mAh 4S
- Expected: High T/W (>4), short flight time (~8-12 min), high speed

### Scenario 2: Cinematic Build
- Drone Type: Quad
- Frame: 5.0"
- Payload: 200g (gimbal)
- Battery: 2600mAh 4S
- Expected: Medium T/W (2.5-3.5), longer flight (15-20 min)

### Scenario 3: Heavy Lift
- Drone Type: Hexa
- Frame: 5.5"
- Payload: 500g
- Battery: 5000mAh 6S
- Expected: Low T/W (<2.5), very long flight (20+ min), 6 motors for redundancy

## 🎯 Success Criteria

✅ System is production-ready when:
1. All API endpoints return proper responses
2. Database operations complete without errors
3. Frontend renders all components
4. Calculations match manual verification
5. Charts display correctly
6. No console errors
7. Responsive on mobile/tablet
8. Performance within benchmarks
9. Edge cases handled
10. Documentation complete

---

**Testing Date**: ___________
**Tester Name**: ___________
**Status**: [ ] PASS [ ] FAIL
**Notes**: ___________

