import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import publicService from '../../services/commonService';


export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async (_, { rejectWithValue }) => {
  try {
    const response = await publicService.fetchPublicPage(); 
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

const publicSlice = createSlice({
  name: 'jobs',
  initialState: {
    loading: false,
    jobs: [],
    topCompanies: [],
    randomTitles: [],
    categoryCount: {},
    totalCount: {},
    error: '',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.Jobs;
        state.topCompanies = action.payload.TopCompanies;
        state.randomTitles = action.payload.randomTitles;
        state.categoryCount = action.payload.categoryCount;
        state.totalCount = action.payload.totalCount;
        state.suggestions = action.payload.Suggestions; // from API

      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default publicSlice.reducer;
