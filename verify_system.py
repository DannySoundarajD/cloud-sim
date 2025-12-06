import requests
import sys
from sqlalchemy import create_engine, inspect
import os

# 1. Test API Health
print("--- 1. Testing API Connectivity ---")
try:
    health = requests.get("http://localhost:8000/health")
    if health.status_code == 200:
        print("✅ API is responding: ", health.json())
    else:
        print("❌ API returned error:", health.status_code)
        sys.exit(1)
except Exception as e:
    print(f"❌ Could not connect to API: {e}")
    print("Make sure 'uvicorn backend.app.main:app' is running!")
    sys.exit(1)

# 2. Test Database Tables
print("\n--- 2. Verifying Database Tables ---")
# Using the same URL from your db.py
DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1@localhost:5432/cloudsim")

try:
    engine = create_engine(DB_URL)
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    if "instances" in tables:
        print(f"✅ Found table 'instances'")
        print("All tables:", tables)
        
        # Optional: Print columns
        columns = [col['name'] for col in inspector.get_columns("instances")]
        print("   Columns:", columns)
    else:
        print("❌ Table 'instances' NOT found. Found:", tables)

except Exception as e:
    print(f"❌ Database connection failed: {e}")