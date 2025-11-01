// services/addNotification.js
import apiEndpoints from "../api/endpoints";
import { apiPost } from "../api/interceptor";

export const addNotification = async (payload) => {
  try {
    const response = await apiPost(apiEndpoints.addNotification(), payload);
    if (response.data) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to add notification",
      };
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Error adding notification";
    return { success: false, message: errorMessage };
  }
};
