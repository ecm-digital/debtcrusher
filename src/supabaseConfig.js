import { createClient } from '@supabase/supabase-js';

// Hardcoded config to ensure it works regardless of .env issues
const URL = 'https://prmlcrwfpwhvfvdeavnt.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybWxjcndmcHdodmZ2ZGVhdm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDQ1NDgsImV4cCI6MjA4NTE4MDU0OH0.lWQTaBLMnzbkNJNOq6YsEm0cTcKYkfHLI3hpQjzKArw';

export const supabase = createClient(URL, KEY);
