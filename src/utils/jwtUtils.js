// src/utils/jwtUtils.js

/**
 * Decode JWT token without verification (client-side)
 * Note: This only decodes the token, it doesn't verify it
 * @param {string} token - JWT token
 * @returns {object|null} Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    // JWT has 3 parts separated by dots: header.payload.signature
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      console.error('Invalid JWT token format');
      return null;
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    
    // Base64 decode
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    // Parse JSON
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Get user ID from JWT token
 * @param {string} token - JWT token
 * @returns {string|null} User ID or null if not found
 */
export const getUserIdFromToken = (token) => {
  const decoded = decodeToken(token);
  
  if (!decoded) return null;
  
  // Common JWT payload fields for user ID
  // Adjust based on your backend's JWT structure
  return decoded.id || decoded.userId || decoded.sub || decoded._id || null;
};

/**
 * Get user data from JWT token
 * @param {string} token - JWT token
 * @returns {object|null} User data or null if not found
 */
export const getUserDataFromToken = (token) => {
  return decodeToken(token);
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired, false otherwise
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  
  if (!decoded || !decoded.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  return Date.now() >= expirationTime;
};

/**
 * Get token from localStorage
 * @returns {string|null} Token or null if not found
 */
export const getTokenFromStorage = () => {
  try {
    // Adjust the key name based on how you store the token
    return localStorage.getItem('token') || localStorage.getItem('authToken') || null;
  } catch (error) {
    console.error('Error getting token from storage:', error);
    return null;
  }
};

/**
 * Get token from cookies
 * @param {string} cookieName - Name of the cookie
 * @returns {string|null} Token or null if not found
 */
export const getTokenFromCookie = (cookieName = 'token') => {
  try {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${cookieName}=`)
    );
    
    if (!tokenCookie) return null;
    
    return tokenCookie.split('=')[1];
  } catch (error) {
    console.error('Error getting token from cookie:', error);
    return null;
  }
};

/**
 * Get current user ID from stored token
 * @returns {string|null} User ID or null if not found
 */
export const getCurrentUserId = () => {
  // Try localStorage first
  let token = getTokenFromStorage();
  
  // If not in localStorage, try cookies
  if (!token) {
    token = getTokenFromCookie();
  }
  
  if (!token) {
    console.warn('No token found in storage or cookies');
    return null;
  }
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    console.warn('Token is expired');
    return null;
  }
  
  return getUserIdFromToken(token);
};