import { createClient } from '@supabase/supabase-js';

// Hardcoded config to ensure it works regardless of .env issues
// These will be used if .env fails
const URL = 'https://prmlcrwfpwhvfvdeavnt.supabase.co';
const KEY = 'sb_publishable_toybOxASawc_NrK27rqh3A_aX7OH9id';

export const supabase = createClient(URL, KEY);
