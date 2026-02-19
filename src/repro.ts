import supabase from './lib/supabaseClient';
import { ClientInquiryInsert, Database } from './types/database.types';
import { createClient } from '@supabase/supabase-js';

const VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

// Test explicit schema
const supabaseExplicit = createClient<Database, 'public'>(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

type PublicSchema = Database['public'];
type Tables = PublicSchema['Tables'];
type ClientInquiriesTable = Tables['client_inquiries']; // This should pass if key exists
type ClientInquiryInsertType = ClientInquiriesTable['Insert'];

async function testInsert() {
    // Check if select is typed with default client
    const { data: selectData } = await supabase
        .from('client_inquiries')
        .select('*');

    // Check if select is typed with explicit client
    const { data: explicitData } = await supabaseExplicit
        .from('client_inquiries')
        .select('*');

    if (explicitData && explicitData.length > 0) {
        console.log("Explicit client works:", explicitData[0].id);
    }

    // Check businesses table
    const { data: businessData } = await supabase
        .from('businesses')
        .select('*');

    if (businessData && businessData.length > 0) {
        // @ts-ignore
        console.log("Businesses works:", businessData[0].id);
    }

    // Check profiles table (which HAS Relationships)
    const { data: profileData } = await supabase
        .from('profiles')
        .select('*');

    if (profileData && profileData.length > 0) {
        console.log("Profiles works:", profileData[0].id);
    }


    // If selectData is typed, accessing a non-existent property should fail
    if (selectData && selectData.length > 0) {
        const row = selectData[0];
        // basic check
        console.log(row.id);
    }

    const inquiryData: ClientInquiryInsert = {
        client_id: 'test-client',
        project_type: 'website',
        title: 'Test Project',
        description: 'Test Description',
        status: 'new',
        budget_range: '1000-2000',
        priority: 'medium'
    };

    // Casting to any to temporarily bypass error if needed, but we want to see the error
    const { data, error } = await supabase
        .from('client_inquiries')
        .insert(inquiryData)
        .select()
        .single();

    console.log(data, error);
}

testInsert();
