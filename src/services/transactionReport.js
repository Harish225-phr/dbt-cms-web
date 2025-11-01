import { apiGet } from "../api/interceptor";
import apiEndpoints from "../api/endpoints";

export const getTransactionReport = async (data) => {
    return await apiGet(apiEndpoints.transactionReport(), data);
};
