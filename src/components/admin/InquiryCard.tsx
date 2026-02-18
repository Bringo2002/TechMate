// ============================================================================
// InquiryCard Component
// Card component displaying individual inquiry in the pipeline
// ============================================================================

import React from 'react';
import { InquiryStatusBadge } from './InquiryStatusBadge';
import type { ClientInquiryRow } from '../../types/database.types';

interface InquiryCardProps {
  inquiry: ClientInquiryRow & {
    client?: {
      full_name: string;
      email: string;
      company?: string;
      avatar_url?: string;
    };
  };
  onClick?: () => void;
  className?: string;
}

export function InquiryCard({ inquiry, onClick, className = '' }: InquiryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '⚪';
      default:
        return '';
    }
  };

  const getProjectTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      website: '🌐',
      web_app: '💻',
      mobile_app: '📱',
      custom_software: '⚙️',
      consulting: '🤝',
      maintenance: '🔧',
      other: '📦',
    };
    return icons[type] || '📄';
  };

  return (
    <div
      onClick={onClick}
      className={`group relative cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors mb-1">
            {inquiry.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{getProjectTypeIcon(inquiry.project_type)}</span>
            <span className="capitalize">
              {inquiry.project_type.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
        <InquiryStatusBadge status={inquiry.status} />
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
        {inquiry.description}
      </p>

      {/* Client Info */}
      {inquiry.client && (
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
          <div className="flex-shrink-0">
            {inquiry.client.avatar_url ? (
              <img
                src={inquiry.client.avatar_url}
                alt={inquiry.client.full_name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-xs font-semibold text-white">
                  {inquiry.client.full_name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {inquiry.client.full_name}
            </p>
            {inquiry.client.company && (
              <p className="text-xs text-gray-500 truncate">
                {inquiry.client.company}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        {/* Budget */}
        {inquiry.budget_range && (
          <div className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{inquiry.budget_range}</span>
          </div>
        )}

        {/* Priority */}
        {inquiry.priority && (
          <div className="flex items-center gap-1.5">
            <span>{getPriorityIcon(inquiry.priority)}</span>
            <span className={`font-medium ${getPriorityColor(inquiry.priority)}`}>
              {inquiry.priority}
            </span>
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center gap-1.5 ml-auto">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatDate(inquiry.created_at)}</span>
        </div>
      </div>

      {/* Footer - Assigned Status */}
      {inquiry.assigned_to && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600">Assigned to team</span>
          </div>
        </div>
      )}

      {/* Unassigned Warning */}
      {!inquiry.assigned_to && inquiry.status === 'new' && (
        <div className="mt-4 pt-4 border-t border-yellow-200 bg-yellow-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
          <div className="flex items-center gap-2 text-sm text-yellow-800">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">Not assigned yet</span>
          </div>
        </div>
      )}

      {/* Hover Effect Indicator */}
      <div className="absolute top-0 right-0 mt-2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// Compact Inquiry Card (For list views)
// ============================================================================

interface CompactInquiryCardProps {
  inquiry: ClientInquiryRow;
  onClick?: () => void;
}

export function CompactInquiryCard({ inquiry, onClick }: CompactInquiryCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="font-medium text-gray-900 truncate">{inquiry.title}</h4>
          <InquiryStatusBadge status={inquiry.status} size="sm" />
        </div>
        <p className="text-sm text-gray-600 truncate">{inquiry.description}</p>
      </div>
      <div className="flex-shrink-0 text-sm text-gray-500">
        {new Date(inquiry.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}