import psycopg2
import sys

try:
    conn = psycopg2.connect(
        dbname="daily_tourneys",
        user="postgres",
        password="password",
        host="localhost",
        port="5432"
    )
    print("Connection successful")
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f"Connection failed: {e}")
    sys.exit(1)
