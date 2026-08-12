/**
 * Utility Helpers
 * Formatters and helper functions used across the application.
 */

/**
 * Format a number as Indian Rupee currency.
 * @param {number} amount - The amount to format.
 * @returns {string} Formatted currency string.
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Safely extract an image or document URL regardless of whether input is a Cloudinary object,
 * string path, or null/undefined. Guarantees no runtime type errors.
 * @param {string|object} img
 * @returns {string|null}
 */
export const getImgUrl = (img) => {
  if (!img) return null;
  const url = typeof img === 'object' ? (img?.url || img?.path) : img;
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('uploads/') || url.startsWith('uploads\\')) return `/${url.replace(/\\/g, '/')}`;
  if (!url.startsWith('#')) return `/uploads/images/${url.replace(/\\/g, '/')}`;
  return null;
};

/**
 * Truncate a wallet address or tx hash for display.
 * @param {string} addr
 * @returns {string}
 */
export const truncateAddress = (addr) => {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

/**
 * Format a price smartly (Crores, Lakhs, or native formatting).
 * @param {number} amount
 * @returns {string}
 */
export const formatPrice = (amount) => {
  if (amount == null) return '₹0';
  const num = Number(amount);
  if (isNaN(num)) return '₹0';
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(1)}L`;
  return `₹${num.toLocaleString('en-IN')}`;
};

/**
 * Format a date string into a readable format.
 * @param {string} dateStr - ISO date string.
 * @returns {string} Formatted date.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Return Tailwind classes for a property status badge.
 * @param {string} status - One of: verified, pending, rejected, transfer.
 * @returns {{ bg: string, text: string, label: string }}
 */
export const getStatusConfig = (status) => {
  const map = {
    verified: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Verified', dot: 'bg-emerald-400' },
    pending:  { bg: 'bg-amber-500/20',   text: 'text-amber-400',   label: 'Pending',  dot: 'bg-amber-400' },
    rejected: { bg: 'bg-red-500/20',     text: 'text-red-400',     label: 'Rejected', dot: 'bg-red-400' },
    transfer: { bg: 'bg-blue-500/20',    text: 'text-blue-400',    label: 'Transfer in Progress', dot: 'bg-blue-400' },
  };
  return map[status] || map.pending;
};

/**
 * Truncate text to a given length.
 * @param {string} text - The text to truncate.
 * @param {number} maxLen - Maximum character length.
 * @returns {string}
 */
export const truncateText = (text, maxLen = 100) => {
  if (!text || text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '…';
};

/**
 * Generate a CSS gradient string from a color hex for property card placeholders.
 * @param {string} color - Base hex color.
 * @returns {string} CSS linear-gradient value.
 */
export const generateGradient = (color) => {
  return `linear-gradient(135deg, ${color}CC, ${color}66)`;
};
