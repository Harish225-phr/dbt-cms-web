const API_BASE_URL = "https://ess-cms.techembryo.com";
const API_BASE_URL_DBT = "https://sandbox.techembryo.com/apiDbt/api";

const BASE_URL_CMS = `${API_BASE_URL}/cms/api/`;

export const apiEndpoints = {
  loginV1: () => `${API_BASE_URL}/cms-users/api/auth/v1/login`, 


  //admin endpoint
  listPage: () => `${BASE_URL_CMS}pages/v1/list`, 
  addPage: () => `${BASE_URL_CMS}pages/v1/add`, 
  viewPage: (id) => `${BASE_URL_CMS}pages/v1/view/${id}`,
  updatePage: () => `${BASE_URL_CMS}pages/v1/update`,
  viewPageBySlug: (slug) => `${BASE_URL_CMS}pages/v1/view/slug/${slug}`,
  addMedia: () => `${BASE_URL_CMS}media/v1/add`,
  addNotification: () => `${BASE_URL_CMS}pages/section/v1/add`,
  updateSection: () => `${BASE_URL_CMS}pages/section/v1/update`,
  viewMedia: (documentId) => `${BASE_URL_CMS}media/v1/view/${documentId}`,


  //dbt endpoints
  schemeDetails: () => `${API_BASE_URL_DBT}/application/cumulative-scheme-details`,
  schemeList: () => `${API_BASE_URL_DBT}/master/departments/schemes`,
  transactionReport: () => `${API_BASE_URL_DBT}/master/get-years/LST3YR`,
  transactionReportData: () => `${API_BASE_URL_DBT}/application/scheme-details-dashboard`,

};

export default apiEndpoints;
