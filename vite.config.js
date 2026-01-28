import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(() => {
  const envPath = path.resolve(__dirname, '.env');
  let env = {};

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const [key, ...value] = line.split('=');
      if (key && value) {
        env[key.trim()] = value.join('=').trim();
      }
    });
  }

  console.log('--- Vite Config Debug ---');
  console.log('ENV Path:', envPath);
  console.log('VITE_SUPABASE_URL found:', env.VITE_SUPABASE_URL ? 'YES' : 'NO');
  console.log('VITE_SUPABASE_ANON_KEY found:', env.VITE_SUPABASE_ANON_KEY ? 'YES' : 'NO');
  console.log('-------------------------');

  return {
    plugins: [react()],
    define: {
      '__SUPABASE_URL__': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      '__SUPABASE_KEY__': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
    }
  }
})
