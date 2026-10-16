import { Service } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Service()
export class SupabaseService {
  readonly supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
}
