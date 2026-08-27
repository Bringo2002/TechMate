// ============================================================================
// TechMate Invoices Service
// CRUD operations for user invoices — now backed by the NestJS API
// ============================================================================

import api from '../lib/apiClient';
import type { InvoiceRow } from '../types/database.types';
import type { ServiceResponse } from '../types/api.types';

// ============================================================================
// Read
// ============================================================================
export async function getUserInvoices(
    userId: string
): Promise<ServiceResponse<InvoiceRow[]>> {
    try {
        const data = await api.get<InvoiceRow[]>(`/invoices?userId=${userId}`);
        return { data: Array.isArray(data) ? data : [], error: null };
    } catch (err) {
        return {
            data: null,
            error: { code: 'FETCH_FAILED', message: (err as Error).message },
        };
    }
}

export async function getInvoiceById(
    invoiceId: string
): Promise<ServiceResponse<InvoiceRow>> {
    try {
        const data = await api.get<InvoiceRow>(`/invoices/${invoiceId}`);
        return { data, error: null };
    } catch (err) {
        return {
            data: null,
            error: { code: 'FETCH_FAILED', message: (err as Error).message },
        };
    }
}

export interface InvoiceStats {
    totalInvoiced: number;
    totalPaid: number;
    totalOutstanding: number;
    overdueCount: number;
    invoiceCount: number;
}

export async function getInvoiceStats(userId: string): Promise<InvoiceStats> {
    return api.get<InvoiceStats>(`/invoices/stats?userId=${userId}`);
}

// ============================================================================
// Write (backend supports these now; no UI wires them up yet)
// ============================================================================
export async function markInvoicePaid(
    invoiceId: string,
    paymentMethod: string,
    paymentReference?: string
): Promise<ServiceResponse<InvoiceRow>> {
    try {
        const data = await api.post<InvoiceRow>(`/invoices/${invoiceId}/mark-paid`, {
            paymentMethod,
            paymentReference,
        });
        return { data, error: null };
    } catch (err) {
        return {
            data: null,
            error: { code: 'UPDATE_FAILED', message: (err as Error).message },
        };
    }
}
