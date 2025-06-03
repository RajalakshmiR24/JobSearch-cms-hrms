import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home', href: '#' },
  { label: 'Find Job', href: '#' },
  { label: 'Pricing Plans', href: '#' },
  { label: 'Customer Support', href: '#' },
];

const PublicSite_NavbarForJobSearch = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (path) => navigate(path);

  const renderNavLinks = () =>
    NAV_LINKS.map((link) => (
      <a key={link.label} href={link.href} className="text-black hover:text-blue-600">
        {link.label}
      </a>
    ));

  const renderAuthButtons = () => (
    <div className="flex flex-col md:flex-row gap-2">
      <button
        onClick={() => handleNavigation('/cms')}
        className="border border-blue-600 text-blue-600 py-1 px-3 rounded-sm text-xs"
      >
        Sign In
      </button>
      <button
        onClick={() => handleNavigation('/cms/org')}
        className="bg-blue-600 text-white py-1 px-3 rounded-sm text-xs"
      >
        Post A Job
      </button>
    </div>
  );

  return (
    <header className="bg-gray-100 text-black text-xs w-full">
      <div className="hidden md:flex justify-between items-center py-1 px-4 border-b border-gray-300">
        <nav className="flex gap-3 flex-wrap">{renderNavLinks()}</nav>
        <div className="text-sm">📞 +91-8248492118</div>
      </div>

      <div className="flex flex-wrap items-center justify-between py-3 px-4">
        <div className="flex items-center text-lg font-bold">
          <span className="text-blue-600 text-xl mr-2">👜</span> Jobpilot
        </div>

        <div className="md:hidden ml-auto">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-2xl">
            ☰
          </button>
        </div>

        <div className="hidden md:flex flex-grow max-w-[350px] mx-4">
          <div className="flex border border-gray-300 rounded-md overflow-hidden w-full">
            <input
              type="text"
              placeholder="Job title, keyword, company"
              className="flex-grow px-2 py-1 text-xs border-none outline-none"
            />
            <button className="px-3 bg-white">🔍</button>
          </div>
        </div>

        <div className="hidden md:flex gap-2">{renderAuthButtons()}</div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-4">
          <nav className="flex flex-col gap-2 text-sm">{renderNavLinks()}</nav>
          {renderAuthButtons()}
        </div>
      )}
    </header>
  );
};

export default PublicSite_NavbarForJobSearch;
