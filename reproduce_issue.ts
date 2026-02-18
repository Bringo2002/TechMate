
import supabase from './src/lib/supabaseClient';
import { ClientInquiryInsert } from './src/types/database.types';

async function testInsert() {
    const inquiryData: ClientInquiryInsert = {
        client_id: 'test-client',
        project_type: 'website',
        title: 'Test Project',
        description: 'Test Description',
        status: 'new', // Providing status explicitly just in case
        budget_range: '1000-2000',
        priority: 'medium'
    };

    const { data, error } = await supabase
        .from('client_inquiries')
        .insert(inquiryData)
        .select()
        .single();

    console.log(data, error);
}

testInsert();
