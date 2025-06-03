import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserInfo } from "../../redux/authSlice";

const SuperAdminNavbar = () => {
  const dispatch = useDispatch();
  const { userData, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUserInfo("superadmin"));
  }, [dispatch]);

  return (
    <div className="bg-[#121212] text-white p-4 flex items-center justify-between">
      <h2 className="text-2xl font-semibold">Super Admin Navbar</h2>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="flex items-center gap-4">
          <span className="text-lg">{userData?.name}</span>
          {userData?.photo && (
            <img
              src={userData.photo}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SuperAdminNavbar;
