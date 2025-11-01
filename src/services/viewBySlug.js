// src/services/contentService.js
import { apiGet } from "../api/interceptor";
import apiEndpoints from "../api/endpoints";

export const fetchPageBySlug = async (slug) => {
    const response = await apiGet(apiEndpoints.viewPageBySlug(slug));
    if (response?.response?.data) {
      return { success: true, data: response.response.data };
    }
  } 