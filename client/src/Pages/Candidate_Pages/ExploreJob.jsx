import { useEffect, useState } from "react";
import {
  FaBookmark,
  FaMapMarkerAlt,
  FaClock,
  FaBell,
  FaCalendarAlt,
  FaSort,
  FaFilter,
  FaSearch,
  FaUserTie
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance"; 

const ExploreJob = () => {
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState("For You");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    "For You",
    "Trending Jobs",
    "New This Week",
    "Nearby Opportunities",
    "Urgently Hiring",
  ];

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axiosInstance.post("/api/cms/candidate/jobs");
        console.log("Jobs API response:", response.data);

        if (response.data.code === 200 && Array.isArray(response.data.data)) {
          setJobs(response.data.data);
        } else {
          setJobs([]);
          setError(response.data.message || "No jobs found.");
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Something went wrong while fetching jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      {/* Top Bar */}
      <div className="flex justify-end items-center gap-6 text-gray-600">
        <h1 className="text-xl font-semibold mb-4 mr-auto">Explore Job</h1>
        <FaBell
          className="text-base cursor-pointer"
          onClick={() => navigate("/cms/candidate/notification")}
        />
        <div className="flex items-center gap-1">
          <FaCalendarAlt />
          <span className="text-sm font-medium">{today}</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-red-500 text-white rounded-xl p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-lg transform translate-x-8 translate-y-8" />
        <h1 className="text-2xl font-semibold mb-4">Explore Your Career Opportunities Here</h1>
        <p className="mb-6">Apply to jobs that match your skills and aspirations, and embark on a rewarding career journey.</p>

        <div className="bg-white p-4 rounded-xl flex gap-20 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              placeholder="Search your job title or keyword..."
              className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-200 focus:outline-none"
            />
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <FaMapMarkerAlt className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              placeholder="Set your country or timezone..."
              className="w-full pl-14 pr-4 py-3 rounded-md border border-gray-200 focus:outline-none"
            />
          </div>
          <button className="bg-red-500 text-white py-2 px-4 rounded-md cursor-pointer border border-gray-200 text-sm font-medium">
            Find Job
          </button>
        </div>
      </div>

      {/* Jobs Header & Controls */}
      <div className="flex justify-between items-center mt-6">
        <h2 className="text-xl font-semibold">Jobs For You</h2>
        <div className="flex items-center gap-6 text-gray-600">
          <button className="flex items-center gap-1 cursor-pointer bg-white border border-gray-200 rounded-md py-2 px-4 text-sm font-medium">
            <FaSort /> <span>Sort By</span>
          </button>
          <button className="flex items-center gap-1 cursor-pointer bg-white border border-gray-200 rounded-md py-2 px-4 text-sm font-medium">
            <FaFilter /> <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 overflow-x-auto mt-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 whitespace-nowrap border border-gray-200 rounded-md text-sm font-medium transition-colors mb-4 ${
              selectedTab === tab ? "bg-red-500 text-white" : "bg-white text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Job Cards */}
      {loading ? (
        <p>Loading jobs...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div
              key={job.job_id}
              className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white relative"
            >
              <span className="absolute top-3 left-3 text-xs font-semibold text-green-500 bg-green-100 py-1 px-2 rounded-lg">
                {job.badge || job.jobOpeningStatus || "Open"}
              </span>
              <span className="absolute top-3 right-3 text-sm text-gray-600">
                {job.dateOpened
                  ? new Date(job.dateOpened).toLocaleDateString()
                  : "Recently Posted"}
              </span>

              <div className="flex items-center gap-2">
                <img
                  src={job.logoUrl || "/logos/default.png"}
                  alt={job.hrDetails?.organization_name || "Company"}
                  className="w-6 h-6"
                />
                <h3 className="text-sm font-bold">{job.postingTitle}</h3>
              </div>

              <p className="text-xs text-gray-600">{job.hrDetails?.organization_name}</p>

              <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
                <div className="flex items-center gap-1">
                  <FaMapMarkerAlt />
                  <span>
                    {job.address?.city}, {job.address?.state}, {job.address?.country}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FaClock />
                  <span>{job.jobType || "Full-Time"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaUserTie />
                  <span>
                    {job.workExp?.workExpInYear} yr {job.workExp?.workExpInMonth} mo
                  </span>
                </div>
              </div>

              <div className="mt-2">
                <p className="text-red-500 font-semibold">
                  ₹{job.minSalary.lakh}.
                  {job.minSalary.thousand.toString().padStart(3, "0")} L – ₹
                  {job.maxSalary.lakh}.
                  {job.maxSalary.thousand.toString().padStart(3, "0")} L PA
                </p>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button className="bg-red-500 text-white py-2 px-4 rounded-md cursor-pointer font-medium border border-gray-200 text-sm">
                  Apply
                </button>
                <FaBookmark className="text-gray-300 cursor-pointer" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreJob;
