import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carga las variables del archivo .env en process.env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Validación de seguridad para avisarte si olvidaste configurar el .env
if (!supabaseUrl || !supabaseKey) {
  console.error(" Error: SUPABASE_URL o SUPABASE_KEY no están definidas en el archivo .env");
  process.exit(1);
}

// Crea y exporta el cliente conectado
export const supabase = createClient(supabaseUrl, supabaseKey);