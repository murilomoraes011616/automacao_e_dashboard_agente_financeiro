export const SITE_CONFIG = {
  SITE_URL: import.meta.env.VITE_SITE_URL || window.location.origin,
  SUPABASE_REDIRECT_URL: `${import.meta.env.VITE_SITE_URL || window.location.origin}/auth`,
  EMAIL_CONFIRMATION_URL: `${import.meta.env.VITE_SITE_URL || window.location.origin}/confirm-email`,
} as const;

export const getSiteUrl = () => {
  return import.meta.env.VITE_SITE_URL || window.location.origin;
};

export const getSupabaseRedirectUrl = () => {
  return `${getSiteUrl()}/auth`;
};

export const getEmailConfirmationUrl = () => {
  return `${getSiteUrl()}/confirm-email`;
};