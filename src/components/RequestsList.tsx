"use client"

import { useRequests } from "../hooks/useRequests"

export default function RequestsList() {
  const { requests, loading, error } = useRequests()

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div className="space-y-4">
      {requests.length === 0 && <p>No requests yet.</p>}
      {requests.map((req) => (
        <div key={req.id} className="border rounded-xl p-4 shadow">
          <h2 className="text-lg font-bold">{req.title}</h2>
          <p>{req.description}</p>
          {req.budget && <p className="text-sm text-gray-600">Budget: ${req.budget}</p>}
          <p className="text-xs text-gray-400">
            {new Date(req.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}
