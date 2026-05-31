from supabase import create_client, Client
from config import settings

# Service key client — bypasses RLS for backend operations
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
