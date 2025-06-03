// services/hrService.js
import axiosInstance from '../utils/axiosInstance';

const HR_BASE = '/api/cms/hr';

const hrService = {
  fetchAllJobs: () => axiosInstance.post(`${HR_BASE}/get/all/jobs`),
  deleteJob: (job_id) => axiosInstance.post(`${HR_BASE}/job/delete`, { job_id }),
  createJobRole: (formData) => axiosInstance.post(`${HR_BASE}/create-jobrole`, formData),
  fetchJobEnums: () => axiosInstance.post(`${HR_BASE}/all-jobdetails`),
};

export default hrService;