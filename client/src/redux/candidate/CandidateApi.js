
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchJobDetailsApi } from "../../services/candidateService";  


export const fetchJobDetails = createAsyncThunk(
  "candidateApi/fetchJobDetails",  
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchJobDetailsApi();  
      if (data.code === 200) {
        return data;
      } else {
        return rejectWithValue("Failed to fetch job details.");
      }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


const candidateApiSlice = createSlice({
  name: "candidateApi",  
  initialState: {
    jobDetails: [],
    filteredJobDetails: [],
    hrDetails: [],
    cities: [],
    haveResume: false,
    loading: false,
    error: null,
  },
  reducers: {
    filterJobs: (state, action) => {
      state.filteredJobDetails = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobDetails.fulfilled, (state, action) => {
        const jobs = action.payload.data;

        state.jobDetails = jobs;
        state.filteredJobDetails = jobs;
        state.hrDetails = jobs.map((job) => job.hrDetails);
        state.haveResume = action.payload.haveResume;
        state.cities = [
          ...new Set(jobs.map((job) => job.address?.city).filter(Boolean)),
        ];
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchJobDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { filterJobs } = candidateApiSlice.actions;
export default candidateApiSlice.reducer;
