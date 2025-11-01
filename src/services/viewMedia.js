import apiEndpoints from "../api/endpoints";
import { createHeaders } from "../api/interceptor";

export const viewMedia = async (documentId) => {
    try {
      console.log("Fetching document with ID:", documentId);
      const url = apiEndpoints.viewMedia(documentId);
      console.log("API URL:", url);
      
      // Using fetch directly for binary data
      const headers = await createHeaders({
        'Content-Type': 'application/octet-stream',
        'Accept': 'application/pdf,*/*'
      });
      
      console.log("Request headers:", headers);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
      
      if (!response.ok) {
        console.error("HTTP error:", response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const contentType = response.headers.get('content-type');
      console.log("Response content type:", contentType);
      
      return {
        success: true,
        data: blob,
        contentType: contentType,
      };
    } catch (error) {
      console.error("Error in viewMedia service:", error);
      const errorMessage = error.message || "Error fetching content";
      return { success: false, message: errorMessage };
    }
};