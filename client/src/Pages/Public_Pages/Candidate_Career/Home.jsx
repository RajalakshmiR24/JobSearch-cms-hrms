import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobs } from "../../../redux/common/public";

import illustration from "../../../assets/images/self-learning.png";
import JobPilotSteps from "./JobPilotSteps ";
import Category from "./Category";
import FeaturedJobs from "./FeaturedJobs";
import TopCompanies from "./TopCompanies";

const Home = () => {
  const dispatch = useDispatch();

  const {
    loading,

    error,
    totalCount,
    suggestions,
  } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const stats = [
    { title: "Live Job", count: totalCount?.totalJob || 0, icon: "📂" },
    { title: "Companies", count: totalCount?.totalCompanies || 0, icon: "🏢" },
    { title: "Candidates", count: totalCount?.totalCandidate || 0, icon: "👤" },
    { title: "HR", count: totalCount?.totalHr || 0, icon: "🧑‍🤝‍🧑" },
  ];

  return (
    <div className="p-5 md:p-10 font-sans bg-[#f9f9fb]">
      {/* Hero Section */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-10">
        {/* Left Content */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-[#111] leading-snug">
            Find a job that suits
            <br />
            your interest & skills.
          </h1>
          <p className="text-[#666] mt-3 mb-6 max-w-md text-sm md:text-base">
            Aliquam vitae turpis in diam convallis finibus in at risus. Nullam
            in scelerisque leo, eget sollicitudin velit vestibulum.
          </p>

          {/* Search Inputs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <input
              type="text"
              placeholder="Job title, Keyword…"
              className="flex-1 p-3 border border-[#ccc] rounded-lg outline-none text-sm"
            />
            <input
              type="text"
              placeholder="Your Location"
              className="flex-1 p-3 border border-[#ccc] rounded-lg outline-none text-sm"
            />
            <button className="bg-[#0d6efd] text-white py-3 px-6 rounded-lg text-sm font-semibold">
              Find Job
            </button>
          </div>

          {/* Dynamic suggestions */}
          {suggestions && suggestions.length > 0 && (
            <p className="text-[#aaa] text-sm">
              Suggestion:{" "}
              {suggestions.map((item, idx) => (
                <span
                  key={idx}
                  className={`cursor-pointer ${
                    idx % 2 === 0 ? "text-black" : "text-[#0d6efd]"
                  }`}
                >
                  {item}
                  {idx < suggestions.length - 1 && ", "}
                </span>
              ))}
            </p>
          )}
        </div>

        {/* Illustration */}
        <div className="flex-1 text-center">
          <img
            src={illustration}
            alt="Self Learning"
            className="w-full max-w-[300px] h-auto mx-auto"
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-lg shadow-md text-center"
          >
            <div className="text-3xl md:text-4xl mb-2">{item.icon}</div>
            <div className="text-lg md:text-xl font-bold">{item.count}</div>
            <div className="text-[#666] text-sm">{item.title}</div>
          </div>
        ))}
      </div>

      {/* Loading/Error States */}
      {loading && (
        <p className="mt-10 text-center text-blue-500 font-medium">
          Loading jobs...
        </p>
      )}
      {error && (
        <p className="mt-10 text-center text-red-500 font-medium">{error}</p>
      )}

      {/* Sections */}
      <div className="mt-14">
        <Category />
        <JobPilotSteps />
        <FeaturedJobs />
        <TopCompanies />
      </div>
    </div>
  );
};

export default Home;
