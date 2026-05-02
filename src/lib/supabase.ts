import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvygiyjlhvfsbfpqkedk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2eWdpeWpsaHZmc2JmcHFrZWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MzkwMzUsImV4cCI6MjA5MzMxNTAzNX0.Rgd07c9kD-yoxAY5xqs__2JNa6RZdIiO7eSp_lKVsYU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
