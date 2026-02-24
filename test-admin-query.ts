import { createClient } from '@supabase/supabase-js';
import { VITE_SUPABASE_URL } from './src/APIdomains';
import { VITE_SUPABASE_SERVICE_ROLE_KEY } from './src/APIdomains';

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function run() {
    console.log("Fetching client_inquiries...");
    const { data, error } = await supabase
        .from('client_inquiries')
        .select('client:profiles!client_id(*)')
        .is('deleted_at', null);

    console.log("Data count:", data?.length);
    if (data?.length) {
        console.log("First row:", JSON.stringify(data[0], null, 2));
    }
}

run();
