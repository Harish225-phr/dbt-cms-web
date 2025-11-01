import apiEndpoints from "../api/endpoints";
import { apiPost } from "../api/interceptor";

export const transactionReportData = async (payload) => {
  try {
    // apiPost (apiFetch) returns parsed JSON body directly for this project
    const response = await apiPost(apiEndpoints.transactionReportData(), payload);

    // If the API follows the shape { responseCode, responseDesc, responseObject }
    if (response && (response.responseCode === 200 || response.success === true)) {
      return response;
    }

    // Fallback: return a standardized failure object
    return { success: false, message: response?.responseDesc || response?.message || 'Request failed', ...response };
  } catch (error) {
    const errorMessage = error?.message || 'Error fetching transaction report data';
    return { success: false, message: errorMessage };
  }
};
