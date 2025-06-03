import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserInfo } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";

const HRNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUserInfo("hr")).then((res) => {
      if (res.payload?.code === 403) {
        navigate("/403", { state: { message: res.payload.message } });
      }
    });
  }, [dispatch, navigate]);

  const handleNavigation = (path) => navigate(path);

  return (
    <div className="bg-[#121212] h-[60px] flex items-center justify-between px-5 border-b border-[#333] text-white">
      {/* Search Bar */}
      <div className="flex items-center bg-[#1E1E1E] py-2 px-4 rounded-full w-[300px]">
        <span className="mr-2 text-gray-500">🔍</span>
        <input
          type="text"
          placeholder="Search for jobs, candidates and more..."
          className="bg-transparent border-none outline-none text-white w-full"
        />
      </div>

      <div className="flex items-center gap-4">
        <div
          className="text-lg cursor-pointer"
          onClick={() => handleNavigation("/cms/hr/settings")}
        >
          ⚙️
        </div>

        <div
          className="relative text-lg cursor-pointer"
          onClick={() => handleNavigation("/cms/hr/notification")}
        >
          🔔
          <span className="absolute top-0 right-[-2px] w-2.5 h-2.5 bg-lime-500 rounded-full" />
        </div>

        {loading ? (
          <p className="m-0">Loading...</p>
        ) : (
          userData?.photo && (
            <img
              src={userData.photo}
              alt="profile"
              onClick={() => handleNavigation("/cms/hr/profile")}
              className="w-9 h-9 rounded-full object-cover cursor-pointer"
            />
          )
        )}
      </div>
    </div>
  );
};

export default HRNavbar;
