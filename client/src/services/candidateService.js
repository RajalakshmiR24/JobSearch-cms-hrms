import axiosInstance from "../utils/axiosInstance";

export const fetchJobDetailsApi = async () => {
  const response = await axiosInstance.post("/api/cms/candidate/jobs");
  return response.data;
};

export const applyToJobApi = async (jobId) => {
  const response = await axiosInstance.post(
    `/api/cms/candidate/apply/${jobId}`
  );
  return response.data;
};
