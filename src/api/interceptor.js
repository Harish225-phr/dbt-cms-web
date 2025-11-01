import { STATUS_CODES, APP_STATUS_CODES } from "./statuscode";

// Create standard headers
export const createHeaders = async (customHeaders = {}) => {
  const token = sessionStorage.getItem('token');
  const tokenType = sessionStorage.getItem('tokenType') || 'Bearer';

  return {
    // allow callers to override/add custom headers
    ...customHeaders,
    'Authorization': token ? `${tokenType} ${token}` : '',
    'Content-Type': customHeaders['Content-Type'] || 'application/json',
    'X-channel-Id': customHeaders['X-channel-Id'] || 'WEB',
    'Project': customHeaders['Project'] || 'HPDBT',
  };
};

// Error handling. Accepts a flag to suppress global auth redirect (useful for login calls)
const handleApiError = async (response, suppressAuthRedirect = false) => {
  const { status } = response;

  if (status === STATUS_CODES.UNAUTHORIZED) {
    if (!suppressAuthRedirect) {
      sessionStorage.clear();
      window.location.href = '/login';
      return { error: true, message: 'Session expired. Please login again.' };
    }
    // If suppression requested, return an error object but do not perform redirect/clear
    return { error: true, message: 'Session expired. Please login again.', statusCode: status };
  }
  if (status === STATUS_CODES.FORBIDDEN) {
    return { error: true, message: 'Access forbidden', statusCode: status };
  }
  if (status === STATUS_CODES.NOT_FOUND) {
    return { error: true, message: 'Resource not found', statusCode: status };
  }
  if (status === STATUS_CODES.INTERNAL_SERVER_ERROR) {
    return { error: true, message: 'Server error', statusCode: status };
  }
  return { error: true, message: 'Something went wrong', statusCode: status };
};

// Main interceptor wrapper
export const apiFetch = async (url, options = {}) => {
  try {
    const { headers = {}, suppressAuthRedirect = false, ...restOptions } = options;
    const requestHeaders = await createHeaders(headers);

    const response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders
    });

    let data;
    try {
      data = await response.json();
    } catch {
      return { error: true, message: 'Invalid server response' };
    }

    // success response check
    if ([STATUS_CODES.OK, STATUS_CODES.CREATED, STATUS_CODES.ACCEPTED].includes(response.status)) {
      return data;
    }

    // Unauthorized (both HTTP + APP code)
    if (response.status === STATUS_CODES.UNAUTHORIZED || data?.statusCode === APP_STATUS_CODES.UNAUTHORIZED) {
      if (!suppressAuthRedirect) {
        sessionStorage.clear();
        window.location.href = '/login';
        return { ...data, error: true, message: 'Session expired. Please login again.' };
      }
      // If suppression requested, return the error payload to the caller for handling
      return { ...data, error: true, message: data?.message || 'Session expired. Please login again.' };
    }

    return await handleApiError(response, suppressAuthRedirect);
  } catch (error) {
    console.error("API Fetch Error:", error);
    return { error: true, message: 'Network error or request failed' };
  }
};

//  Helper methods
export const apiGet = (url, options = {}) => apiFetch(url, { ...options, method: 'GET' });
export const apiPost = (url, data, options = {}) => apiFetch(url, { ...options, method: 'POST', body: JSON.stringify(data) });
export const apiPut = (url, data, options = {}) => apiFetch(url, { ...options, method: 'PUT', body: JSON.stringify(data) });
export const apiDelete = (url, options = {}) => apiFetch(url, { ...options, method: 'DELETE' });
