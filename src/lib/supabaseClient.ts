
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://YOUR_SUPABASE_URL' // Replace with your Supabase URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY' // Replace with your Supabase anon key

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
