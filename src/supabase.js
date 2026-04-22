import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lzqeiaoqpzltrwtvlvmx.supabase.co'
const SUPABASE_KEY = 'sb_publishable_3bPpzCCwdd16RXtVq_m-ng_4CaJrowN'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
