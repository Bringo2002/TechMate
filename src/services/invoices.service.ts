// ============================================================================
// TechMate Invoices Service
// CRUD operations for user invoices
// ============================================================================

import supabase from '../lib/supabaseClient';
import type { InvoiceRow } from '../types/database.types';
import type { ServiceResponse } from '../types/api.types';

// ============================================================================
// Read
// ============================================================================
export async function getUserInvoices(
    userId: string
): Promise<ServiceResponse<InvoiceRow[]>> {
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: data ?? [], error: null };
}

export async function getInvoiceById(
    invoiceId: string
): Promise<ServiceResponse<InvoiceRow>> {
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data, error: null };
}

export interface InvoiceStats {
    totalInvoiced: number;
    totalPaid: number;
    totalOutstanding: number;
    overdueCount: number;
    invoiceCount: number;
}

export async function getInvoiceStats(userId: string): Promise<InvoiceStats> {
    const { data } = await supabase
        .from('invoices')
        .select('status, total_amount, amount')
        .eq('user_id', userId)
        .is('deleted_at', null);

    const invoices = data ?? [];

    return {
        invoiceCount: invoices.length,
        totalInvoiced: invoices.reduce((sum, inv) => sum + (inv.total_amount || inv.amount || 0), 0),
        totalPaid: invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + (inv.total_amount || inv.amount || 0), 0),
        totalOutstanding: invoices
            .filter(inv => ['sent', 'overdue'].includes(inv.status))
            .reduce((sum, inv) => sum + (inv.total_amount || inv.amount || 0), 0),
        overdueCount: invoices.filter(inv => inv.status === 'overdue').length,
    };
}
