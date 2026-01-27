import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabase 클라이언트 (타입 없이 사용 - 더 유연함)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
