import React from 'react';

const Header: React.FC = () => {
  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Contact', href: '#contact' },
    { name: 'Blog', href: '#blog' },
  ];

  return (
    <header className="bg-blue-900 text-white shadow-md w-full fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-3xl font-extrabold tracking-tight flex items-center gap-1">
          <span className="text-white">Tech</span>
          <span className="text-blue-300">Mate</span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-blue-300 text-lg font-bold transition-colors"
            >
              {link.name}
            </a>
          ))}
          <a
            href="#quote"
            className="bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold py-2 px-6 rounded-full transition-all shadow-md"
          >
            Get a Quote
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
