import React from "react";
import { FiGithub, FiTwitter, FiHeart } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="mt-12 border-t border-white/5 bg-black/20 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        
        {/* Left */}
        <div className="text-gray-500">
          © {new Date().getFullYear()} POLLit. All rights reserved.
        </div>

        {/* Center */}
        <div className="flex items-center gap-1 text-gray-500">
          Built with <FiHeart className="text-indigo-500" /> using React & Tailwind
        </div>

        {/* Right / Socials */}
        <div className="flex items-center gap-4 text-gray-500">
          <a
            href="#"
            className="hover:text-indigo-400 transition-colors"
          >
            <FiGithub />
          </a>

          <a
            href="#"
            className="hover:text-indigo-400 transition-colors"
          >
            <FiTwitter />
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;