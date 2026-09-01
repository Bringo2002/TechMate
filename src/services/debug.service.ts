import api from '../lib/apiClient';
import { ClientInquiryInsert } from '../types/database.types';

// Test insert function
export async function testInsert(data: ClientInquiryInsert) {
    return api.post('/inquiries', data);
}

// Test what happens if we use explicit generic
export async function testInsertExplicit(data: ClientInquiryInsert) {
    return api.post('/inquiries', data);
}
