import psycopg2
from psycopg2.extras import RealDictCursor

conn = psycopg2.connect(dbname="dronemetrics", user="admin", password="password123", host="localhost", port="5432", cursor_factory=RealDictCursor)
cursor = conn.cursor()

# Check thrust_tests data
cursor.execute("SELECT * FROM thrust_tests LIMIT 1")
result = cursor.fetchone()
print("Thrust test sample:")
if result:
    for key, val in result.items():
        print(f"  {key}: {val} ({type(val).__name__})")
else:
    print("  No data in thrust_tests")

# Check video_systems
cursor.execute("SELECT * FROM video_systems WHERE protocol = 'DJI' LIMIT 1")
result = cursor.fetchone()
print("\nVideo system sample:")
if result:
    for key, val in result.items():
        print(f"  {key}: {val} ({type(val).__name__})")
else:
    print("  No DJI video system found")

# Check receivers
cursor.execute("SELECT * FROM receivers WHERE protocol = 'ELRS' LIMIT 1")
result = cursor.fetchone()
print("\nReceiver sample:")
if result:
    for key, val in result.items():
        print(f"  {key}: {val} ({type(val).__name__})")
else:
    print("  No ELRS receiver found")

cursor.close()
conn.close()
