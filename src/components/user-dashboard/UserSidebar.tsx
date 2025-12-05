import React from "react";
import { Link } from "react-router-dom";

const UserSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-800 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>
      <nav className="flex flex-col gap-3">
        <Link to="/user" className="hover:text-blue-400">Overview</Link>
        <Link to="/user/orders" className="hover:text-blue-400">Orders</Link>
        <Link to="/user/profile" className="hover:text-blue-400">Profile</Link>
        <Link to="/user/support" className="hover:text-blue-400">Support</Link>
      </nav>
    </aside>
  );
};

export default UserSidebar;
