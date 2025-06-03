import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import { fetchJobs } from '../../../redux/common/public';

const scroll = keyframes`
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
`;

const ScrollingWrapper = styled.div`
  overflow: hidden;
  position: relative;

  &:hover div {
    animation-play-state: paused;
  }
`;

const ScrollingContainer = styled.div`
  display: flex;
  width: fit-content;
  animation: ${scroll} 20s linear infinite;
`;

const CompanyCard = ({ company }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="border border-gray-300 rounded-xl p-5 bg-white shadow-lg flex flex-col justify-between mr-6 min-w-[280px] cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
      title={company.name}
    >
      <div>
        <div className="flex items-center mb-4">
          <img
            src={company.logo}
            alt={company.name}
            className="w-12 h-12 rounded-lg mr-4 object-cover"
          />
          <div>
            <div className="text-lg font-semibold flex items-center">
              <span
                className={`${
                  isExpanded ? 'whitespace-normal' : 'truncate'
                } max-w-[160px] inline-block`}
              >
                {company.name}
              </span>
             
            </div>
            <div className="text-sm text-gray-600 mt-1 flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2C6.686 2 4 4.686 4 8c0 5.25 6 10 6 10s6-4.75 6-10c0-3.314-2.686-6-6-6zM5.5 8a4.5 4.5 0 119 0c0 2.9-2.516 6.202-4.5 8.385C8.016 14.202 5.5 10.9 5.5 8z" />
              </svg>
              {company.location}
            </div>
          </div>
        </div>
      </div>
      <button className="mt-4 w-full bg-blue-100 text-blue-600 font-semibold py-2 px-4 rounded-lg">
        Open Position ({company.openPositions})
      </button>
    </div>
  );
};

function TopCompanies() {
  const dispatch = useDispatch();
  const { topCompanies, loading } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  if (loading) {
    return <div className="text-center py-10">Loading companies...</div>;
  }

  return (
    <div className="px-5 py-10 max-w-screen-xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">Top Companies</h2>
      <ScrollingWrapper>
        <ScrollingContainer>
          {[...topCompanies, ...topCompanies].map((company, index) => (
            <CompanyCard
              key={index}
              company={{
                name: company.organization_name,
                logo: company.organization_logo,
                location: `${company.address?.city}, ${company.address?.state}`,
                openPositions: company.job_opening_count
              }}
            />
          ))}
        </ScrollingContainer>
      </ScrollingWrapper>
    </div>
  );
}

export default TopCompanies;
