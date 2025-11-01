// src/services/cumulativeSchemeDetails.js
import { apiPost } from "../api/interceptor";
import apiEndpoints from "../api/endpoints";

export const getCumulativeSchemeDetails = async (payload = {}) => {
    const response = await apiPost(apiEndpoints.schemeDetails(), payload);
    if (response?.responseCode === 200 && response?.responseObject) {
      return { success: true, data: response.responseObject };
    }
    return { success: false, error: 'Failed to fetch cumulative scheme details' };
};