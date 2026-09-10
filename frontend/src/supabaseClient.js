import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pnvfmkbsstreeqtbekfw.supabase.co';
const supabaseKey = 'sb_publishable_3NCFj48D4UVLOeEilN7M5A_FITfglDc';

export const supabase = createClient(supabaseUrl, supabaseKey);