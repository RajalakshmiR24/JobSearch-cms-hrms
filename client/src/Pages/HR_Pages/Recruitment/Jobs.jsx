import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaEdit, FaTrash } from 'react-icons/fa';

import {
  fetchAllJobs,
  deleteJob,
  selectHRJobs,
  selectJobsLoading,
  selectJobsError,
  selectJobsSuccess,
} from '../../../redux/hr/HRapi';
import StyledTable from '../../../components/Table/StyledTable';

const Jobs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const jobDetails = useSelector(selectHRJobs);
  const loading = useSelector(selectJobsLoading);
  const error = useSelector(selectJobsError);
  const successMessage = useSelector(selectJobsSuccess);

  useEffect(() => {
    dispatch(fetchAllJobs());
  }, [dispatch]);

  const handleDelete = (job_id) => {
    const confirmDelete = window.confirm('Delete this job?');
    if (confirmDelete) dispatch(deleteJob(job_id));
  };

  const handleViewApplications = (job) => {
    navigate(`/cms/hr/applications/${job.postingTitle}`, {
      state: { job_id: job.job_id, job_title: job.postingTitle },
    });
  };

  const handleEdit = (job) => {
    navigate('/cms/hr/edit-job-role', { state: { job } });
  };

  const handleAssessment = (job) => {
    navigate(`/cms/hr/job-list/assessments/${job.postingTitle}`, {
      state: { job_id: job.job_id, posting_title: job.postingTitle },
    });
  };

  const truncateText = (text, charLimit = 30) =>
    text?.length > charLimit ? `${text.substring(0, charLimit)}...` : text || 'N/A';

  const columns = [
    { header: '#', render: (job, i) => i + 1 },
    { header: 'Posting Title', render: (job) => truncateText(job.postingTitle) },
    { header: 'Job Title', render: (job) => truncateText(job.title) },
    { header: 'Department', render: (job) => truncateText(job.departmentName) },
    {
      header: 'Location',
      render: (job) =>
        truncateText(job.address ? `${job.address.city}, ${job.address.state}` : ''),
    },
    {
      header: 'Salary',
      render: (job) =>
        `₹${job.minSalary?.lakh || 0}.${job.minSalary?.thousand || 0}LPA - ₹${job.maxSalary?.lakh || 0}.${job.maxSalary?.thousand || 0}LPA`,
    },
    { header: 'Hiring Manager', render: (job) => truncateText(job.hiringManager?.name) },
    {
      header: 'Applications',
      render: (job) => (
        <button
          onClick={() => handleViewApplications(job)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          View
        </button>
      ),
    },
    {
      header: 'Target Date',
      render: (job) => new Date(job.targetDate).toLocaleDateString('en-GB'),
    },
    {
      header: 'Assessments',
      render: (job) => (
        <button
          onClick={() => handleAssessment(job)}
          className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          <FaClipboardList />
        </button>
      ),
    },
    {
      header: 'Actions',
      render: (job) => (
        <>
          <button
            onClick={() => handleEdit(job)}
            className="mr-2 p-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete(job.job_id)}
            className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <FaTrash />
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="bg-gray-900 min-h-screen text-white p-5">
      <button
        onClick={() => navigate('/cms/hr/create-job')}
        className="mb-4 px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
      >
        Add Job Role
      </button>

      {loading && <p>Loading jobs...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {successMessage && <p className="text-green-400">{successMessage}</p>}

      <StyledTable columns={columns} data={jobDetails} />
    </div>
  );
};

export default Jobs;
