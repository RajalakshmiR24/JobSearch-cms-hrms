import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchJobs } from '../../../redux/common/public'; 

export default function FeaturedJobs() {
  const dispatch = useDispatch();
  const { jobs, loading } = useSelector((state) => state.jobs); 

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : jobs.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % jobs.length);
  };

  const renderJobCard = (job, idx) => (
    <div
      key={idx}
      className={`relative flex flex-col justify-between p-6 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition duration-200 h-full`}
    >
      <div>
        <div className="inline-block text-xs font-semibold text-white bg-green-500 py-1 px-3 rounded mb-4">
          {job.jobType || 'N/A'}
        </div>
        <div className="text-lg font-medium text-gray-900 mb-2">
          {job.postingTitle || 'Untitled'}
        </div>
        <div className="text-sm text-gray-600 mb-4">
          Salary: ₹{job.minSalary?.lakh}LPA - ₹{job.maxSalary?.lakh}.{job.maxSalary?.thousand}LPA
        </div>
      </div>
      <div className="flex items-center mt-auto">
        <img
          src={job.organization_logo }
          alt="Company Logo"
          className="w-8 h-8 rounded-full mr-3 object-cover"
        />
        <div className="text-sm font-medium text-gray-800">
          {job.organization_name || 'Unknown'}
        </div>
        <div className="ml-auto text-xs text-gray-500">
          {job.address?.city}, {job.address?.state}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="text-center py-10">Loading jobs...</div>;
  }

  if (!jobs || jobs.length === 0) {
    return <div className="text-center py-10">No jobs available.</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 font-sans max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Featured Jobs</h2>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800 border border-gray-300 py-2 px-4 rounded-lg transition hover:bg-gray-100">
          View All &rarr;
        </button>
      </div>

      {/* Mobile View: Single Card with Arrows */}
      <div className="block md:hidden relative">
        <div className="flex items-center justify-between">
          <button onClick={handlePrev} className="p-2">
            <ChevronLeft className="w-6 h-6 text-blue-600" />
          </button>
          <div className="flex-1 px-4">{renderJobCard(jobs[currentIndex], currentIndex)}</div>
          <button onClick={handleNext} className="p-2">
            <ChevronRight className="w-6 h-6 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Desktop View: Grid of Cards */}
      <div className="hidden md:grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job, idx) => renderJobCard(job, idx))}
      </div>
    </div>
  );
}
