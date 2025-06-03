import React from "react";
import { Navigate } from "react-router-dom";

const isAuthenticated = () => {
  const cmshrmstoken = localStorage.getItem("cmshrmstoken");
  
  return cmshrmstoken;
};

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    localStorage.removeItem("cmshrmstoken");
    return <Navigate to="/cms" />;
  }

  return <div>{children}</div>;
};

export default ProtectedRoute;
