// src/utils/cookies.js

/**
 * Sets a cookie in the document.
 * @param {string} name - Name of the cookie
 * @param {string} value - Value of the cookie
 * @param {number} [days] - Expiration time in days (optional)
 */
export const setCookie = (name, value, days) => {
  if (value === null || value === undefined) {
    sessionStorage.removeItem(name);
  } else {
    sessionStorage.setItem(name, value);
  }
};

/**
 * Retrieves a cookie value by name.
 * @param {string} name - Name of the cookie
 * @returns {string|null} - Cookie value or null if not found
 */
export const getCookie = (name) => {
  return sessionStorage.getItem(name);
};

/**
 * Deletes a cookie by name.
 * @param {string} name - Name of the cookie
 */
export const eraseCookie = (name) => {
  sessionStorage.removeItem(name);
};
