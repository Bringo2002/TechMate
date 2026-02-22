import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInquiry } from '../../hooks/useInquiries';
import { updateInquiryStatus } from '../../services/inquiries.service';
import type { InquiryStatus } from '../../types/database.types';
import { InquiryStatusBadge } from '../../components/admin/InquiryStatusBadge';
import { AssignTeamMemberModal } from '../../components/admin/AssignTeamMemberModal';

export function InquiryDetail() {
  const { inquiryId } = useParams<{ inquiryId: string }>();
  const navigate = useNavigate();
  const { inquiry, loading, error, refresh } = useInquiry(inquiryId!);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: InquiryStatus) => {
    if (!inquiryId) return;

    setUpdating(true);
    const { error } = await updateInquiryStatus(inquiryId, newStatus);
    
    if (error) {
      alert('Failed to update status: ' + error.message);
    } else {
      refresh();
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h3 className="text-lg font-semibold text-red-900">Error</h3>
        <p className="mt-2 text-red-700">{error || 'Inquiry not found'}</p>
        <button
          onClick={() => navigate('/dashboard/inquiries')}
          className="mt-4 text-sm text-red-600 hover:text-red-800"
        >
          ← Back to Pipeline
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <button
            onClick={() => navigate('/dashboard/inquiries')}
            className="mb-4 text-sm text-blue-600 hover:text-blue-800"
          >
            ← Back to Pipeline
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{inquiry.title}</h1>
          <div className="mt-2 flex items-center gap-3">
            <InquiryStatusBadge status={inquiry.status} />
            {inquiry.priority && (
              <span className="text-sm text-gray-600">
                Priority: <span className="font-medium">{inquiry.priority}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{inquiry.description}</p>
          </div>

          {/* Requirements */}
          {inquiry.requirements && Array.isArray(inquiry.requirements) && inquiry.requirements.length > 0 && (
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {(inquiry.requirements as any[]).map((req: any, idx: number) => (
                  <li key={idx}>{typeof req === 'string' ? req : (req as any)?.description || 'Invalid requirement format'}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column - Actions & Meta */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowAssignModal(true)}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Assign to Team
              </button>
              <button
                onClick={() => navigate(`/admin/proposals/new?inquiryId=${inquiry.id}`)}
                className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Create Proposal
              </button>
            </div>
          </div>

          {/* Quick Status Update */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
            <select
              value={inquiry.status}
              onChange={(e) => handleStatusChange(e.target.value as InquiryStatus)}
              disabled={updating}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="discovery_call_scheduled">Call Scheduled</option>
              <option value="discovery_call_completed">Call Completed</option>
              <option value="quoted">Quoted</option>
              <option value="proposal_sent">Proposal Sent</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          {/* Meta Info */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-600">Project Type</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {inquiry.project_type.replace('_', ' ')}
                </dd>
              </div>
              {inquiry.budget_range && (
                <div>
                  <dt className="text-gray-600">Budget Range</dt>
                  <dd className="mt-1 font-medium text-gray-900">{inquiry.budget_range}</dd>
                </div>
              )}
              {inquiry.preferred_timeline && (
                <div>
                  <dt className="text-gray-600">Timeline</dt>
                  <dd className="mt-1 font-medium text-gray-900">{inquiry.preferred_timeline}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-600">Created</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {new Date(inquiry.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <AssignTeamMemberModal
          inquiryId={inquiry.id}
          inquiryTitle={inquiry.title}
          currentAssignedTo={inquiry.assigned_to || undefined}
          onClose={() => setShowAssignModal(false)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
