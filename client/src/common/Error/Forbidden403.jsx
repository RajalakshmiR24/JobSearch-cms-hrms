import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Forbidden403 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const message = location.state?.message || "You do not have access to this page.";

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
      <h1 className="text-7xl font-bold text-emerald-500">403</h1>
      <h2 className="text-xl font-semibold mt-4">Error: 403 Forbidden</h2>
      <p className="text-gray-600 mt-2">{message}</p>
      <button
        className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-md border-none cursor-pointer hover:bg-blue-600 transition-all"
        onClick={handleBack}
      >
        Go back
      </button>
    </div>
  );
};

export default Forbidden403;
