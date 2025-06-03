import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import jobReducer from "./hr/HRapi";
import publicReducer from "./common/public";
import candidateApiReducer from "../redux/candidate/CandidateApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hrJobs: jobReducer,
    candidateApi: candidateApiReducer,
    jobs: publicReducer,
  },
});
