import apiEndpoints from "../api/endpoints";
import { apiGet } from "../api/interceptor";

export const bindPageClick = async (slug) => {
  try {
    console.log("Binding page with slug:", slug);
    // Use the dynamic slug in the API URL
    const url = apiEndpoints.viewPageBySlug(slug);
    console.log("API URL:", url);
    
    const response = await apiGet(url);
    console.log("bindPageClick response:", response);
    
    if (response && !response.error) {
      return { success: true, data: response };
    } 
    else { 
      return {
        success: false,
        message: response?.message || "Failed to fetch content",
      };
    }
  } 
  catch (error) {
    console.error("Error in bindPageClick:", error);
    const errorMessage = error.message || "Error fetching content";
    return { success: false, message: errorMessage };
  }
};