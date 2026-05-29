import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";

const SKILL_OPTIONS = [
  "JavaScript", "TypeScript", "React", "Angular", "Vue", "Svelte",
  "Node.js", "Express", "Python", "Django", "Flask", "FastAPI",
  "Java", "Spring Boot", "Go", "Rust", "C++", "C#", ".NET",
  "Ruby", "Rails", "PHP", "Laravel", "Swift", "Kotlin",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase",
  "GraphQL", "REST API", "gRPC", "Next.js", "Nuxt.js",
  "Tailwind CSS", "Sass", "Git", "CI/CD", "Linux",
  "Machine Learning", "TensorFlow", "React Native", "Flutter", "Electron",
];

const EXPERIENCE_LEVELS = [
  { value: "", label: "Any Level" },
  { value: "junior", label: "Junior (0-2 yrs)" },
  { value: "mid", label: "Mid (2-5 yrs)" },
  { value: "senior", label: "Senior (5-10 yrs)" },
  { value: "lead", label: "Lead (10+ yrs)" },
];

/**
 * FeedFilter - Smart matching & filtering panel.
 *
 * "Smart Match" mode: prioritizes users with complementary skills
 * (e.g., if you know React, it shows Node.js/Python devs first).
 */
const FeedFilter = ({ filters, onFiltersChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [skillSearch, setSkillSearch] = useState("");
  const user = useSelector((state) => state.user);

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

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

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

  const handleSmartMatchToggle = () => {
    const newFilters = { ...localFilters, smartMatch: !localFilters.smartMatch };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters); // Immediate update for toggle
  };

  const handleReset = () => {
    const emptyFilters = { skills: [], experienceLevel: "", location: "", smartMatch: false };
    setLocalFilters(emptyFilters);
    setSkillSearch("");
    onReset();
  };

  const activeFilterCount =
    (localFilters.skills?.length || 0) +
    (localFilters.experienceLevel ? 1 : 0) +
    (localFilters.location ? 1 : 0) +
    (localFilters.smartMatch ? 1 : 0);

  // Filter skill options by search and exclude already selected
  const filteredSkills = SKILL_OPTIONS.filter(
    (s) =>
      s.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !localFilters.skills?.includes(s)
  );

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mb-2">
      {/* Toggle Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-ghost btn-sm gap-2"
          aria-expanded={isOpen}
          aria-controls="feed-filter-panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="badge badge-primary badge-xs">{activeFilterCount}</span>
          )}
        </button>

        {/* Smart Match Quick Toggle */}
        <button
          onClick={handleSmartMatchToggle}
          className={`btn btn-sm gap-1.5 ${
            localFilters.smartMatch ? "btn-secondary" : "btn-outline btn-secondary"
          }`}
          aria-pressed={localFilters.smartMatch}
          title="Smart Match shows developers with complementary skills to yours"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Smart Match
        </button>

        {/* User's current skills indicator */}
        {user?.skills?.length > 0 && localFilters.smartMatch && (
          <span className="text-xs opacity-50 hidden sm:inline">
            Matching complementary to: {user.skills.slice(0, 3).join(", ")}
            {user.skills.length > 3 ? "..." : ""}
          </span>
        )}
      </div>

      {/* Expanded Filter Panel */}
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
                  <span className="label-text text-sm font-medium">📍 Location</span>
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
                  <span className="label-text text-sm font-medium">🎯 Experience Level</span>
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

              {/* Skills Filter */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="label-text text-sm font-medium">🛠️ Filter by Skills</span>
                  {localFilters.skills?.length > 0 && (
                    <span className="text-xs opacity-50">
                      {localFilters.skills.length} selected
                    </span>
                  )}
                </div>

                {/* Selected filter skills */}
                {localFilters.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {localFilters.skills.map((skill) => (
                      <span
                        key={skill}
                        className="badge badge-primary badge-sm gap-1 cursor-pointer hover:badge-error"
                        onClick={() => handleSkillToggle(skill)}
                        role="button"
                        aria-label={`Remove ${skill} filter`}
                      >
                        {skill} ✕
                      </span>
                    ))}
                  </div>
                )}

                {/* Search */}
                <input
                  type="text"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  placeholder="Search technologies..."
                  className="input input-bordered input-xs w-full mt-2"
                />

                {/* Available skills */}
                <div className="flex flex-wrap gap-1.5 mt-2 max-h-28 overflow-y-auto">
                  {filteredSkills.slice(0, 24).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className="badge badge-outline badge-sm cursor-pointer hover:badge-primary transition-colors"
                      aria-label={`Filter by ${skill}`}
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              {activeFilterCount > 0 && (
                <button onClick={handleReset} className="btn btn-ghost btn-xs text-error">
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
