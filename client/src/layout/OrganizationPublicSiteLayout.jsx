import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicSiteNavbarForOrg from '../components/Navbars/PublicSite/PublicSite_NavbarForOrg';

const OrganizationPublicSiteLayout = () => {
  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 w-full z-50">
        <PublicSiteNavbarForOrg />
      </div>
      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  );
};

export default OrganizationPublicSiteLayout;
