import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateProfile, getErrorMessage } from "../services/api";
import { addUser } from "../utils/userSlice";
import { validatePhotoUrl, validateAbout } from "../utils/validators";

const STEPS = [
  { key: "welcome", title: "Welcome to DevTinder!" },
  { key: "photo", title: "Add a Profile Photo" },
  { key: "about", title: "Tell Us About Yourself" },
  { key: "skills", title: "What's Your Tech Stack?" },
  { key: "done", title: "You're All Set!" },
];

const SKILL_OPTIONS = [
  "JavaScript", "TypeScript", "React", "Angular", "Vue",
  "Node.js", "Python", "Java", "Go", "Rust",
  "C++", "C#", "Ruby", "PHP", "Swift",
  "Kotlin", "Docker", "Kubernetes", "AWS", "MongoDB",
  "PostgreSQL", "GraphQL", "Next.js", "Tailwind CSS", "Git",
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [photoUrl, setPhotoUrl] = useState("");
  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentStep = STEPS[step];
  const totalSteps = STEPS.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const nextStep = () => {
    if (step < totalSteps - 1) {
      setError("");
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setError("");
      setStep(step - 1);
    }
  };

  const handleSkillToggle = (skill) => {
    setSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : prev.length < 10
        ? [...prev, skill]
        : prev
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    setError("");
    try {
      const profileData = {};
      if (photoUrl.trim()) profileData.photoUrl = photoUrl.trim();
      if (about.trim()) profileData.about = about.trim();
      if (skills.length > 0) profileData.skills = skills;

      // Only update if user provided something
      if (Object.keys(profileData).length > 0) {
        const res = await updateProfile(profileData);
        dispatch(addUser(res.data.data));
      }
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoNext = () => {
    if (photoUrl.trim()) {
      const err = validatePhotoUrl(photoUrl);
      if (err) {
        setError(err);
        return;
      }
    }
    nextStep();
  };

  const handleAboutNext = () => {
    if (about.trim()) {
      const err = validateAbout(about);
      if (err) {
        setError(err);
        return;
      }
    }
    nextStep();
  };

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-300 to-base-100">
      <div className="card bg-base-200 w-full max-w-lg shadow-2xl">
        <div className="card-body">
          {/* Progress Bar */}
          <div className="w-full bg-base-300 rounded-full h-2 mb-6">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step Counter */}
          <p className="text-xs text-base-content/50 text-center mb-2">
            Step {step + 1} of {totalSteps}
          </p>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.key}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="min-h-[280px] flex flex-col"
            >
              {/* Step 1: Welcome */}
              {step === 0 && (
                <div className="flex flex-col items-center justify-center flex-1 text-center gap-4">
                  <motion.div
                    className="text-6xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                  >
                    👩‍💻
                  </motion.div>
                  <h2 className="text-2xl font-bold">{currentStep.title}</h2>
                  <p className="text-base-content/70 max-w-sm">
                    Let&apos;s set up your profile so other developers can find
                    you. This will only take a minute!
                  </p>
                  <button
                    onClick={nextStep}
                    className="btn btn-primary mt-4"
                  >
                    Get Started
                  </button>
                </div>
              )}

              {/* Step 2: Photo URL */}
              {step === 1 && (
                <div className="flex flex-col flex-1 gap-4">
                  <h2 className="text-xl font-bold text-center">
                    {currentStep.title}
                  </h2>
                  <p className="text-sm text-base-content/60 text-center">
                    A profile photo helps others recognize you. Paste a URL to your photo.
                  </p>

                  <div className="form-control">
                    <label className="label" htmlFor="onboard-photo">
                      <span className="label-text">Photo URL</span>
                    </label>
                    <input
                      id="onboard-photo"
                      type="url"
                      value={photoUrl}
                      onChange={(e) => {
                        setPhotoUrl(e.target.value);
                        setError("");
                      }}
                      placeholder="https://example.com/your-photo.jpg"
                      className={`input input-bordered w-full ${error ? "input-error" : ""}`}
                    />
                    {error && <span className="text-error text-xs mt-1">{error}</span>}
                  </div>

                  {/* Preview */}
                  {photoUrl && !error && (
                    <div className="flex justify-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-primary ring-offset-2 ring-offset-base-200">
                        <img
                          src={photoUrl}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-auto pt-4">
                    <button onClick={prevStep} className="btn btn-ghost btn-sm">
                      Back
                    </button>
                    <div className="flex gap-2">
                      <button onClick={nextStep} className="btn btn-ghost btn-sm">
                        Skip
                      </button>
                      <button onClick={handlePhotoNext} className="btn btn-primary btn-sm">
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: About */}
              {step === 2 && (
                <div className="flex flex-col flex-1 gap-4">
                  <h2 className="text-xl font-bold text-center">
                    {currentStep.title}
                  </h2>
                  <p className="text-sm text-base-content/60 text-center">
                    Write a short bio. What are you working on? What excites you?
                  </p>

                  <div className="form-control">
                    <label className="label" htmlFor="onboard-about">
                      <span className="label-text">
                        About You{" "}
                        <span className="text-xs opacity-60">({about.length}/300)</span>
                      </span>
                    </label>
                    <textarea
                      id="onboard-about"
                      value={about}
                      maxLength={300}
                      onChange={(e) => {
                        setAbout(e.target.value);
                        setError("");
                      }}
                      placeholder="Full-stack dev passionate about open source. Currently building a real-time collaboration tool..."
                      className={`textarea textarea-bordered w-full h-28 ${error ? "textarea-error" : ""}`}
                    />
                    {error && <span className="text-error text-xs mt-1">{error}</span>}
                  </div>

                  <div className="flex justify-between mt-auto pt-4">
                    <button onClick={prevStep} className="btn btn-ghost btn-sm">
                      Back
                    </button>
                    <div className="flex gap-2">
                      <button onClick={nextStep} className="btn btn-ghost btn-sm">
                        Skip
                      </button>
                      <button onClick={handleAboutNext} className="btn btn-primary btn-sm">
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Skills */}
              {step === 3 && (
                <div className="flex flex-col flex-1 gap-4">
                  <h2 className="text-xl font-bold text-center">
                    {currentStep.title}
                  </h2>
                  <p className="text-sm text-base-content/60 text-center">
                    Select up to 10 technologies you work with.
                    <span className="font-medium"> ({skills.length}/10 selected)</span>
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center max-h-48 overflow-y-auto py-2">
                    {SKILL_OPTIONS.map((skill) => {
                      const isSelected = skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleSkillToggle(skill)}
                          className={`badge badge-lg cursor-pointer transition-all ${
                            isSelected
                              ? "badge-primary"
                              : "badge-outline hover:badge-primary hover:badge-outline"
                          }`}
                          aria-pressed={isSelected}
                          aria-label={`${skill} ${isSelected ? "selected" : "not selected"}`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between mt-auto pt-4">
                    <button onClick={prevStep} className="btn btn-ghost btn-sm">
                      Back
                    </button>
                    <div className="flex gap-2">
                      <button onClick={nextStep} className="btn btn-ghost btn-sm">
                        Skip
                      </button>
                      <button onClick={nextStep} className="btn btn-primary btn-sm">
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Done */}
              {step === 4 && (
                <div className="flex flex-col items-center justify-center flex-1 text-center gap-4">
                  <motion.div
                    className="text-6xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    🎉
                  </motion.div>
                  <h2 className="text-2xl font-bold">{currentStep.title}</h2>
                  <p className="text-base-content/70 max-w-sm">
                    Your profile is ready. Start swiping to find developers
                    who share your interests!
                  </p>

                  {/* Summary */}
                  <div className="text-sm text-left w-full max-w-xs space-y-1 bg-base-300 rounded-lg p-3">
                    <p>
                      <span className="opacity-60">Photo:</span>{" "}
                      {photoUrl ? "✅ Added" : "⏭️ Skipped"}
                    </p>
                    <p>
                      <span className="opacity-60">About:</span>{" "}
                      {about ? "✅ Added" : "⏭️ Skipped"}
                    </p>
                    <p>
                      <span className="opacity-60">Skills:</span>{" "}
                      {skills.length > 0
                        ? `✅ ${skills.length} selected`
                        : "⏭️ Skipped"}
                    </p>
                  </div>

                  {error && (
                    <div className="alert alert-error py-2 text-sm">
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex gap-3 mt-2">
                    <button onClick={prevStep} className="btn btn-ghost btn-sm">
                      Back
                    </button>
                    <button
                      onClick={handleFinish}
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <span className="loading loading-spinner loading-sm" />
                      ) : (
                        "Start Swiping!"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
