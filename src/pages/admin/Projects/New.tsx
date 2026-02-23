import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, ChevronLeft, Save, RefreshCcw, ClipboardCheck } from "lucide-react";
import { createProject } from "../../../services/projectService";
import { getInquiryById } from "../../../services/inquiries.service";
import toast from "react-hot-toast";

// --- Project Schema Fields ---
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
  type: string;
  budget: string;
  deadline: string;
  priority: string;
  status: string;
  description: string;
  technologies: string;
  inquiry_id: string;
  payment_status: string;
  risk_level: string;
}

// --- Main Create Page ---
const AdminCreateProject: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Optional: use query param or state to prefill from inquiry
  const inquiryId = new URLSearchParams(location.search).get("inquiryId") || (location.state && location.state.inquiryId);

  // -- Form state --
  const [form, setForm] = useState<ProjectForm>({
    name: "",
    client: "",
    type: "",
    budget: "",
    deadline: "",
    priority: "medium",
    status: "planning",
    description: "",
    technologies: "",
    inquiry_id: "", // fk for project<->inquiry link
    payment_status: "unpaid",
    risk_level: "medium",
  });
  const [loading, setLoading] = useState(false);

  // Prefill from inquiry if provided
  useEffect(() => {
    async function prefillFromInquiry() {
      if (inquiryId) {
        setLoading(true);
        const { data: inquiry, error } = await getInquiryById(inquiryId);
        setLoading(false);

        if (error || !inquiry) {
          toast.error("Failed to load inquiry data");
          return;
        }
        setForm((f) => ({
          ...f,
          name: inquiry.title || "",
          client: inquiry.client?.full_name || "",
          type: inquiry.project_type || "",
          budget: inquiry.budget_min?.toString() ?? "",
          deadline: inquiry.deadline ? inquiry.deadline.split("T")[0] : "",
          description: inquiry.description || "",
          inquiry_id: inquiry.id,
        }));
      }
    }
    prefillFromInquiry();
  }, [inquiryId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((old) => ({ ...old, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const projectPayload: any = {
        name: form.name,
        client: form.client,
        type: form.type,
        budget: form.budget ? Number(form.budget) : null,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        priority: form.priority,
        status: form.status,
        description: form.description,
        technologies: form.technologies
          ? form.technologies.split(",").map((t) => t.trim())
          : [],
        inquiry_id: form.inquiry_id || null,
        payment_status: form.payment_status,
        risk_level: form.risk_level,
      };

      const { error } = await createProject(projectPayload);
      if (error) {
        toast.error("Project creation failed");
      } else {
        toast.success("Project created!");
        // Optionally: navigate to the project page or dashboard
        navigate("/admin/projects");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center py-10">
      <div className="w-full max-w-2xl bg-gradient-to-br from-emerald-900/30 via-blue-900/30 to-purple-900/30 border border-emerald-500/20 rounded-3xl shadow-xl p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <button
            type="button"
            className="text-emerald-400 hover:text-emerald-300 transition"
            onClick={() => navigate(-1)}
            title="Back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-3xl text-white bg-gradient-to-r from-emerald-200 to-blue-400 bg-clip-text text-transparent">
            Create New Project
          </h1>
        </div>
        {inquiryId && (
          <div className="flex items-center gap-2 text-sm text-blue-400 mb-2 bg-blue-500/10 rounded-lg py-2 px-4 border border-blue-700/30">
            <ClipboardCheck className="w-5 h-5" />
            Converting inquiry <span className="font-mono">{inquiryId}</span>
          </div>
        )}

        <form
          className="grid gap-6"
          onSubmit={handleSubmit}
          style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? "none" : "auto" }}
        >
          {/* Name */}
          <div>
            <label className="block mb-1 text-gray-400 font-semibold">Project Name</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-emerald-500/30 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-emerald-300/30"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          {/* Client */}
          <div>
            <label className="block mb-1 text-gray-400 font-semibold">Client Name</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-blue-400/30 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-blue-300/30"
              name="client"
              type="text"
              value={form.client}
              onChange={handleChange}
              required
            />
          </div>
          {/* Type */}
          <div>
            <label className="block mb-1 text-gray-400 font-semibold">Type</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-purple-400/30 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-purple-300/30"
              name="type"
              type="text"
              value={form.type}
              onChange={handleChange}
              placeholder="(e.g. Website, Mobile App)"
              required
            />
          </div>
          {/* Budget */}
          <div>
            <label className="block mb-1 text-gray-400 font-semibold">Budget (USD)</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-amber-400/30 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-amber-300/30"
              name="budget"
              type="number"
              value={form.budget}
              onChange={handleChange}
              min={0}
              step={0.01}
              placeholder="0.00"
            />
          </div>
          {/* Deadline */}
          <div>
            <label className="block mb-1 text-gray-400 font-semibold">Deadline</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-sky-400/30 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-sky-300/30"
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
            />
          </div>
          {/* Priority */}
          <div>
            <label className="block mb-1 text-gray-400 font-semibold">Priority</label>
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
          {/* Status */}
          <div>
            <label className="block mb-1 text-gray-400 font-semibold">Status</label>
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
          {/* Payment Status */}
          <div>
            <label className="block mb-1 text-gray-400 font-semibold">Payment Status</label>
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
          {/* Risk Level */}
          <div>
            <label className="block mb-1 text-gray-400 font-semibold">Risk Level</label>
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
          {/* Technologies */}
          <div>
            <label className="block mb-1 text-gray-400 font-semibold">Technologies</label>
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
            <label className="block mb-1 text-gray-400 font-semibold">Description</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
              Create Project
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setForm({
                name: "",
                client: "",
                type: "",
                budget: "",
                deadline: "",
                priority: "medium",
                status: "planning",
                description: "",
                technologies: "",
                inquiry_id: "",
                payment_status: "unpaid",
                risk_level: "medium",
              })}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-semibold transition-all shadow active:scale-95"
            >
              <RefreshCcw className="w-5 h-5" /> Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateProject;