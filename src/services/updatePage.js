// services/pageService.js
import { apiPost } from "../api/interceptor";  
import apiEndpoints from "../api/endpoints";

export const updatePageClick = async (payload) => {
  return await apiPost(apiEndpoints.updatePage(), payload);

};
