// ============================================================================
// AssignTeamMemberModal Component
// Modal for assigning inquiries to team members
// ============================================================================

import React, { useState, useEffect } from 'react';
import supabase from '../../lib/supabaseClient';
import { assignInquiry, unassignInquiry } from '../../services/inquiries.service';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  user_type: string;
  internal_role?: string;
  avatar_url?: string;
}

interface AssignTeamMemberModalProps {
  inquiryId: string;
  inquiryTitle: string;
  currentAssignedTo?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssignTeamMemberModal({
  inquiryId,
  inquiryTitle,
  currentAssignedTo,
  onClose,
  onSuccess,
}: AssignTeamMemberModalProps) {
  const [selectedUser, setSelectedUser] = useState(currentAssignedTo || '');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTeam, setFetchingTeam] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch team members on mount
  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    setFetchingTeam(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id, full_name, email, user_type, internal_role, avatar_url')
        .in('user_type', ['admin', 'technical_lead', 'developer'])
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('full_name');

      if (err) throw err;

      setTeamMembers(data || []);
    } catch (err: unknown) {
      console.error('Error loading team members:', err);
      setError('Failed to load team members');
    } finally {
      setFetchingTeam(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser && !currentAssignedTo) {
      setError('Please select a team member');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If no user selected, unassign
      if (!selectedUser) {
        const { error: err } = await unassignInquiry(inquiryId);
        if (err) throw err;
      } else {
        // Assign to selected user
        const { error: err } = await assignInquiry(inquiryId, selectedUser);
        if (err) throw err;
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Error assigning inquiry:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign inquiry');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Assign Team Member
            </h2>
            <p className="text-sm text-gray-600 mt-1 truncate max-w-sm">
              {inquiryTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {fetchingTeam ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="py-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="mt-4 text-sm text-gray-600">
                No team members found. Add team members in Settings.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Team Member Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Team Member
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {/* None/Unassign Option */}
                  <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="team-member"
                      value=""
                      checked={selectedUser === ''}
                      onChange={() => setSelectedUser('')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Unassigned
                      </p>
                      <p className="text-xs text-gray-500">
                        Remove current assignment
                      </p>
                    </div>
                  </label>

                  {/* Team Members */}
                  {teamMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="team-member"
                        value={member.id}
                        checked={selectedUser === member.id}
                        onChange={() => setSelectedUser(member.id)}
                        disabled={loading}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      
                      {/* Avatar */}
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.full_name}
                          className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-white">
                            {member.full_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.full_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {member.internal_role || member.user_type.replace('_', ' ')}
                        </p>
                      </div>

                      {/* Current Badge */}
                      {member.id === currentAssignedTo && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3">
                  <div className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          {!fetchingTeam && teamMembers.length > 0 && (
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (selectedUser === currentAssignedTo)}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {loading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}