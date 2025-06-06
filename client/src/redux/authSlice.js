import { createSlice, createAsyncThunk } from "/node_modules/.vite/deps/@reduxjs_toolkit.js?v=78e4f4d3";
import axiosInstance from "../utils/axiosInstance"; 


const BASE_URL = "http://localhost:5001" || window.location.origin;

export const loginWithGoogle = createAsyncThunk("auth/loginWithGoogle", async () => {
  window.open(`${BASE_URL}/api/cms/auth/google/callback`, "_self");
});

export const signupWithGoogle = createAsyncThunk("auth/signupWithGoogle", async () => {
  window.open(`${BASE_URL}/api/cms/auth/google`, "_self");
});

export const fetchUserInfo = createAsyncThunk(
  "auth/fetchUserInfo",
  async (role, { rejectWithValue }) => {
    try {
      const endpoints = {
        candidate: "/api/cms/candidate/name",
        hr: "/api/cms/hr/name",
        superadmin: "/api/cms/superadmin/name",
      };

      const response = await axiosInstance.post(endpoints[role]);
      return response.data;
    } catch (err) {
      if (err.response) {
        return rejectWithValue({
          code: err.response.status,
          message: err.response.data?.message || "Unknown error",
        });
      }
      return rejectWithValue({
        code: 500,
        message: "Something went wrong",
      });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    userData: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.userData = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
