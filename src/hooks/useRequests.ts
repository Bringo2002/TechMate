"use client"

import { useEffect, useState, useCallback } from "react"
import supabase from "../lib/supabaseClient"

export interface Request {
  id: string
  title: string
  description: string
  budget: number | null
  created_at: string
}

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("requests")
      .select("id, title, description, budget, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching requests:", error)
      setError(error.message)
    } else {
      setRequests(data || [])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching pattern
    fetchRequests()

    // Realtime subscription
    const channel = supabase
      .channel("requests-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "requests" }, (payload) => {
        setRequests((prev) => [payload.new as Request, ...prev])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchRequests])

  return { requests, loading, error, refetch: fetchRequests }
}
