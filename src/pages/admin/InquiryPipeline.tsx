// ============================================================================
// InquiryPipeline Page
// Main admin page for managing client inquiries
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInquiries } from '../../hooks/useInquiries';
import { InquiryStatsCards } from '../../components/admin/InquiryStatsCards';
import { InquiryFilters } from '../../components/admin/InquiryFilters';
import { InquiryCard } from '../../components/admin/InquiryCard';
import type { InquiryStatus } from '../../types/database.types';

export function InquiryPipeline() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{
    status?: InquiryStatus;
    priority?: string;
    assigned_to?: string;
    project_type?: string;
  }>({});

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { inquiries, loading, error, refresh } = useInquiries({
    filters,
    realtime: true, // Enable real-time updates
  });

  const handleInquiryClick = (inquiryId: string) => {
    navigate(`/admin/inquiries/${inquiryId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Inquiry Pipeline
              </h1>
              <p className="mt-2 text-gray-600">
                Manage incoming client project inquiries and move them through your sales pipeline
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid view"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List view"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={refresh}
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <InquiryStatsCards className="mb-6" />

        {/* Filters */}
        <InquiryFilters 
          filters={filters} 
          onFilterChange={setFilters}
          className="mb-6"
        />

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 mb-6">
            <div className="flex items-start gap-3">
              <svg className="h-6 w-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900">
                  Error Loading Inquiries
                </h3>
                <p className="mt-1 text-red-700">{error}</p>
                <button
                  onClick={refresh}
                  className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && inquiries.length === 0 ? (
          <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-2'}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border bg-white p-6">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-4" />
                <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                <div className="h-4 w-2/3 bg-gray-200 rounded mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-gray-200 rounded" />
                  <div className="h-6 w-16 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : inquiries.length === 0 ? (
          /* Empty State */
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No inquiries found
            </h3>
            <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
              {filters.status || filters.priority || filters.project_type
                ? 'Try adjusting your filters to see more results'
                : 'New client inquiries will appear here when they submit project requests through your website'}
            </p>
            {(filters.status || filters.priority || filters.project_type) && (
              <button
                onClick={() => setFilters({})}
                className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* Inquiries Display */
          <>
            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium text-gray-900">{inquiries.length}</span> {inquiries.length === 1 ? 'inquiry' : 'inquiries'}
              </p>
              {loading && (
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Updating...
                </span>
              )}
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inquiries.map((inquiry) => (
                  <InquiryCard
                    key={inquiry.id}
                    inquiry={inquiry}
                    onClick={() => handleInquiryClick(inquiry.id)}
                  />
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                {inquiries.map((inquiry, index) => (
                  <div
                    key={inquiry.id}
                    className={`${index !== 0 ? 'border-t' : ''}`}
                  >
                    <InquiryCard
                      inquiry={inquiry}
                      onClick={() => handleInquiryClick(inquiry.id)}
                      className="rounded-none border-0 shadow-none hover:shadow-none hover:bg-gray-50"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default InquiryPipeline;