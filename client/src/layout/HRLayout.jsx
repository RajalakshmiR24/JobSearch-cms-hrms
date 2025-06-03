import React from "react";
import { Outlet } from "react-router-dom";
import HrNavbar from "../components/Navbars/HRNavbar";
import HrSidebar from "../components/Sidebar/HrSidebar";

const HRLayout = () => {
  return (
    <div>
      <div className="flex">
        <div className="flex-shrink-0 w-[220px]">
          <HrSidebar />
        </div>
        <div className="flex-1 bg-gray-100">
          <HrNavbar />

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default HRLayout;
