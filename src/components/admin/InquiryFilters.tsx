// ============================================================================
// InquiryFilters Component
// Filter controls for the inquiry pipeline
// ============================================================================

import React from 'react';
import type { InquiryStatus } from '../../types/database.types';

interface InquiryFiltersProps {
  filters: {
    status?: InquiryStatus;
    priority?: string;
    assigned_to?: string;
    project_type?: string;
  };
  onFilterChange: (filters: any) => void;
  className?: string;
}

export function InquiryFilters({ 
  filters, 
  onFilterChange,
  className = '' 
}: InquiryFiltersProps) {
  const handleStatusChange = (status: string) => {
    onFilterChange({ 
      ...filters, 
      status: status === 'all' ? undefined : status 
    });
  };

  const handlePriorityChange = (priority: string) => {
    onFilterChange({ 
      ...filters, 
      priority: priority === 'all' ? undefined : priority 
    });
  };

  const handleProjectTypeChange = (projectType: string) => {
    onFilterChange({ 
      ...filters, 
      project_type: projectType === 'all' ? undefined : projectType 
    });
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = filters.status || filters.priority || filters.assigned_to || filters.project_type;

  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-end gap-4">
        {/* Status Filter */}
        <div className="flex flex-col min-w-[180px]">
          <label className="mb-1.5 text-xs font-medium text-gray-700 uppercase tracking-wide">
            Status
          </label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="new">✨ New</option>
            <option value="reviewing">👀 Reviewing</option>
            <option value="discovery_call_scheduled">📅 Call Scheduled</option>
            <option value="discovery_call_completed">✓ Call Completed</option>
            <option value="quoted">💰 Quoted</option>
            <option value="proposal_sent">📧 Proposal Sent</option>
            <option value="accepted">🎉 Accepted</option>
            <option value="declined">✕ Declined</option>
            <option value="on_hold">⏸ On Hold</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex flex-col min-w-[140px]">
          <label className="mb-1.5 text-xs font-medium text-gray-700 uppercase tracking-wide">
            Priority
          </label>
          <select
            value={filters.priority || 'all'}
            onChange={(e) => handlePriorityChange(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">⚪ Low</option>
          </select>
        </div>

        {/* Project Type Filter */}
        <div className="flex flex-col min-w-[180px]">
          <label className="mb-1.5 text-xs font-medium text-gray-700 uppercase tracking-wide">
            Project Type
          </label>
          <select
            value={filters.project_type || 'all'}
            onChange={(e) => handleProjectTypeChange(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            <option value="all">All Types</option>
            <option value="website">🌐 Website</option>
            <option value="web_app">💻 Web App</option>
            <option value="mobile_app">📱 Mobile App</option>
            <option value="custom_software">⚙️ Custom Software</option>
            <option value="consulting">🤝 Consulting</option>
            <option value="maintenance">🔧 Maintenance</option>
            <option value="other">📦 Other</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              onClick={clearAllFilters}
              className="group flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            >
              <svg 
                className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Active filters:</span>
            
            {filters.status && (
              <FilterTag
                label={`Status: ${formatFilterValue(filters.status)}`}
                onRemove={() => handleStatusChange('all')}
              />
            )}
            
            {filters.priority && (
              <FilterTag
                label={`Priority: ${formatFilterValue(filters.priority)}`}
                onRemove={() => handlePriorityChange('all')}
              />
            )}
            
            {filters.project_type && (
              <FilterTag
                label={`Type: ${formatFilterValue(filters.project_type)}`}
                onRemove={() => handleProjectTypeChange('all')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Filter Tag Component (Internal)
// ============================================================================

interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 border border-blue-200 px-3 py-1 text-xs font-medium text-blue-800">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
        aria-label="Remove filter"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatFilterValue(value: string): string {
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================================================
// Compact Filter Bar (Alternative Layout)
// ============================================================================

interface CompactInquiryFiltersProps {
  filters: InquiryFiltersProps['filters'];
  onFilterChange: InquiryFiltersProps['onFilterChange'];
  className?: string;
}

export function CompactInquiryFilters({ 
  filters, 
  onFilterChange,
  className = '' 
}: CompactInquiryFiltersProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700">Filter:</span>
      
      <select
        value={filters.status || 'all'}
        onChange={(e) => onFilterChange({ ...filters, status: e.target.value === 'all' ? undefined : e.target.value })}
        className="text-sm rounded border-gray-300 py-1 px-2"
      >
        <option value="all">All</option>
        <option value="new">New</option>
        <option value="reviewing">Reviewing</option>
        <option value="accepted">Accepted</option>
      </select>

      <select
        value={filters.priority || 'all'}
        onChange={(e) => onFilterChange({ ...filters, priority: e.target.value === 'all' ? undefined : e.target.value })}
        className="text-sm rounded border-gray-300 py-1 px-2"
      >
        <option value="all">Any Priority</option>
        <option value="urgent">Urgent</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      {(filters.status || filters.priority) && (
        <button
          onClick={() => onFilterChange({})}
          className="text-xs text-gray-600 hover:text-gray-900"
        >
          Clear
        </button>
      )}
    </div>
  );
}