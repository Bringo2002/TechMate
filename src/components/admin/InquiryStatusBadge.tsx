// ============================================================================
// InquiryStatusBadge Component
// Visual badge for displaying inquiry status with color coding
// ============================================================================

import React from 'react';
import type { InquiryStatus } from '../../types/database.types';

interface InquiryStatusBadgeProps {
  status: InquiryStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Status configuration with colors, labels, and icons
const statusConfig: Record<InquiryStatus, {
  label: string;
  className: string;
  icon?: string;
}> = {
  new: {
    label: 'New',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '✨',
  },
  reviewing: {
    label: 'Reviewing',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '👀',
  },
  discovery_call_scheduled: {
    label: 'Call Scheduled',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '📅',
  },
  discovery_call_completed: {
    label: 'Call Complete',
    className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: '✓',
  },
  quoted: {
    label: 'Quoted',
    className: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    icon: '💰',
  },
  proposal_sent: {
    label: 'Proposal Sent',
    className: 'bg-teal-100 text-teal-800 border-teal-200',
    icon: '📧',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: '🎉',
  },
  declined: {
    label: 'Declined',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: '✕',
  },
  on_hold: {
    label: 'On Hold',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '⏸',
  },
};

// Size variants
const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export function InquiryStatusBadge({ 
  status, 
  className = '',
  size = 'md',
}: InquiryStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.new;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.className} ${sizeClasses[size]} ${className}`}
      title={`Status: ${config.label}`}
    >
      {config.icon && <span className="leading-none">{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
}

// ============================================================================
// Status Dot Component (for more compact display)
// ============================================================================

interface InquiryStatusDotProps {
  status: InquiryStatus;
  showLabel?: boolean;
  className?: string;
}

const dotColors: Record<InquiryStatus, string> = {
  new: 'bg-blue-500',
  reviewing: 'bg-yellow-500',
  discovery_call_scheduled: 'bg-purple-500',
  discovery_call_completed: 'bg-indigo-500',
  quoted: 'bg-cyan-500',
  proposal_sent: 'bg-teal-500',
  accepted: 'bg-green-500',
  declined: 'bg-red-500',
  on_hold: 'bg-gray-500',
};

export function InquiryStatusDot({ 
  status, 
  showLabel = false,
  className = '' 
}: InquiryStatusDotProps) {
  const config = statusConfig[status] || statusConfig.new;
  const dotColor = dotColors[status] || dotColors.new;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span 
        className={`h-2 w-2 rounded-full ${dotColor}`}
        title={`Status: ${config.label}`}
      />
      {showLabel && (
        <span className="text-sm text-gray-700">{config.label}</span>
      )}
    </span>
  );
}

// ============================================================================
// Helper: Get status color class (for use in other components)
// ============================================================================

export function getStatusColorClass(status: InquiryStatus): string {
  const config = statusConfig[status];
  return config?.className || statusConfig.new.className;
}

export function getStatusLabel(status: InquiryStatus): string {
  const config = statusConfig[status];
  return config?.label || status;
}