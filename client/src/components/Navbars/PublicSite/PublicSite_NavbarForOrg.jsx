import React from "react";
import logo from "../../../assets/images/ZenCMS.jpg";

const PublicSite_NavbarForOrg = () => {
  return (
    <div className="flex justify-between items-center py-2 px-10 bg-[#fdfcf9] font-sans sticky top-0 z-10">
      <a href="/cms/org" className="flex items-center">
        <img
          src={logo}
          alt="logo"
          className="w-[150px] h-[40px] cursor-pointer"
        />
      </a>

      <div className="flex items-center gap-6">
        <a
          href="/cms/org"
          className="text-[#1a1a1a] font-semibold no-underline"
        >
          Home
        </a>
        <a
          href="#features"
          className="text-[#1a1a1a] font-semibold no-underline"
        >
          Features
        </a>
        <a
          href="#pricing"
          className="text-[#1a1a1a] font-semibold no-underline"
        >
          Pricing
        </a>
        <a
          href="#blog"
          className="text-[#1a1a1a] font-semibold no-underline"
        >
          Blog
        </a>

        <a href="#contact">
          <button className="bg-[#f4a100] text-black py-2 px-5 border border-black rounded-lg font-semibold cursor-pointer">
            Contact Us
          </button>
        </a>
      </div>
    </div>
  );
};

export default PublicSite_NavbarForOrg;
