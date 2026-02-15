import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iditwholytbxhnvsqkgj.supabase.co';
const supabaseAnonKey = 'sb_publishable_FI0yQ1SzyOg5vpKw3X2QaQ_mjwlUJDu';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
