/**
 * Form validation utilities.
 * Each validator returns an error message string or empty string if valid.
 */

export const validateEmail = (email) => {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return "";
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  if (password.length > 50) return "Password must be less than 50 characters";
  return "";
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return "";
};

export const validateFirstName = (name) => {
  if (!name.trim()) return "First name is required";
  if (name.trim().length < 2) return "First name must be at least 2 characters";
  if (name.trim().length > 30) return "First name must be less than 30 characters";
  return "";
};

export const validateLastName = (name) => {
  if (!name.trim()) return "Last name is required";
  if (name.trim().length < 2) return "Last name must be at least 2 characters";
  if (name.trim().length > 30) return "Last name must be less than 30 characters";
  return "";
};

export const validateAge = (age) => {
  if (!age && age !== 0) return "";
  const num = Number(age);
  if (isNaN(num)) return "Age must be a number";
  if (!Number.isInteger(num)) return "Age must be a whole number";
  if (num < 18) return "You must be at least 18 years old";
  if (num > 100) return "Please enter a valid age";
  return "";
};

export const validatePhotoUrl = (url) => {
  if (!url.trim()) return "";
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "URL must start with http:// or https://";
    }
    return "";
  } catch {
    return "Please enter a valid URL";
  }
};

export const validateAbout = (about) => {
  if (about && about.length > 300) return "About must be less than 300 characters";
  return "";
};

/**
 * Run multiple field validations at once.
 * @param {Object} fields - { fieldName: { value, validator, ...args } }
 * @returns {Object} errors - { fieldName: errorMessage }
 */
export const validateForm = (validations) => {
  const errors = {};
  for (const [field, { value, validator, args = [] }] of Object.entries(validations)) {
    const error = validator(value, ...args);
    if (error) errors[field] = error;
  }
  return errors;
};
