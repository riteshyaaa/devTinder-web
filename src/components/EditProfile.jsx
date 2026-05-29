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

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [age, setAge] = useState(user?.age || "");
  const [about, setAbout] = useState(user?.about || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  const [gender, setGender] = useState(user?.gender || "");
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
        <div className="card bg-base-300 w-full max-w-md shadow-xl">
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

            {/* Gender - Dropdown */}
            <div className="form-control">
              <label className="label" htmlFor="edit-gender">
                <span className="label-text">Gender</span>
              </label>
              <select
                id="edit-gender"
                value={gender}
                className="select select-bordered w-full"
                onChange={(e) => setGender(e.target.value)}
                aria-label="Select your gender"
              >
                <option value="" disabled>
                  Select gender
                </option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
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
                  About{" "}
                  <span className="text-xs opacity-60">
                    ({about.length}/300)
                  </span>
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
        <div className="hidden lg:block">
          <p className="text-center text-sm opacity-60 mb-2">Live Preview</p>
          <UserCard
            user={{ firstName, lastName, age, photoUrl, gender, about }}
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
