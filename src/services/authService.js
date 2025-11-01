import { apiPost } from "../api/interceptor";
import apiEndpoints from "../api/endpoints";

// For the login endpoint we don't want the global auth redirect to run on 401
export const loginUser = async (credentials) => {
  return await apiPost(apiEndpoints.loginV1(), credentials, { suppressAuthRedirect: true });
};