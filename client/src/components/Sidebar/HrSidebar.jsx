import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserInfo } from "../../redux/authSlice";
import { useNavigate, useLocation } from "react-router-dom";

const HrSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUserInfo("hr")).then((res) => {
      if (res.payload?.code === 403) {
        navigate("/403", { state: { message: res.payload.message } });
      }
    });
  }, [dispatch, navigate]);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: "📊 Dashboard", path: "/cms/hr/dashboard" },
    {
      label: (
        <>
          💬 Messages{" "}
          <span className="ml-auto bg-green-500 rounded-full w-2.5 h-2.5"></span>
        </>
      ),
      path: "/cms/hr/messages",
    },
    { label: "📅 Calendar", path: "/cms/hr/calendar" },

    { section: "Recruitment" },
    { label: "💼 Jobs", path: "/cms/hr/jobs" },
    { label: "👥 Candidates", path: "/cms/hr/candidates" },
    { label: "🔗 Referrals", path: "/cms/hr/referrals" },
    { label: "🌐 Career Site", path: "/cms/career-site" },
    { section: "Organization" },
    { label: "🏢 Company Profile", path: "/cms/hr/organization-details" },
    { label: "👨‍💼 Employees", path: "/cms/hr/employees" },
    { label: "📄 Documents", path: "/cms/hr/documents" },
    { label: "📈 Reports", path: "/cms/hr/reports" },
    { section: "otherItems" },
    { label: "📝 Blog & Article", path: "/cms/hr/blog" },
    { label: "❓ Help Center", path: "/cms/hr/help" },
  ];

  return (
    <div className="w-52 bg-gray-900 text-white h-full p-2.5 font-sans flex flex-col gap-1 sticky top-0 z-10">
      {/* User Info */}
      <div className="mb-3 flex items-center gap-2">
        {userData?.logo && (
          <img
            src={userData.logo}
            alt="Organization Logo"
            className="w-10 h-10 rounded-full object-cover"
          />
        )}

        <div>
          <div className="font-bold text-sm">{userData?.orgName || "Loading..."}</div>
          {userData?.position && (
            <div className="text-xs text-gray-400 mt-0.5">{userData.position}</div>
          )}
        </div>
      </div>

      {/* Navigation */}
      {navLinks.map((item, index) =>
        item.section ? (
          <div
            key={index}
            className="text-xs text-gray-500 mt-4 mb-1 uppercase"
          >
            {item.section}
          </div>
        ) : (
          <div
            key={index}
            className={`flex items-center p-2 rounded-lg cursor-pointer text-sm ${
              isActive(item.path)
                ? "bg-gradient-to-r from-purple-700 to-pink-600 text-white"
                : "hover:bg-gray-800"
            }`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </div>
        )
      )}
    </div>
  );
};

export default HrSidebar;
