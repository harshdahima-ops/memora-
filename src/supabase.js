import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lzqeiaoqpzltrwtvlvmx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6cWVpYW9xcHpsdHJ3dHZsdm14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NDgwNzEsImV4cCI6MjA5MjQyNDA3MX0.kysFIp9kxOuYy6D09RS_4RgsKvQnwKaG0DewaTT6tok'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: localStorage,           // Force use localStorage (more consistent)
    storageKey: 'memora-auth'        // Custom key to avoid conflicts
  }
})
