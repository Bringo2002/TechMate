import { createClient } from '@supabase/supabase-js';
import {VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY} from '../APIdomains'
 const supabaseUrl = VITE_SUPABASE_URL;
 const supabaseAnonKey =VITE_SUPABASE_ANON_KEY;
 
 if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
 }

const supabase = createClient(supabaseUrl, supabaseAnonKey);
 
export default supabase;