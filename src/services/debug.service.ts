
import supabase from '../lib/supabaseClient';
import { ClientInquiryInsert } from '../types/database.types';

// Test insert function
export async function testInsert(data: ClientInquiryInsert) {
    // This line should error if types are wrong
    const result = await supabase
        .from('client_inquiries')
        .insert(data as any)
        .select()
        .single();

    return result;
}

// Test what happens if we use explicit generic
export async function testInsertExplicit(data: ClientInquiryInsert) {
    const result = await supabase
        // When using a typed Supabase client (createClient<Database>), 
        // you should NOT pass explicit generics to .from() for the table type.
        // It infers the correct types from the 'client_inquiries' string.
        // Passing the table definition as a second generic argument causes a type error 
        // because the typed client constrains that argument to 'never'.
        .from('client_inquiries')
        .insert(data as any)
        .select();
    return result;
}
