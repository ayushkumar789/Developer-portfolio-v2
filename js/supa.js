/* Shared Supabase client. ANON key only — safe to ship; writes/reads are
   gated by Row Level Security, never by this file. */
(function () {
  const SUPABASE_URL = "https://sjqonfzpasbsrzvljiid.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcW9uZnpwYXNic3J6dmxqaWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NDgwMDIsImV4cCI6MjA3NTQyNDAwMn0.Tpr0-dKaki77VOTZ0TlK76GVlqg-XLkQfjund94jO3Q";
  window.supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();
