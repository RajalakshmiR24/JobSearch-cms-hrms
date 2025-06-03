import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const CareerSiteFooter = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 px-4 py-10 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
        {/* Logo & Contact */}
        <div>
          <div className="flex items-center mb-4">
            <span className="text-xl mr-2">👜</span>

            <span className="text-white font-bold text-base">Jobpilot</span>
          </div>
          <p>
            Call us:{" "}
            <a href="tel:+918248492118" className="text-white font-medium">
              +91-8248492118
            </a>
          </p>
          <p className="text-xs mt-1">
            S2, Gangai Nagar, Revathipuram, Urapakkam
          </p>
        </div>

        {/* Quick Links */}
        <nav aria-label="Quick Links">
          <h3 className="text-white font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-1">
            <li>
              <a href="/about" className="hover:text-white">
                About
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-white">
                Contact
              </a>
            </li>
            <li>
              <a href="/pricing" className="hover:text-white">
                Pricing
              </a>
            </li>
            <li>
              <a href="/blog" className="hover:text-white">
                Blog
              </a>
            </li>
          </ul>
        </nav>

        {/* Candidate Section */}
        <nav aria-label="Candidate">
          <h3 className="text-white font-semibold mb-3">Candidate</h3>
          <ul className="space-y-1">
            <li>
              <a href="/jobs" className="hover:text-white">
                Browse Jobs
              </a>
            </li>
            <li>
              <a href="/employers" className="hover:text-white">
                Browse Employers
              </a>
            </li>
            <li>
              <a href="/dashboard" className="hover:text-white">
                Dashboard
              </a>
            </li>
            <li>
              <a href="/saved" className="hover:text-white">
                Saved Jobs
              </a>
            </li>
          </ul>
        </nav>

        {/* Employers Section */}
        <nav aria-label="Employers">
          <h3 className="text-white font-semibold mb-3">Employers</h3>
          <ul className="space-y-1">
            <li>
              <a href="/post-job" className="hover:text-white">
                Post a Job
              </a>
            </li>
            <li>
              <a href="/candidates" className="hover:text-white">
                Browse Candidates
              </a>
            </li>
            <li>
              <a href="/dashboard/employer" className="hover:text-white">
                Dashboard
              </a>
            </li>
            <li>
              <a href="/applications" className="hover:text-white">
                Applications
              </a>
            </li>
          </ul>
        </nav>

        {/* Support + Sponsored Link */}
        <div>
          <h3 className="text-white font-semibold mb-3">Support</h3>
          <ul className="space-y-1">
            <li>
              <a href="/faqs" className="hover:text-white">
                FAQs
              </a>
            </li>
            <li>
              <a href="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:text-white">
                Terms & Conditions
              </a>
            </li>
          </ul>
          {/* Ad / Affiliate Area */}
          <div className="mt-4">
            <a
              href="https://partner-site.com?utm_source=jobpilot&utm_medium=footer&utm_campaign=footer_link"
              className="text-yellow-400 text-xs underline hover:text-yellow-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              📢 Explore Jobpilot's Hiring Partner Program →
            </a>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="max-w-7xl mx-auto border-t border-gray-700 mt-10 pt-5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
        <p className="text-center md:text-left mb-3 md:mb-0">
          © 2025 Jobpilot – All Rights Reserved
        </p>
        <div className="flex gap-4">
          <a
            href="https://facebook.com/jobpilot"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hover:text-white"
          >
            <Facebook size={16} />
          </a>
          <a
            href="https://twitter.com/jobpilot"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="hover:text-white"
          >
            <Twitter size={16} />
          </a>
          <a
            href="https://instagram.com/jobpilot"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-white"
          >
            <Instagram size={16} />
          </a>
          <a
            href="https://linkedin.com/company/jobpilot"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-white"
          >
            <Linkedin size={16} />
          </a>
          <a
            href="https://youtube.com/jobpilot"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="hover:text-white"
          >
            <Youtube size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default CareerSiteFooter;
