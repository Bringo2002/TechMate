import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, ChevronLeft, Save, ArrowLeft } from "lucide-react";
import { getProjectById } from "../../../services/admin.service";
import { updateProject } from "../../../services/projectService";
import { getAllClients } from "../../../services/admin.service";
import type { ProfileRow, ProjectUpdate } from "../../../types/database.types";
import toast from "react-hot-toast";

// --- Option constants (shared with New.tsx) ---
const STATUS_OPTIONS = [
  { label: "Planning", value: "planning" },
  { label: "Active", value: "active" },
  { label: "Review", value: "review" },
  { label: "Completed", value: "completed" },
  { label: "On Hold", value: "on_hold" },
  { label: "Cancelled", value: "cancelled" },
];

const PRIORITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

const PAYMENT_STATUS_OPTIONS = [
  { label: "Unpaid", value: "unpaid" },
  { label: "Partial", value: "partial" },
  { label: "Paid", value: "paid" },
  { label: "Refunded", value: "refunded" },
];

const RISK_LEVEL_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

interface ProjectForm {
  name: string;
  client: string;
  client_id: string;
  type: string;
  budget: string;
  deadline: string;
  priority: string;
  status: string;
  description: string;
  technologies: string;
  payment_status: string;
  risk_level: string;
  progress: string;
  health_score: string;
  internal_notes: string;
}

const EditProject: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const [form, setForm] = useState<ProjectForm>({
    name: "",
    client: "",
    client_id: "",
    type: "",
    budget: "",
    deadline: "",
    priority: "medium",
    status: "planning",
    description: "",
    technologies: "",
    payment_status: "unpaid",
    risk_level: "medium",
    progress: "0",
    health_score: "100",
    internal_notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<ProfileRow[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [projectName, setProjectName] = useState("");

  // Load project data
  useEffect(() => {
    async function loadProject() {
      if (!projectId) {
        toast.error("No project ID provided.");
        navigate("/dashboard/projects");
        return;
      }

      setLoading(true);
      const { data, error } = await getProjectById(projectId);

      if (error || !data) {
        toast.error(error?.message ?? "Project not found.");
        navigate("/dashboard/projects");
        return;
      }

      setProjectName(data.name);
      setForm({
        name: data.name ?? "",
        client: data.client ?? "",
        client_id: data.user_id ?? "",
        type: data.type ?? "",
        budget: data.budget?.toString() ?? "0",
        deadline: data.deadline ? data.deadline.split("T")[0] : "",
        priority: data.priority ?? "medium",
        status: data.status ?? "planning",
        description: data.description ?? "",
        technologies: Array.isArray(data.technologies)
          ? data.technologies.join(", ")
          : "",
        payment_status: data.payment_status ?? "unpaid",
        risk_level: data.risk_level ?? "medium",
        progress: data.progress?.toString() ?? "0",
        health_score: data.health_score?.toString() ?? "100",
        internal_notes: data.internal_notes ?? "",
      });

      setLoading(false);
    }

    loadProject();
  }, [projectId, navigate]);

  // Load clients for dropdown
  useEffect(() => {
    async function fetchClients() {
      setLoadingClients(true);
      const { data, error } = await getAllClients();
      if (error) {
        toast.error("Failed to load clients list");
      } else {
        setClients(data || []);
      }
      setLoadingClients(false);
    }
    fetchClients();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((old) => ({ ...old, [name]: value }));
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedClient = clients.find((c) => c.id === selectedId);

    if (selectedClient) {
      setForm((old) => ({
        ...old,
        client_id: selectedClient.id,
        client: selectedClient.full_name || selectedClient.email,
      }));
    } else {
      setForm((old) => ({
        ...old,
        client_id: "",
        client: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    setSaving(true);

    try {
      const updates: ProjectUpdate = {
        name: form.name,
        user_id: form.client_id,
        client: form.client,
        type: form.type,
        budget: form.budget ? Number(form.budget) : 0,
        deadline: form.deadline
          ? new Date(form.deadline).toISOString()
          : null,
        priority: form.priority as ProjectUpdate["priority"],
        status: form.status as ProjectUpdate["status"],
        description: form.description || null,
        technologies: form.technologies
          ? form.technologies.split(",").map((t) => t.trim())
          : [],
        payment_status:
          form.payment_status as ProjectUpdate["payment_status"],
        risk_level: form.risk_level as ProjectUpdate["risk_level"],
        progress: Number(form.progress) || 0,
        health_score: Number(form.health_score) || 100,
        internal_notes: form.internal_notes || null,
      };

      const { error } = await updateProject(projectId, updates);
      if (error) {
        toast.error(`Update failed: ${error.message}`);
      } else {
        toast.success("Project updated!");
        navigate(`/dashboard/projects/${projectId}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin relative z-10" />
          </div>
          <p className="text-blue-400/80 font-medium animate-pulse">
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  // ── Form ──
  return (
    <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl bg-gradient-to-br from-blue-900/30 via-indigo-900/30 to-purple-900/30 border border-blue-500/20 rounded-3xl shadow-xl p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <button
            type="button"
            className="text-blue-400 hover:text-blue-300 transition"
            onClick={() => navigate(`/dashboard/projects/${projectId}`)}
            title="Back to project"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-bold text-3xl text-white bg-gradient-to-r from-blue-200 to-indigo-400 bg-clip-text text-transparent">
              Edit Project
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{projectName}</p>
          </div>
        </div>

        <form
          className="grid gap-6"
          onSubmit={handleSubmit}
          style={{
            opacity: saving ? 0.5 : 1,
            pointerEvents: saving ? "none" : "auto",
          }}
        >
          {/* Name */}
          <div>
            <label className="block mb-1 text-gray-400 font-semibold">
              Project Name
            </label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-blue-500/30 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-blue-300/30"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Client Selection */}
          <div>
            <label className="block mb-1 text-gray-400 font-semibold">
              Client
            </label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-blue-400/30 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-blue-300/30"
              name="client_id"
              value={form.client_id}
              onChange={handleClientChange}
              required
              disabled={loadingClients}
            >
              <option value="">-- Choose a Client --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name || c.email}{" "}
                  {c.company ? `(${c.company})` : ""}
                </option>
              ))}
            </select>
            {loadingClients && (
              <p className="text-xs text-blue-400 mt-1 animate-pulse">
                Loading clients...
              </p>
            )}
          </div>

          {/* Two-column row: Type + Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-400 font-semibold">
                Type
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-purple-400/30 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-purple-300/30"
                name="type"
                type="text"
                value={form.type}
                onChange={handleChange}
                placeholder="e.g. Website, Mobile App"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-400 font-semibold">
                Budget (USD)
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-amber-400/30 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-amber-300/30"
                name="budget"
                type="number"
                value={form.budget}
                onChange={handleChange}
                min={0}
                step={0.01}
              />
            </div>
          </div>

          {/* Two-column row: Deadline + Progress */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-400 font-semibold">
                Deadline
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-sky-400/30 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-sky-300/30"
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-400 font-semibold">
                Progress (%)
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-emerald-400/30 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-emerald-300/30"
                name="progress"
                type="number"
                value={form.progress}
                onChange={handleChange}
                min={0}
                max={100}
              />
            </div>
          </div>

          {/* Two-column row: Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-400 font-semibold">
                Status
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-blue-400/30 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-blue-300/30"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-gray-400 font-semibold">
                Priority
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-indigo-400/30 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-indigo-300/30"
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Two-column row: Payment Status + Risk Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-400 font-semibold">
                Payment Status
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-amber-400/30 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-amber-300/30"
                name="payment_status"
                value={form.payment_status}
                onChange={handleChange}
              >
                {PAYMENT_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-gray-400 font-semibold">
                Risk Level
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-pink-400/30 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-pink-300/30"
                name="risk_level"
                value={form.risk_level}
                onChange={handleChange}
              >
                {RISK_LEVEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Health Score */}
          <div>
            <label className="block mb-1 text-gray-400 font-semibold">
              Health Score (0-100)
            </label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-emerald-400/30 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-emerald-300/30"
              name="health_score"
              type="number"
              value={form.health_score}
              onChange={handleChange}
              min={0}
              max={100}
            />
          </div>

          {/* Technologies */}
          <div>
            <label className="block mb-1 text-gray-400 font-semibold">
              Technologies
            </label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring"
              name="technologies"
              type="text"
              value={form.technologies}
              onChange={handleChange}
              placeholder="Comma-separated (e.g. React, Node.js)"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 text-gray-400 font-semibold">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block mb-1 text-gray-400 font-semibold">
              Internal Notes{" "}
              <span className="text-xs text-amber-400/70 ml-1">
                (Admin only)
              </span>
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-amber-500/30 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-amber-300/30"
              name="internal_notes"
              value={form.internal_notes}
              onChange={handleChange}
              rows={3}
              placeholder="Private notes not visible to the client..."
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg active:scale-95"
            >
              {saving ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Save Changes
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                navigate(`/dashboard/projects/${projectId}`)
              }
              className="flex-1 flex items-center justify-center gap-2 px-8 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-semibold transition-all shadow active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProject;
