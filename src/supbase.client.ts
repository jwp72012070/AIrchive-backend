import * as dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[❌ ENV ERROR] Supabase 환경변수가 정의되지 않았습니다.');
  console.error('SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_KEY:', supabaseKey);
  throw new Error('환경변수 누락!');
}
export const supabase = createClient(supabaseUrl, supabaseKey);