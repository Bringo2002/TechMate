import { useState } from "react";

interface DeleteAccountButtonProps {
  entityLabel?: string;
  confirmText?: string;
  onConfirm: () => Promise<void>;
  isLoading?: boolean; // External loading state
}

export const DeleteAccountButton = ({
  entityLabel = "account",
  confirmText = "DELETE",
  onConfirm,
  isLoading = false, // Default value
}: DeleteAccountButtonProps) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = input === confirmText;

  const handleDelete = async () => {
    if (!canDelete || loading || isLoading) return; // Prevent action if loading

    try {
      setLoading(true);
      setError(null);
      await onConfirm();
    } catch {
      setError("Failed to delete. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Primary trigger */}
      <button
        onClick={() => setOpen(true)}
        disabled={isLoading} // Disable if externally loading
        className="text-sm font-medium text-red-600 hover:text-red-700"
        aria-label={`Delete ${entityLabel}`}
      >
        Delete my {entityLabel}
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl bg-zinc-900 p-6 text-white shadow-xl border border-red-600">
            <h2 className="text-lg font-semibold text-red-500">
              Delete {entityLabel}
            </h2>

            <p className="mt-3 text-sm text-zinc-300">
              This action is permanent. All data associated with your{" "}
              {entityLabel} will be permanently removed and cannot be recovered.
            </p>

            <div className="mt-4">
              <p className="mb-1 text-sm text-zinc-400">
                Type{" "}
                <span className="font-mono text-red-400">{confirmText}</span>{" "}
                to confirm.
              </p>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full rounded-md bg-zinc-800 px-3 py-2 text-sm text-white outline-none ring-1 ring-zinc-700 focus:ring-red-600"
                placeholder={confirmText}
                autoFocus
              />
            </div>

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={loading || isLoading} // Disable if loading
                className="rounded-md px-4 py-2 text-sm text-zinc-300 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={!canDelete || loading || isLoading} // Include isLoading check
                className={`rounded-md px-4 py-2 text-sm font-medium transition
                  ${
                    canDelete
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-red-600/40 text-white/60 cursor-not-allowed"
                  }`}
              >
                {loading || isLoading ? "Deleting..." : "Yes, delete"} {/* Update text */}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
