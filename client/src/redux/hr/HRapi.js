// redux/hr/HRapi.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import hrService from '../../services/hrService';

export const fetchAllJobs = createAsyncThunk(
  'hrJobs/fetchAllJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hrService.fetchAllJobs();
      if (response.data.code === 200) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteJob = createAsyncThunk(
  'hrJobs/deleteJob',
  async (job_id, { rejectWithValue }) => {
    try {
      const response = await hrService.deleteJob(job_id);
      return { job_id, message: response.data.message };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createJobRole = createAsyncThunk(
  'hrJobs/createJobRole',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await hrService.createJobRole(formData);

      if (response?.data?.success && response.status === 201) {
        return response.data.message;
      } else {
        const errorMsg = response?.data?.error || 'Failed to create job role';
        return rejectWithValue(errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error || err.message || 'Unknown error occurred';
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchJobEnums = createAsyncThunk(
  'hrJobs/fetchJobEnums',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hrService.fetchJobEnums();
      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message || 'Failed to fetch enums');
      }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const jobSlice = createSlice({
  name: 'hrJobs',
  initialState: {
    jobs: [],
    enums: {},
    loading: false,
    error: null,
    successMessage: null,
    createdJobMessage: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
      state.createdJobMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchAllJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((job) => job._id !== action.payload.job_id);
        state.successMessage = action.payload.message;
      })
      .addCase(createJobRole.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createdJobMessage = null;
      })
      .addCase(createJobRole.fulfilled, (state, action) => {
        state.loading = false;
        state.createdJobMessage = action.payload;
      })
      .addCase(createJobRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create job role';
      })
      .addCase(fetchJobEnums.fulfilled, (state, action) => {
        state.enums = action.payload;
      })
      .addCase(fetchJobEnums.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const selectHRJobs = (state) => state.hrJobs.jobs;
export const selectJobEnums = (state) => state.hrJobs.enums;
export const selectJobsLoading = (state) => state.hrJobs.loading;
export const selectJobsError = (state) => state.hrJobs.error;
export const selectJobsSuccess = (state) => state.hrJobs.successMessage;
export const selectCreatedJobMessage = (state) => state.hrJobs.createdJobMessage;

export const { clearMessages } = jobSlice.actions;

export default jobSlice.reducer;