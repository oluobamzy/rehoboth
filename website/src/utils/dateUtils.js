// Date formatting utilities

/**
 * Format a date string or Date object to a readable date format
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date (e.g., "Monday, January 1, 2024")
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format a date string or Date object to a short date format
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted short date (e.g., "Jan 1, 2024")
 */
export function formatShortDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const options = { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  };
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format a date string or Date object to display time
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted time (e.g., "7:30 PM")
 */
export function formatTime(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const options = { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  };
  
  return date.toLocaleTimeString('en-US', options);
}

/**
 * Format a date string or Date object to display both date and time
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date and time (e.g., "Jan 1, 2024 at 7:30 PM")
 */
export function formatDateTime(dateString) {
  if (!dateString) return '';
  
  return `${formatShortDate(dateString)} at ${formatTime(dateString)}`;
}

/**
 * Calculate the difference between two dates in days
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {number} Days between dates
 */
export function daysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if a date is in the past
 * @param {string|Date} dateString - Date to check
 * @returns {boolean} True if date is in the past
 */
export function isPastDate(dateString) {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  
  return date < now;
}

/**
 * Check if a date is today
 * @param {string|Date} dateString - Date to check
 * @returns {boolean} True if date is today
 */
export function isToday(dateString) {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  
  return date.toDateString() === now.toDateString();
}

/**
 * Get a relative time description (e.g., "2 days ago", "in 3 days")
 * @param {string|Date} dateString - Date to format
 * @returns {string} Relative time description
 */
export function getRelativeTimeDescription(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  
  const diffTime = date - now;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  return `In ${diffDays} days`;
}
