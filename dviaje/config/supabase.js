import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carga las variables del archivo .env en process.env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Validación: avisa si falta configurar el .env y detiene el arranque
if (!supabaseUrl || !supabaseKey) {
  console.error(' Error: SUPABASE_URL o SUPABASE_KEY no están definidas en el archivo .env');
  process.exit(1);
}

// Cliente para uso en el SERVIDOR: no necesita guardar sesión ni refrescar tokens.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});