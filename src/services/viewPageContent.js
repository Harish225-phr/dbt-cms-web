// services/pageService.js
import { apiGet } from "../api/interceptor";
import apiEndpoints from "../api/endpoints";

export const viewPageClick = async (pageId) => {
    const data = await apiGet(apiEndpoints.viewPage(pageId));
    return { success: true, data };
  } 

