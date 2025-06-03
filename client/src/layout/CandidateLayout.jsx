import React from 'react';
import { Outlet } from 'react-router-dom';
import CandidateSidebar from '../components/Sidebar/CandidateSidebar';

const CandidateLayout = () => {
  return (
    <div className="flex">
      <CandidateSidebar />
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default CandidateLayout;
