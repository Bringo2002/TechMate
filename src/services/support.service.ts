import supabase from '../lib/supabaseClient';
import type { SupportTicketRow, SupportTicketInsert } from '../types/database.types';
import type { ServiceResponse } from '../types/api.types';

export async function getUserTickets(userId: string): Promise<ServiceResponse<SupportTicketRow[]>> {
    const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: data ?? [], error: null };
}

export async function createTicket(ticket: SupportTicketInsert): Promise<ServiceResponse<SupportTicketRow>> {
    const { data, error } = await supabase
        .from('support_tickets')
        .insert(ticket as any)
        .select()
        .single();

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data, error: null };
}
