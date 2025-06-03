import React from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminNavbar from '../components/Navbars/SuperAdminNavbar';

const SuperAdminLayout = () => {
  return (
    <div>
      <SuperAdminNavbar />
      <div className="p-5">
        <Outlet />
      </div>
    </div>
  );
};

export default SuperAdminLayout;
