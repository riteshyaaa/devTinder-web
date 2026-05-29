import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateProfile, getErrorMessage } from "../services/api";
import { addUser } from "../utils/userSlice";

const LOOKING_FOR_OPTIONS = [
  { value: "pair-programming", label: "Pair Programming Partner", emoji: "👥" },
  { value: "co-founder", label: "Co-founder", emoji: "🚀" },
  { value: "mentor", label: "Mentor", emoji: "🧑‍🏫" },
  { value: "mentee", label: "Mentee", emoji: "🎓" },
  { value: "hackathon-buddy", label: "Hackathon Buddy", emoji: "⚡" },
  { value: "open-source", label: "Open Source Contributor", emoji: "🌍" },
  { value: "networking", label: "Networking", emoji: "🤝" },
  { value: "job-referral", label: "Job Referral", emoji: "💼" },
];

/**
 * LookingForSection - allows users to set what they're looking for on the platform.
 */
const LookingForSection = ({ user }) => {
  const [selected, setSelected] = useState(user?.lookingFor || []);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleToggle = (value) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : prev.length < 3
        ? [...prev, value]
        : prev
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await updateProfile({ lookingFor: selected });
      dispatch(addUser(res.data.data));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const hasChanged =
    JSON.stringify(selected.sort()) !== JSON.stringify((user?.lookingFor || []).sort());

  return (
    <div className="bg-base-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-lg mb-2">🎯 Looking For</h3>
      <p className="text-xs opacity-60 mb-3">
        Select up to 3 — this helps others know what you're here for.
      </p>

      <div className="flex flex-wrap gap-2">
        {LOOKING_FOR_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              className={`btn btn-sm gap-1 ${
                isSelected ? "btn-primary" : "btn-outline"
              }`}
              aria-pressed={isSelected}
              aria-label={option.label}
            >
              <span aria-hidden="true">{option.emoji}</span>
              {option.label}
            </button>
          );
        })}
      </div>

      {error && <p className="text-error text-xs mt-2">{error}</p>}

      {hasChanged && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary btn-sm mt-3"
        >
          {saving ? <span className="loading loading-spinner loading-xs" /> : "Save"}
        </button>
      )}

      {showToast && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success py-2">
            <span>Looking For status updated!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LookingForSection;
