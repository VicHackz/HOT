export const theme = {
  colors: {
    primary: '#51504C', // Jakobsdals deep green
    primaryLight: '#6a6965',
    primaryDark: '#3a3936',

    // Status colors
    pending: '#f59e0b', // Yellow/Amber
    approved: '#10b981', // Green
    archived: '#6b7280', // Gray

    // UI colors
    background: '#ffffff',
    backgroundAlt: '#f9fafb',
    border: '#e5e7eb',
    text: '#111827',
    textMuted: '#6b7280',
    error: '#ef4444',
    success: '#10b981',
  },

  fonts: {
    primary: '"Spartan", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },

  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
} as const;
