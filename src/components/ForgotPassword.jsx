import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api, { getErrorMessage } from "../services/api";
import { validateEmail } from "../utils/validators";

/**
 * ForgotPassword — Email-based password reset flow.
 *
 * Step 1: Enter email → sends reset token to backend
 * Step 2: Enter token + new password → resets password
 * Step 3: Success → redirect to login
 */
const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: token+password, 3: success
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");

    const emailErr = validateEmail(email);
    if (emailErr) {
      setFieldErrors({ email: emailErr });
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setStep(2);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    const errors = {};

    if (!resetToken.trim()) errors.token = "Reset token is required";
    if (!newPassword) errors.password = "New password is required";
    else if (newPassword.length < 6) errors.password = "Password must be at least 6 characters";
    if (newPassword !== confirmPassword) errors.confirm = "Passwords do not match";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        email,
        token: resetToken.trim(),
        newPassword,
      });
      setStep(3);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center my-10 px-4">
      <motion.div
        className="card bg-base-300 w-full max-w-md shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="card-body">
          {/* Step 1: Request Reset */}
          {step === 1 && (
            <form onSubmit={handleRequestReset} noValidate>
              <h2 className="card-title text-2xl font-bold justify-center mb-2">
                Forgot Password?
              </h2>
              <p className="text-sm text-center opacity-60 mb-6">
                Enter your email and we'll send you a reset code.
              </p>

              <div className="form-control">
                <label className="label" htmlFor="fp-email">
                  <span className="label-text">Email</span>
                </label>
                <input
                  id="fp-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors({}); setError(""); }}
                  placeholder="you@example.com"
                  className={`input input-bordered w-full ${fieldErrors.email ? "input-error" : ""}`}
                  autoComplete="email"
                />
                {fieldErrors.email && (
                  <span className="text-error text-xs mt-1">{fieldErrors.email}</span>
                )}
              </div>

              {error && <div className="alert alert-error mt-3 py-2 text-sm"><span>{error}</span></div>}

              <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
                {loading ? <span className="loading loading-spinner loading-sm" /> : "Send Reset Code"}
              </button>

              <Link to="/login" className="text-sm text-center block mt-4 opacity-60 hover:opacity-100">
                ← Back to Login
              </Link>
            </form>
          )}

          {/* Step 2: Enter Token + New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} noValidate>
              <h2 className="card-title text-2xl font-bold justify-center mb-2">
                Reset Password
              </h2>
              <p className="text-sm text-center opacity-60 mb-6">
                Check your email for the 6-digit reset code.
              </p>

              <div className="form-control">
                <label className="label" htmlFor="fp-token">
                  <span className="label-text">Reset Code</span>
                </label>
                <input
                  id="fp-token"
                  type="text"
                  value={resetToken}
                  onChange={(e) => { setResetToken(e.target.value); setFieldErrors({}); }}
                  placeholder="Enter 6-digit code"
                  className={`input input-bordered w-full text-center tracking-widest text-lg ${fieldErrors.token ? "input-error" : ""}`}
                  maxLength={6}
                  autoComplete="one-time-code"
                />
                {fieldErrors.token && <span className="text-error text-xs mt-1">{fieldErrors.token}</span>}
              </div>

              <div className="form-control mt-3">
                <label className="label" htmlFor="fp-password">
                  <span className="label-text">New Password</span>
                </label>
                <input
                  id="fp-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setFieldErrors({}); }}
                  placeholder="At least 6 characters"
                  className={`input input-bordered w-full ${fieldErrors.password ? "input-error" : ""}`}
                  autoComplete="new-password"
                />
                {fieldErrors.password && <span className="text-error text-xs mt-1">{fieldErrors.password}</span>}
              </div>

              <div className="form-control mt-3">
                <label className="label" htmlFor="fp-confirm">
                  <span className="label-text">Confirm Password</span>
                </label>
                <input
                  id="fp-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors({}); }}
                  placeholder="Re-enter password"
                  className={`input input-bordered w-full ${fieldErrors.confirm ? "input-error" : ""}`}
                  autoComplete="new-password"
                />
                {fieldErrors.confirm && <span className="text-error text-xs mt-1">{fieldErrors.confirm}</span>}
              </div>

              {error && <div className="alert alert-error mt-3 py-2 text-sm"><span>{error}</span></div>}

              <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
                {loading ? <span className="loading loading-spinner loading-sm" /> : "Reset Password"}
              </button>

              <button type="button" onClick={() => setStep(1)} className="btn btn-ghost btn-sm w-full mt-2">
                ← Back
              </button>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-6">
              <motion.div
                className="text-6xl mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                ✅
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Password Reset!</h2>
              <p className="text-sm opacity-60 mb-6">
                Your password has been updated successfully. You can now log in with your new password.
              </p>
              <Link to="/login" className="btn btn-primary">
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
