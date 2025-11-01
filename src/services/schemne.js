import { apiGet } from "../api/interceptor";
import apiEndpoints from "../api/endpoints";

export const getSchemeList = async (data) => {
    return await apiGet(apiEndpoints.schemeList(), data);
};
