import { createBrowserRouter, Navigate } from "react-router-dom";

import Landing from "../common/Landing";
import Auth from "../auth/Auth";
import ProtectedRoute from "./ProtectedRoute";

import CandidateDashboard from "../Pages/Candidate_Pages/CandidateDashboard";
import Home from "../Pages/Public_Pages/Candidate_Career/Home";
import Organization from "../Pages/Public_Pages/NewOrganization/Organization";
import HRDashboard from "../Pages/HR_Pages/HRDashboard";
import SuperAdminDashboard from "../Pages/SuperAdmin_Pages/SuperAdminDashboard";

import CandidateLayout from "../layout/CandidateLayout";
import HRLayout from "../layout/HRLayout";
import SuperAdminLayout from "../layout/SuperAdminLayout";
import OrganizationPublicSiteLayout from "../layout/OrganizationPublicSiteLayout";
import PublicSiteCareerLayout from "../layout/PublicSiteCareerLayout";
import ExploreJob from "../Pages/Candidate_Pages/ExploreJob";
import Inbox from "../Pages/Candidate_Pages/Inbox";
import MyApplications from "../Pages/Candidate_Pages/MyApplications";
import BlogArticle from "../Pages/Public_Pages/OtherItems/BlogArticle";
import HelpCenter from "../Pages/Public_Pages/OtherItems/HelpCenter";
import Feedback from "../Pages/Candidate_Pages/CandidateFooter/Feedback";
import Settings from "../Pages/Candidate_Pages/CandidateFooter/Settings";
import MyProfile from "../Pages/Candidate_Pages/CandidateFooter/MyProfile";
import Notification from "../Pages/Candidate_Pages/SubPages/Notification";
import Forbidden403 from "../common/Error/Forbidden403";
import ServerError500 from "../common/Error/ServerError500";
import NotFound404 from "../common/Error/NotFound";
import Messages from "../Pages/HR_Pages/Messages";
import Calendar from "../Pages/HR_Pages/Calendar";
import Jobs from "../Pages/HR_Pages/Recruitment/Jobs";
import Candidates from "../Pages/HR_Pages/Recruitment/Candidates";
import Referrals from "../Pages/HR_Pages/Recruitment/Referrals";
import CompanyProfile from "../Pages/HR_Pages/Organization/CompanyProfile";
import Employees from "../Pages/HR_Pages/Organization/Employees";
import Documents from "../Pages/HR_Pages/Organization/Documents";
import Reports from "../Pages/HR_Pages/Organization/Reports";
import CreateJobs from "../Pages/HR_Pages/Sub_Pages/CreateJobs";
import OrganizationForm from "../Pages/Public_Pages/NewOrganization/Organization_Form";

const candidateRoutes = [
  { index: true, element: <CandidateDashboard /> },
  { path: "overview", element: <CandidateDashboard /> },
  { path: "jobs", element: <ExploreJob /> },
  { path: "inbox", element: <Inbox /> },
  { path: "applications", element: <MyApplications /> },
  { path: "saved", element: <Inbox /> },

  { path: "blog", element: <BlogArticle /> },
  { path: "help", element: <HelpCenter /> },

  { path: "profile", element: <MyProfile /> },
  { path: "settings", element: <Settings /> },
  { path: "feedback", element: <Feedback /> },

  { path: "notification", element: <Notification /> },
];

const PublicSiteRoutes = [{ index: true, element: <Home /> }];
const OrgPublicSiteRoutes = [
  { index: true, element: <Organization /> },
  { path: "home", element: <Organization /> },

  { path: "organization", element: <OrganizationForm /> },
];
const superAdminRoutes = [{ index: true, element: <SuperAdminDashboard /> }];

const hrRoutes = [
  { index: true, element: <HRDashboard /> },
  { path: "dashboard", element: <HRDashboard /> },
  { path: "messages", element: <Messages /> },
  { path: "calendar", element: <Calendar /> },

  { path: "jobs", element: <Jobs /> },
  { path: "candidates", element: <Candidates /> },
  { path: "referrals", element: <Referrals /> },

  { path: "organization-details", element: <CompanyProfile /> },
  { path: "employees", element: <Employees /> },
  { path: "documents", element: <Documents /> },
  { path: "reports", element: <Reports /> },

  { path: "profile", element: <MyProfile /> },
  { path: "settings", element: <Settings /> },
  { path: "notification", element: <Notification /> },
  { path: "blog", element: <BlogArticle /> },
  { path: "help", element: <HelpCenter /> },

  { path: "create-job", element: <CreateJobs /> },
];

const candidateRole = "candidate";
const hrRole = "hr";
const superAdminRole = "superAdmin";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Navigate to="/cms/career-site" />,
    },
    {
      path: "/cms",
      element: <Landing />,
    },
    {
      path: "/cms/auth-start",
      element: <Auth />,
    },
    {
      path: "/cms/career-site",
      element: <PublicSiteCareerLayout />,
      children: PublicSiteRoutes,
    },
    {
      path: "/cms/org",
      element: <OrganizationPublicSiteLayout />,
      children: OrgPublicSiteRoutes,
    },
    {
      path: "/cms/candidate",
      element: (
        <ProtectedRoute role={candidateRole}>
          <CandidateLayout />
        </ProtectedRoute>
      ),
      children: candidateRoutes,
    },
    {
      path: "/cms/hr",
      element: (
        <ProtectedRoute role={hrRole}>
          <HRLayout />
        </ProtectedRoute>
      ),
      children: hrRoutes,
    },
    {
      path: "/cms/superadmin",
      element: (
        <ProtectedRoute role={superAdminRole}>
          <SuperAdminLayout />
        </ProtectedRoute>
      ),
      children: superAdminRoutes,
    },
    {
      path: "/403",
      element: <Forbidden403 />,
    },
    {
      path: "/500",
      element: <ServerError500 />,
    },
    {
      path: "/404",
      element: <NotFound404 />,
    },
    {
      path: "*",
      element: <NotFound404 />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);

export default router;
