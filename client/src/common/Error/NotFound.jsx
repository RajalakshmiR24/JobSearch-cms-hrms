import React from "react";

const NotFound404 = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
      <h1 className="text-7xl font-bold text-emerald-500">404</h1>
      <h2 className="text-xl font-semibold mt-4">Error: 404 Page Not Found</h2>
      <p className="text-gray-600 mt-2">
        Sorry, the page you're looking for cannot be accessed.
      </p>
      <div className="mt-4 leading-loose">
        <a href="/" className="text-blue-500 no-underline hover:underline">
          Go to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound404;
