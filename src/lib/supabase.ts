import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oysqfuqrdizuwesmqvfi.supabase.co';
const supabaseAnonKey = 'sb_publishable_MqRv1xwgSKnRdNSR8Y4tTw_rMpEa2LY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
