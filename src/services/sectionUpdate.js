import apiEndpoints from "../api/endpoints";
import { apiPost } from "../api/interceptor";

export const sectionUpdate = async (payload) => {
    try {
      const response = await apiPost(apiEndpoints.updateSection(), payload);
      if (response.data.success) { 
        return { success: true, data: response.data };
      } 
      else {
        return { success: false, message: response.data.message || "Update failed" };
      }
    } 
    catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error updating content";
      return { success: false, message: errorMessage };
    }
};
