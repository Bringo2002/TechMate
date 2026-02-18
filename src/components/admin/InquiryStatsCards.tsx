// ============================================================================
// InquiryStatsCards Component
// Dashboard cards showing inquiry pipeline metrics
// ============================================================================

import React from 'react';
import { useInquiryStats } from '../../hooks/useInquiries';

interface InquiryStatsCardsProps {
  userId?: string; // If provided, shows client-specific stats
  className?: string;
}

export function InquiryStatsCards({ userId, className = '' }: InquiryStatsCardsProps) {
  const { stats, loading, error } = useInquiryStats(userId);

  if (loading) {
    return (
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border bg-white p-6 shadow-sm">
            <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-red-900">Failed to load statistics</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Admin view vs Client view
  const isAdminView = !userId;

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {/* Total Inquiries */}
      <StatCard
        title="Total Inquiries"
        value={stats?.total_inquiries || 0}
        icon={
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        bgColor="bg-blue-100"
        textColor="text-blue-600"
      />

      {/* New or Pending Inquiries */}
      {isAdminView ? (
        <StatCard
          title="New"
          value={stats?.new_inquiries || 0}
          icon={
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
          bgColor="bg-purple-100"
          textColor="text-purple-600"
        />
      ) : (
        <StatCard
          title="Pending"
          value={stats?.pending || 0}
          icon={
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          bgColor="bg-yellow-100"
          textColor="text-yellow-600"
        />
      )}

      {/* In Review (Admin) or Accepted (Client) */}
      {isAdminView ? (
        <StatCard
          title="In Review"
          value={stats?.in_review || 0}
          icon={
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
          bgColor="bg-yellow-100"
          textColor="text-yellow-600"
        />
      ) : (
        <StatCard
          title="Accepted"
          value={stats?.accepted || 0}
          icon={
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
          bgColor="bg-green-100"
          textColor="text-green-600"
        />
      )}

      {/* Accepted (Admin) or Declined (Client) */}
      <StatCard
        title={isAdminView ? "Accepted" : "Declined"}
        value={isAdminView ? (stats?.accepted || 0) : (stats?.declined || 0)}
        icon={
          isAdminView ? (
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        }
        bgColor={isAdminView ? "bg-green-100" : "bg-red-100"}
        textColor={isAdminView ? "text-green-600" : "text-red-600"}
      />
    </div>
  );
}

// ============================================================================
// Stat Card Component (Internal)
// ============================================================================

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  subtitle?: string;
}

function StatCard({ 
  title, 
  value, 
  icon, 
  bgColor, 
  textColor,
  subtitle 
}: StatCardProps) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${textColor}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-full ${bgColor} p-3 flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Compact Version (for smaller spaces)
// ============================================================================

interface CompactInquiryStatsProps {
  userId?: string;
  className?: string;
}

export function CompactInquiryStats({ userId, className = '' }: CompactInquiryStatsProps) {
  const { stats, loading } = useInquiryStats(userId);

  if (loading) {
    return (
      <div className={`flex gap-6 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-3 w-16 bg-gray-200 rounded mb-1" />
            <div className="h-6 w-10 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-6 ${className}`}>
      <CompactStat label="Total" value={stats?.total_inquiries || 0} />
      <CompactStat label="New" value={stats?.new_inquiries || 0} color="text-blue-600" />
      <CompactStat label="In Review" value={stats?.in_review || 0} color="text-yellow-600" />
      <CompactStat label="Accepted" value={stats?.accepted || 0} color="text-green-600" />
    </div>
  );
}

function CompactStat({ 
  label, 
  value, 
  color = 'text-gray-900' 
}: { 
  label: string; 
  value: number; 
  color?: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-600">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}