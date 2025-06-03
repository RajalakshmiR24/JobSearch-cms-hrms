import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import hrdashboard from "../../../../assets/images/HR_board.png"; 
import dashboard from "../../../../assets/images/HR_dash.png"; 

const Home = () => {
  const navigate = useNavigate(); // Initialize navigate

  const handleNavigate = () => {
    navigate("/cms/org/organization"); // Navigate to the desired route
  };

  return (
    <div className="bg-gray-50 font-sans py-16 px-4">
      <style>
        {`
          @keyframes bounce {
            0%, 100% {
              transform: translateX(-50%) translateY(0);
            }
            50% {
              transform: translateX(-50%) translateY(-10px);
            }
          }
        `}
      </style>

      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Empower Your Content <br /> with Effortless Management
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto mb-8">
          Streamline your workflow with our intuitive, cloud-based CMS. <br />
          No installation, no maintenance—just seamless content creation and management
        </p>
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={handleNavigate} // Add onClick event
            className="bg-blue-600 text-white py-3 px-6 rounded-md text-base font-medium border-none cursor-pointer"
          >
            Try it for free
          </button>
          <button
            onClick={handleNavigate} // Add onClick event
            className="bg-gray-200 text-gray-900 py-3 px-6 rounded-md text-base font-medium border-none cursor-pointer"
          >
            Get demo
          </button>
        </div>

        <div className="relative mt-8">
          <div className="absolute top-[-3rem] left-[50%] transform -translate-x-[50%] text-4xl font-bold text-blue-600 animate-bounce">
            CMS
          </div>

          <div className="flex justify-center items-center gap-8 flex-wrap">
            <img
              src={dashboard}
              alt="Dashboard Left"
              className="w-full max-w-[480px] rounded-xl shadow-xl"
            />
            <img
              src={hrdashboard}
              alt="Dashboard Right"
              className="w-full max-w-[480px] rounded-xl shadow-xl"
            />
            <div className="absolute top-[-3rem] left-[70%] transform -translate-x-[50%] text-4xl font-bold text-blue-600 animate-bounce">
              CMS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
