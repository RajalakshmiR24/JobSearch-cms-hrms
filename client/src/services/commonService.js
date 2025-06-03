// services/hrService.js
import axiosInstance from '../utils/axiosInstance';

const PUBLIC_BASE = '/api/cms/auth';

const hrService = {
  fetchPublicPage: () => axiosInstance.post(`${PUBLIC_BASE}/jobs`),
 
};

export default hrService;