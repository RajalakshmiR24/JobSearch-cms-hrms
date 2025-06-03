import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicSiteNavbar from '../components/Navbars/PublicSite/PublicSite_NavbarForJobSearch';
import Footer from '../components/Footer/CareerSiteFooter';

const PublicSiteCareerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicSiteNavbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default PublicSiteCareerLayout;
