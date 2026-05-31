import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.supabase_client import supabase

tables = ["user_profiles", "resume_exports", "rl_feedback", "jd_cache"]

print("Checking Supabase table connectivity:")
all_ok = True
for table in tables:
    try:
        res = supabase.table(table).select("*").limit(1).execute()
        print(f"  [OK] '{table}' exists — {len(res.data)} row(s) visible")
    except Exception as e:
        err = str(e)
        all_ok = False
        print(f"  [FAIL] '{table}' — {err[:120]}")

print()
if all_ok:
    print("All tables OK. Supabase connection working!")
else:
    print("Some tables are missing. Run the SQL schema in Supabase SQL editor.")
