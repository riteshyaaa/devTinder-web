import { useState } from "react";
import useAuth from "../hooks/useAuth";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateFirstName,
  validateLastName,
} from "../utils/validators";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const { login, signUp, loading, error, clearError } = useAuth();

  const validateLoginForm = () => {
    const errors = {};
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (emailErr) errors.email = emailErr;
    if (passErr) errors.password = passErr;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignUpForm = () => {
    const errors = {};
    const firstErr = validateFirstName(firstName);
    const lastErr = validateLastName(lastName);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(password, confirmPassword);
    if (firstErr) errors.firstName = firstErr;
    if (lastErr) errors.lastName = lastErr;
    if (emailErr) errors.email = emailErr;
    if (passErr) errors.password = passErr;
    if (confirmErr) errors.confirmPassword = confirmErr;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearError();
    if (isLogin) {
      if (!validateLoginForm()) return;
      login(email, password);
    } else {
      if (!validateSignUpForm()) return;
      signUp({ firstName, lastName, email, password });
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFieldErrors({});
    clearError();
  };

  // Clear field error on change
  const handleFieldChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="flex justify-center my-10">
      <div className="card bg-base-300 w-full max-w-md shadow-xl">
        <form className="card-body" onSubmit={handleSubmit} noValidate>
          <h2 className="card-title text-2xl font-bold justify-center">
            {isLogin ? "Log In" : "Sign Up"}
          </h2>

          {!isLogin && (
            <>
              <div className="form-control">
                <label className="label" htmlFor="firstName">
                  <span className="label-text">First Name</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  className={`input input-bordered w-full ${fieldErrors.firstName ? "input-error" : ""}`}
                  onChange={handleFieldChange(setFirstName, "firstName")}
                  placeholder="John"
                  aria-invalid={!!fieldErrors.firstName}
                  aria-describedby={fieldErrors.firstName ? "firstName-error" : undefined}
                />
                {fieldErrors.firstName && (
                  <span id="firstName-error" className="text-error text-xs mt-1">
                    {fieldErrors.firstName}
                  </span>
                )}
              </div>

              <div className="form-control">
                <label className="label" htmlFor="lastName">
                  <span className="label-text">Last Name</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  className={`input input-bordered w-full ${fieldErrors.lastName ? "input-error" : ""}`}
                  onChange={handleFieldChange(setLastName, "lastName")}
                  placeholder="Doe"
                  aria-invalid={!!fieldErrors.lastName}
                  aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}
                />
                {fieldErrors.lastName && (
                  <span id="lastName-error" className="text-error text-xs mt-1">
                    {fieldErrors.lastName}
                  </span>
                )}
              </div>
            </>
          )}

          <div className="form-control">
            <label className="label" htmlFor="email">
              <span className="label-text">Email</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              className={`input input-bordered w-full ${fieldErrors.email ? "input-error" : ""}`}
              onChange={handleFieldChange(setEmail, "email")}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
            {fieldErrors.email && (
              <span id="email-error" className="text-error text-xs mt-1">
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className="form-control">
            <label className="label" htmlFor="password">
              <span className="label-text">Password</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              className={`input input-bordered w-full ${fieldErrors.password ? "input-error" : ""}`}
              onChange={handleFieldChange(setPassword, "password")}
              placeholder="At least 6 characters"
              autoComplete={isLogin ? "current-password" : "new-password"}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            {fieldErrors.password && (
              <span id="password-error" className="text-error text-xs mt-1">
                {fieldErrors.password}
              </span>
            )}
          </div>

          {!isLogin && (
            <div className="form-control">
              <label className="label" htmlFor="confirmPassword">
                <span className="label-text">Confirm Password</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                className={`input input-bordered w-full ${fieldErrors.confirmPassword ? "input-error" : ""}`}
                onChange={handleFieldChange(setConfirmPassword, "confirmPassword")}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.confirmPassword}
                aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
              />
              {fieldErrors.confirmPassword && (
                <span id="confirmPassword-error" className="text-error text-xs mt-1">
                  {fieldErrors.confirmPassword}
                </span>
              )}
            </div>
          )}

          {error && (
            <div className="alert alert-error mt-2 py-2">
              <span>{error}</span>
            </div>
          )}

          <div className="form-control mt-4">
            <button
              type="submit"
              className="btn btn-primary text-lg font-bold w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : isLogin ? (
                "Log In"
              ) : (
                "Sign Up"
              )}
            </button>
          </div>

          <p
            className="text-center text-sm mt-3 cursor-pointer hover:underline"
            onClick={toggleMode}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && toggleMode()}
          >
            {isLogin
              ? "New here? Create an account"
              : "Already have an account? Log in"}
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
