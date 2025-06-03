import React from 'react';

const ServerError500 = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
      <h1 className="text-7xl font-bold text-emerald-500">500</h1>
      <h2 className="text-xl font-semibold mt-4">Error: 500 Unexpected Error</h2>
      <p className="text-gray-600 mt-2">
        We're having some issues at the moment. We'll have it fixed in no time!
      </p>
      <button className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-md border-none cursor-pointer hover:bg-blue-600 transition-all">
        Go back
      </button>
    </div>
  );
};

export default ServerError500;
