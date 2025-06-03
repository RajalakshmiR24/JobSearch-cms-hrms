import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchUserInfo, logout } from "../../redux/authSlice";
import logo from "../../assets/images/jobly.jpeg";
import {
  FiSearch,
  FiHome,
  FiGlobe,
  FiInbox,
  FiFileText,
  FiBookmark,
  FiBookOpen,
  FiHeadphones,
  FiUser,
  FiSettings,
  FiMessageSquare,
  FiLogOut,
  FiChevronDown,
  FiChevronUp,
  FiMenu,
  FiX,
} from "react-icons/fi";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

const menuItems = [
  { label: "Overview", icon: <FiHome />, path: "/cms/candidate/overview" },
  { label: "Explore Job", icon: <FiGlobe />, path: "/cms/candidate/jobs" },
  { label: "Inbox", icon: <FiInbox />, path: "/cms/candidate/inbox" },
  { label: "My Applications", icon: <FiFileText />, path: "/cms/candidate/applications" },
  { label: "Saved Jobs", icon: <FiBookmark />, path: "/cms/candidate/saved" },
];

const otherItems = [
  { label: "Blog & Article", icon: <FiBookOpen />, path: "/cms/candidate/blog" },
  { label: "Help Center", icon: <FiHeadphones />, path: "/cms/candidate/help" },
];

const footerItems = [
  { label: "My Profile", icon: <FiUser />, path: "/cms/candidate/profile" },
  { label: "Settings", icon: <FiSettings />, path: "/cms/candidate/settings" },
  { label: "Feedback", icon: <FiMessageSquare />, path: "/cms/candidate/feedback" },
];

const CandidateSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, loading } = useSelector((state) => state.auth);

  const [showFooterMenu, setShowFooterMenu] = useState(false);
  const [theme, setTheme] = useState("light");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchUserInfo("candidate"));
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/cms");
  };

  const renderMenuItem = ({ label, icon, path }) => {
    const isActive = location.pathname === path;

    return (
      <div
        key={label}
        onClick={() => navigate(path)}
        className={`flex items-center py-2 px-3 rounded-lg cursor-pointer mb-2 transition-all duration-300 ease-in-out ${
          isActive
            ? "bg-red-600 text-white font-bold"
            : theme === "dark"
            ? "bg-transparent text-white"
            : "bg-transparent text-gray-800"
        }`}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = isActive
            ? "#eb443f"
            : "#e36a66")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = isActive
            ? "#eb443f"
            : "transparent")
        }
      >
        <span>{icon}</span>
        {sidebarOpen && label}
      </div>
    );
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredOtherItems = otherItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredFooterItems = footerItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`${
        sidebarOpen ? "w-52" : "w-14"
      } bg-${theme === "dark" ? "gray-900" : "white"} h-screen flex flex-col justify-between border-r border-gray-200 p-4`}
    >
      {/* Topbar */}
      <div className={`flex ${sidebarOpen ? "justify-between" : "justify-center"} items-center mb-5`}>
        {sidebarOpen && (
          <div className="flex items-center">
            <img src={logo} alt="Jobly" className="h-7 mr-2" />
            <h2 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              Jobly
            </h2>
          </div>
        )}
        <div
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`cursor-pointer p-1 flex items-center justify-center w-7 h-7 ${theme === "dark" ? "text-white" : "text-gray-800"}`}
        >
          {sidebarOpen ? <FiX size={16} /> : <FiMenu size={16} />}
        </div>
      </div>

      <>
        {sidebarOpen && (
          <div className="relative mb-5">
            <FiSearch
              className={`absolute top-2 right-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}
            />
            <input
              type="text"
              placeholder="Quick search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-11/12 py-2 px-3 rounded-lg border border-gray-300 bg-${
                theme === "dark" ? "gray-800" : "white"
              } text-${theme === "dark" ? "gray-300" : "black"} text-xs`}
            />
          </div>
        )}

        {/* MAIN */}
        <div>
          {sidebarOpen && (
            <p className={`text-xs ${theme === "dark" ? "text-white" : "text-gray-800"} mb-2`}>
              MAIN
            </p>
          )}
          {filteredMenuItems.length > 0 ? (
            filteredMenuItems.map(renderMenuItem)
          ) : (
            searchTerm && <p className="text-xs text-gray-500">No results found.</p>
          )}
        </div>

        {/* OTHERS */}
        <div className="mt-6">
          {sidebarOpen && (
            <p className={`text-xs ${theme === "dark" ? "text-white" : "text-gray-800"} mb-2`}>
              OTHERS
            </p>
          )}
          {filteredOtherItems.length > 0 ? (
            filteredOtherItems.map(renderMenuItem)
          ) : (
            searchTerm && <p className="text-xs text-gray-500">No results found.</p>
          )}
        </div>

        {/* FOOTER */}
        {sidebarOpen && (
          <div
            className={`mt-auto ${theme === "dark" ? "bg-gray-800" : "bg-white"} text-${
              theme === "dark" ? "gray-300" : "gray-800"
            } p-3 rounded-lg shadow-md cursor-pointer transition-all duration-300 ease-in-out`}
            onClick={() => setShowFooterMenu(!showFooterMenu)}
          >
            {loading ? (
              <p className="text-xs">Loading...</p>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <img
                      src={userData?.photo}
                      alt="Profile"
                      className="w-10 h-10 rounded-full mr-2"
                    />
                    <div>
                      <p className="font-bold text-sm">{userData?.name}</p>
                      <p
                        className={`text-xs truncate ${
                          theme === "dark" ? "text-white" : "text-gray-800"
                        }`}
                        title={`@${userData?.email}`}
                      >
                        @{userData?.email?.slice(0, 20)}
                      </p>
                    </div>
                  </div>
                  <div>{showFooterMenu ? <FiChevronUp /> : <FiChevronDown />}</div>
                </div>

                <div
                  className={`max-h-${showFooterMenu ? "96" : "0"} overflow-hidden transition-all duration-400 ease-in-out mt-3`}
                >
                  {filteredFooterItems.length > 0 ? (
                    filteredFooterItems.map((item) => (
                      <div
                        key={item.label}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(item.path);
                        }}
                        className="mb-2 flex items-center gap-2 text-xs cursor-pointer pl-2"
                      >
                        {item.icon}
                        {item.label}
                      </div>
                    ))
                  ) : (
                    searchTerm && <p className="text-xs text-gray-300">No footer matches.</p>
                  )}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                    }}
                    className="text-red-500 flex items-center gap-2 font-bold text-xs cursor-pointer pl-2"
                  >
                    <FiLogOut />
                    Logout
                  </div>

                  <ThemeToggle theme={theme} setTheme={setTheme} />
                </div>
              </>
            )}
          </div>
        )}
      </>
    </div>
  );
};

export default CandidateSidebar;
