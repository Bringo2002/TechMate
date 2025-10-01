"use client"

import { useState } from "react"
import supabase from "../lib/supabaseClient"
import { useRequests } from "../hooks/useRequests"

export default function CreateRequestForm() {
  const { refetch } = useRequests()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", budget: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from("requests").insert([
      {
        title: form.title,
        description: form.description,
        budget: form.budget ? parseFloat(form.budget) : null,
      },
    ])

    setLoading(false)

    if (error) {
      alert("Failed: " + error.message)
    } else {
      alert("Request created!")
      setForm({ title: "", description: "", budget: "" })
      refetch() // refresh list manually in case realtime misses it
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Title"
        className="w-full border p-2 rounded"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />
      <textarea
        placeholder="Describe your needs..."
        className="w-full border p-2 rounded"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Budget (optional)"
        className="w-full border p-2 rounded"
        value={form.budget}
        onChange={(e) => setForm({ ...form, budget: e.target.value })}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  )
}
