import supabase from '../lib/supabaseClient';
import { ClientInquiryInsert } from '../types/database.types';

// Test insert function
export async function testInsert(data: ClientInquiryInsert) {
    // We cast to 'any' to avoid strict schema inference errors during build
    // if the local ClientInquiryInsert type doesn't perfectly match the DB schema.
    const result = await supabase
        .from('client_inquiries')
        .insert(data as unknown as Record<string, unknown>)
        .select()
        .single();

    return result;
}

// Test what happens if we use explicit generic
export async function testInsertExplicit(data: ClientInquiryInsert) {
    const result = await supabase
        .from('client_inquiries')
        .insert(data as unknown as Record<string, unknown>)
        .select();
    return result;
}
