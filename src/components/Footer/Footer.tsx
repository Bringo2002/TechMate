import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-blue-900 text-white py-4 mt-12">
    <div className="max-w-7xl mx-auto px-4 text-center text-sm">
      Copyright © TechMate. All rights reserved.
    </div>
    <div className="text-center text-sm text-gray-400 mt-6">
  <p>
    <a href="/terms" className="hover:underline text-blue-400">Terms of Service</a> •
    <a href="/privacy" className="hover:underline text-blue-400 ml-2">Privacy Policy</a>
  </p>
</div>

  </footer>
);

export default Footer;
