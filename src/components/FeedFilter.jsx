import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SKILL_OPTIONS = [
  "JavaScript", "TypeScript", "React", "Angular", "Vue",
  "Node.js", "Python", "Java", "Go", "Rust",
  "C++", "C#", "Ruby", "PHP", "Swift",
  "Kotlin", "Docker", "Kubernetes", "AWS", "MongoDB",
  "PostgreSQL", "GraphQL", "Next.js", "Tailwind CSS", "Git",
];

const EXPERIENCE_LEVELS = [
  { value: "", label: "Any Level" },
  { value: "junior", label: "Junior (0-2 yrs)" },
  { value: "mid", label: "Mid (2-5 yrs)" },
  { value: "senior", label: "Senior (5-10 yrs)" },
  { value: "lead", label: "Lead (10+ yrs)" },
];

/**
 * FeedFilter - collapsible filter panel for the feed.
 * Props:
 *   - filters: current filter state object
 *   - onFiltersChange: callback when filters change (debounced internally)
 *   - onReset: callback to clear all filters
 */
const FeedFilter = ({ filters, onFiltersChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Debounced filter update (500ms)
  const debouncedUpdate = useCallback(
    (newFilters) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      const timer = setTimeout(() => {
        onFiltersChange(newFilters);
      }, 500);
      setDebounceTimer(timer);
    },
    [onFiltersChange, debounceTimer]
  );

  // Sync external filter changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [debounceTimer]);

  const handleSkillToggle = (skill) => {
    const newSkills = localFilters.skills?.includes(skill)
      ? localFilters.skills.filter((s) => s !== skill)
      : [...(localFilters.skills || []), skill];
    const newFilters = { ...localFilters, skills: newSkills };
    setLocalFilters(newFilters);
    debouncedUpdate(newFilters);
  };

  const handleExperienceChange = (e) => {
    const newFilters = { ...localFilters, experienceLevel: e.target.value };
    setLocalFilters(newFilters);
    debouncedUpdate(newFilters);
  };

  const handleLocationChange = (e) => {
    const newFilters = { ...localFilters, location: e.target.value };
    setLocalFilters(newFilters);
    debouncedUpdate(newFilters);
  };

  const handleReset = () => {
    const emptyFilters = { skills: [], experienceLevel: "", location: "" };
    setLocalFilters(emptyFilters);
    onReset();
  };

  const activeFilterCount =
    (localFilters.skills?.length || 0) +
    (localFilters.experienceLevel ? 1 : 0) +
    (localFilters.location ? 1 : 0);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mb-4">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-sm gap-2"
        aria-expanded={isOpen}
        aria-controls="feed-filter-panel"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Filters
        {activeFilterCount > 0 && (
          <span className="badge badge-primary badge-sm">{activeFilterCount}</span>
        )}
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="feed-filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-base-200 rounded-lg p-4 mt-2 space-y-4">
              {/* Location */}
              <div className="form-control">
                <label className="label py-1" htmlFor="filter-location">
                  <span className="label-text text-sm font-medium">Location</span>
                </label>
                <input
                  id="filter-location"
                  type="text"
                  value={localFilters.location || ""}
                  onChange={handleLocationChange}
                  placeholder="e.g. San Francisco, Remote, India..."
                  className="input input-bordered input-sm w-full"
                />
              </div>

              {/* Experience Level */}
              <div className="form-control">
                <label className="label py-1" htmlFor="filter-experience">
                  <span className="label-text text-sm font-medium">Experience Level</span>
                </label>
                <select
                  id="filter-experience"
                  value={localFilters.experienceLevel || ""}
                  onChange={handleExperienceChange}
                  className="select select-bordered select-sm w-full"
                >
                  {EXPERIENCE_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skills */}
              <div>
                <span className="label-text text-sm font-medium">Skills</span>
                <div className="flex flex-wrap gap-2 mt-2 max-h-36 overflow-y-auto">
                  {SKILL_OPTIONS.map((skill) => {
                    const isSelected = localFilters.skills?.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleSkillToggle(skill)}
                        className={`badge badge-md cursor-pointer transition-all ${
                          isSelected
                            ? "badge-primary"
                            : "badge-outline hover:badge-primary"
                        }`}
                        aria-pressed={isSelected}
                        aria-label={`Filter by ${skill}`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reset Button */}
              {activeFilterCount > 0 && (
                <button
                  onClick={handleReset}
                  className="btn btn-ghost btn-xs text-error"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedFilter;
