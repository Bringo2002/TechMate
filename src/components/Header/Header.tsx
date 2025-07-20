import React from 'react';
import NavBar from '../NavBar/Navbar';

const Header: React.FC = () => {
  return (
    <header>
      <NavBar />
      {/* Hero or banner section below NavBar */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center bg-gray-50 mt-20">
        <h1 className="text-4xl font-bold mb-4">
          Build your dream app with TechMate
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Modern tools, fast builds, and expert support.
        </p>
        <button className="px-8 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
          Get Started
        </button>
      </div>
    </header>
  );
};

export default Header;
