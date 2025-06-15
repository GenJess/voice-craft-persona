
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xhmvtsuapstelcukxuxm.supabase.co' // Replace with your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhobXZ0c3VhcHN0ZWxjdWt4dXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMTA1MzMsImV4cCI6MjA2NTU4NjUzM30.sN4IKOUJJrgo9wSuAV27MnBIFieRtTsa_LGgNYqd9Wo' // Replace with your Supabase anon key

if (supabaseUrl.includes('YOUR_SUPABASE_URL') || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
  console.error("Supabase credentials not set. Please update src/lib/supabaseClient.ts with your project's URL and anon key.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
