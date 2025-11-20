import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables:');
  console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_API_KEY:', supabaseKey ? 'Set' : 'Missing');
  throw new Error('SUPABASE_URL and SUPABASE_API_KEY must be set in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
