import api from '../lib/apiClient';
import type { SupportTicketRow, SupportTicketInsert } from '../types/database.types';
import type { ServiceResponse } from '../types/api.types';

export async function getUserTickets(userId: string): Promise<ServiceResponse<SupportTicketRow[]>> {
    try {
        const data = await api.get<SupportTicketRow[]>(`/support-tickets/user/${userId}`);
        return { data: Array.isArray(data) ? data : [], error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function createTicket(ticket: SupportTicketInsert): Promise<ServiceResponse<SupportTicketRow>> {
    try {
        const data = await api.post<SupportTicketRow>('/support-tickets', ticket);
        return { data, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}
