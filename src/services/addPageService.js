import { apiPost } from "../api/interceptor";
import apiEndpoints from "../api/endpoints";

export const addPage = async (data) => {
    return await apiPost(apiEndpoints.addPage(), data);
};
