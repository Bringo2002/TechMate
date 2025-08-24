// src/utils/validateForm.ts
export const validateEmail = (email: string): string | null => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? null : 'Invalid email address.';
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
};

export const validateSignup = (formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): string | null => {
  if (!formData.name.trim()) return 'Name is required.';
  const emailError = validateEmail(formData.email);
  if (emailError) return emailError;
  const passwordError = validatePassword(formData.password);
  if (passwordError) return passwordError;
  if (formData.password !== formData.confirmPassword)
    return 'Passwords do not match.';
  return null;
};
