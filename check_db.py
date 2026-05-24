import psycopg2
from psycopg2.extras import RealDictCursor

conn = psycopg2.connect(
    dbname='dronemetrics',
    user='admin',
    password='password123',
    host='localhost',
    port='5432'
)
cursor = conn.cursor(cursor_factory=RealDictCursor)

# Check if configurations table exists
cursor.execute("""
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'configurations'
""")

if cursor.fetchone():
    print('Table configurations exists')

    # Check table structure
    cursor.execute("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'configurations'
        ORDER BY ordinal_position
    """)
    columns = cursor.fetchall()
    print('Columns:')
    for col in columns:
        print(f'  {col["column_name"]}: {col["data_type"]} ({col["is_nullable"]})')
else:
    print('Table configurations does NOT exist')

cursor.close()
conn.close()