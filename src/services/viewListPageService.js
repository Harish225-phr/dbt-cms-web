import { apiGet } from "../api/interceptor";
import apiEndpoints from "../api/endpoints";

export const viewPagesList = async (data) => {
  return await apiGet(apiEndpoints.listPage(), data);
};
