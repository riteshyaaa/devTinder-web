import { useState } from "react";
import { useDispatch } from "react-redux";
import UserCard from "./UserCard";
import { updateProfile, getErrorMessage } from "../services/api";
import { addUser } from "../utils/userSlice";
import {
  validateFirstName,
  validateLastName,
  validateAge,
  validatePhotoUrl,
  validateAbout,
} from "../utils/validators";

const GENDER_OPTIONS = ["male", "female", "non-binary", "prefer not to say"];

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
  { value: "", label: "Select level" },
  { value: "junior", label: "Junior (0-2 years)" },
  { value: "mid", label: "Mid-Level (2-5 years)" },
  { value: "senior", label: "Senior (5-10 years)" },
  { value: "lead", label: "Lead / Staff (10+ years)" },
];

const AVAILABILITY_OPTIONS = [
  { value: "", label: "Select availability" },
  { value: "open", label: "Open to chat" },
  { value: "busy", label: "Busy — slow responses" },
  { value: "weekends", label: "Available weekends only" },
  { value: "evenings", label: "Available evenings only" },
  { value: "not-available", label: "Not available right now" },
];

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [age, setAge] = useState(user?.age || "");
  const [about, setAbout] = useState(user?.about || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [skills, setSkills] = useState(user?.skills || []);
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || "");
  const [location, setLocation] = useState(user?.location || "");
  const [currentlyBuilding, setCurrentlyBuilding] = useState(user?.currentlyBuilding || "");
  const [availability, setAvailability] = useState(user?.availability || "");
  const [socialLinks, setSocialLinks] = useState(user?.socialLinks || { linkedin: "", twitter: "", website: "" });
  const [skillSearch, setSkillSearch] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);

  const dispatch = useDispatch();

  const validateForm = () => {
    const errors = {};
    const firstErr = validateFirstName(firstName);
    const lastErr = validateLastName(lastName);
    const ageErr = validateAge(age);
    const photoErr = validatePhotoUrl(photoUrl);
    const aboutErr = validateAbout(about);

    if (firstErr) errors.firstName = firstErr;
    if (lastErr) errors.lastName = lastErr;
    if (ageErr) errors.age = ageErr;
    if (photoErr) errors.photoUrl = photoErr;
    if (aboutErr) errors.about = aboutErr;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (serverError) setServerError("");
  };

  const handleSkillToggle = (skill) => {
    setSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : prev.length < 15
        ? [...prev, skill]
        : prev
    );
  };

  const handleCustomSkill = (e) => {
    if (e.key === "Enter" && skillSearch.trim()) {
      e.preventDefault();
      const custom = skillSearch.trim();
      if (!skills.includes(custom) && skills.length < 15) {
        setSkills([...skills, custom]);
      }
      setSkillSearch("");
    }
  };

  const filteredSkillOptions = SKILL_OPTIONS.filter(
    (s) =>
      s.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !skills.includes(s)
  );

  const saveProfile = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validateForm()) return;

    setSaving(true);
    try {
      const res = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: age ? Number(age) : undefined,
        about: about.trim(),
        photoUrl: photoUrl.trim(),
        gender,
        skills,
        experienceLevel,
        location: location.trim(),
        currentlyBuilding: currentlyBuilding.trim(),
        availability,
        socialLinks: {
          linkedin: socialLinks.linkedin.trim(),
          twitter: socialLinks.twitter.trim(),
          website: socialLinks.website.trim(),
        },
      });
      dispatch(addUser(res.data.data));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row justify-center items-start my-10 gap-8 px-4">
        {/* Edit Form */}
        <div className="card bg-base-300 w-full max-w-lg shadow-xl">
          <form className="card-body" onSubmit={saveProfile} noValidate>
            <h2 className="card-title text-2xl font-bold justify-center">
              Edit Profile
            </h2>

            {/* First Name */}
            <div className="form-control">
              <label className="label" htmlFor="edit-firstName">
                <span className="label-text">First Name</span>
              </label>
              <input
                id="edit-firstName"
                type="text"
                value={firstName}
                className={`input input-bordered w-full ${fieldErrors.firstName ? "input-error" : ""}`}
                onChange={handleFieldChange(setFirstName, "firstName")}
                aria-invalid={!!fieldErrors.firstName}
                aria-describedby={fieldErrors.firstName ? "edit-firstName-error" : undefined}
              />
              {fieldErrors.firstName && (
                <span id="edit-firstName-error" className="text-error text-xs mt-1">
                  {fieldErrors.firstName}
                </span>
              )}
            </div>

            {/* Last Name */}
            <div className="form-control">
              <label className="label" htmlFor="edit-lastName">
                <span className="label-text">Last Name</span>
              </label>
              <input
                id="edit-lastName"
                type="text"
                value={lastName}
                className={`input input-bordered w-full ${fieldErrors.lastName ? "input-error" : ""}`}
                onChange={handleFieldChange(setLastName, "lastName")}
                aria-invalid={!!fieldErrors.lastName}
                aria-describedby={fieldErrors.lastName ? "edit-lastName-error" : undefined}
              />
              {fieldErrors.lastName && (
                <span id="edit-lastName-error" className="text-error text-xs mt-1">
                  {fieldErrors.lastName}
                </span>
              )}
            </div>

            {/* Age */}
            <div className="form-control">
              <label className="label" htmlFor="edit-age">
                <span className="label-text">Age</span>
              </label>
              <input
                id="edit-age"
                type="number"
                min="18"
                max="100"
                value={age}
                className={`input input-bordered w-full ${fieldErrors.age ? "input-error" : ""}`}
                onChange={handleFieldChange(setAge, "age")}
                placeholder="e.g. 25"
                aria-invalid={!!fieldErrors.age}
                aria-describedby={fieldErrors.age ? "edit-age-error" : undefined}
              />
              {fieldErrors.age && (
                <span id="edit-age-error" className="text-error text-xs mt-1">
                  {fieldErrors.age}
                </span>
              )}
            </div>

            {/* Gender */}
            <div className="form-control">
              <label className="label" htmlFor="edit-gender">
                <span className="label-text">Gender</span>
              </label>
              <select
                id="edit-gender"
                value={gender}
                className="select select-bordered w-full"
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="" disabled>Select gender</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="form-control">
              <label className="label" htmlFor="edit-location">
                <span className="label-text">Location</span>
              </label>
              <input
                id="edit-location"
                type="text"
                value={location}
                className="input input-bordered w-full"
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, Remote, India"
              />
            </div>

            {/* Experience Level */}
            <div className="form-control">
              <label className="label" htmlFor="edit-experience">
                <span className="label-text">Experience Level</span>
              </label>
              <select
                id="edit-experience"
                value={experienceLevel}
                className="select select-bordered w-full"
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value} disabled={level.value === ""}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Photo URL */}
            <div className="form-control">
              <label className="label" htmlFor="edit-photoUrl">
                <span className="label-text">Photo URL</span>
              </label>
              <input
                id="edit-photoUrl"
                type="url"
                value={photoUrl}
                className={`input input-bordered w-full ${fieldErrors.photoUrl ? "input-error" : ""}`}
                onChange={handleFieldChange(setPhotoUrl, "photoUrl")}
                placeholder="https://example.com/photo.jpg"
                aria-invalid={!!fieldErrors.photoUrl}
                aria-describedby={fieldErrors.photoUrl ? "edit-photoUrl-error" : undefined}
              />
              {fieldErrors.photoUrl && (
                <span id="edit-photoUrl-error" className="text-error text-xs mt-1">
                  {fieldErrors.photoUrl}
                </span>
              )}
            </div>

            {/* About */}
            <div className="form-control">
              <label className="label" htmlFor="edit-about">
                <span className="label-text">
                  About <span className="text-xs opacity-60">({about.length}/300)</span>
                </span>
              </label>
              <textarea
                id="edit-about"
                value={about}
                maxLength={300}
                className={`textarea textarea-bordered w-full ${fieldErrors.about ? "textarea-error" : ""}`}
                onChange={handleFieldChange(setAbout, "about")}
                placeholder="Tell others about yourself..."
                rows={3}
                aria-invalid={!!fieldErrors.about}
                aria-describedby={fieldErrors.about ? "edit-about-error" : undefined}
              />
              {fieldErrors.about && (
                <span id="edit-about-error" className="text-error text-xs mt-1">
                  {fieldErrors.about}
                </span>
              )}
            </div>

            {/* ===== CURRENTLY BUILDING ===== */}
            <div className="form-control">
              <label className="label" htmlFor="edit-building">
                <span className="label-text">
                  🔨 Currently Building{" "}
                  <span className="text-xs opacity-60">({currentlyBuilding.length}/100)</span>
                </span>
              </label>
              <input
                id="edit-building"
                type="text"
                value={currentlyBuilding}
                maxLength={100}
                className="input input-bordered w-full"
                onChange={(e) => setCurrentlyBuilding(e.target.value)}
                placeholder="e.g. A real-time collaboration tool for developers"
              />
            </div>

            {/* ===== AVAILABILITY ===== */}
            <div className="form-control">
              <label className="label" htmlFor="edit-availability">
                <span className="label-text">🕐 Availability</span>
              </label>
              <select
                id="edit-availability"
                value={availability}
                className="select select-bordered w-full"
                onChange={(e) => setAvailability(e.target.value)}
              >
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.value === ""}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ===== SOCIAL LINKS ===== */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">🔗 Social & Portfolio Links</span>
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-60 w-20">LinkedIn</span>
                  <input
                    type="url"
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="input input-bordered input-sm flex-1"
                    aria-label="LinkedIn profile URL"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-60 w-20">Twitter/X</span>
                  <input
                    type="url"
                    value={socialLinks.twitter}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    placeholder="https://twitter.com/username"
                    className="input input-bordered input-sm flex-1"
                    aria-label="Twitter profile URL"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-60 w-20">Website</span>
                  <input
                    type="url"
                    value={socialLinks.website}
                    onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="input input-bordered input-sm flex-1"
                    aria-label="Personal website URL"
                  />
                </div>
              </div>
            </div>

            {/* ===== TECH STACK / SKILLS ===== */}
            <div className="form-control">
              <label className="label" htmlFor="edit-skills-search">
                <span className="label-text">
                  Tech Stack{" "}
                  <span className="text-xs opacity-60">({skills.length}/15 selected)</span>
                </span>
              </label>

              {/* Selected Skills */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="badge badge-primary gap-1 cursor-pointer hover:badge-error transition-colors"
                      onClick={() => handleSkillToggle(skill)}
                      role="button"
                      aria-label={`Remove ${skill}`}
                    >
                      {skill}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  ))}
                </div>
              )}

              {/* Search + Add Custom */}
              <input
                id="edit-skills-search"
                type="text"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                onKeyDown={handleCustomSkill}
                placeholder="Search skills or type custom + Enter..."
                className="input input-bordered input-sm w-full"
              />

              {/* Skill Options (filtered) */}
              <div className="flex flex-wrap gap-1.5 mt-2 max-h-32 overflow-y-auto">
                {filteredSkillOptions.slice(0, 20).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    className="badge badge-outline badge-sm cursor-pointer hover:badge-primary transition-colors"
                    disabled={skills.length >= 15}
                    aria-label={`Add ${skill}`}
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="alert alert-error mt-2 py-2">
                <span>{serverError}</span>
              </div>
            )}

            {/* Submit */}
            <div className="form-control mt-4">
              <button
                type="submit"
                className="btn btn-primary text-lg font-bold w-full"
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Save Profile"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview */}
        <div className="hidden lg:block sticky top-20">
          <p className="text-center text-sm opacity-60 mb-2">Live Preview</p>
          <UserCard
            user={{ firstName, lastName, age, photoUrl, gender, about, skills }}
          />
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success">
            <span>Profile saved successfully!</span>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfile;
