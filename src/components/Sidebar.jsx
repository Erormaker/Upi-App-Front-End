// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiSend, 
  FiClock, 
  FiCreditCard, 
  FiUsers, 
  FiUser, 
  FiLogOut,
  FiActivity
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: FiHome },
  { path: '/transfer', label: 'Money Transfer', icon: FiSend },
  { path: '/history', label: 'Transactions', icon: FiClock },
  { path: '/wallet', label: 'Wallet & Banks', icon: FiCreditCard },
  { path: '/contacts', label: 'Contacts', icon: FiUsers },
  { path: '/profile', label: 'Profile Settings', icon: FiUser },
];

const Sidebar = () => {
  const { logout, user } = useAuth();
  const { onlineUsers } = useSocket();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-base-200 border-r border-base-300 p-4 sticky top-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg">
          <span className="font-extrabold text-white text-lg tracking-normal">QP</span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide text-primary dark:text-white flex items-center gap-1">
            Quick<span className="text-secondary font-black">-Pay</span>
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-base-content/50">UPI Payments</p>
        </div>
      </div>

      {/* User Quick Info */}
      <div className="flex items-center gap-3 p-3 bg-base-100 rounded-2xl border border-base-300/40 my-4 shadow-sm">
        <div className="avatar placeholder">
          <div className="w-10 rounded-xl bg-primary text-white font-bold">
            {user?.name ? user.name.split(" ").map(n=>n[0]).join("") : "PF"}
          </div>
        </div>
        <div className="overflow-hidden">
          <h4 className="text-sm font-bold truncate text-base-content">{user?.name}</h4>
          <p className="text-[11px] text-base-content/65 truncate">{user?.upiId}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-primary/95 text-white shadow-md shadow-primary/20 scale-[1.02]'
                    : 'text-base-content/75 hover:bg-base-300 hover:text-base-content'
                }`
              }
            >
              <Icon className="text-lg" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Online Users Indicator */}
      <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-xl border border-success/20 mb-3">
        <FiActivity className="text-success animate-pulse text-sm" />
        <span className="text-xs font-semibold text-success">{onlineUsers} Users Online</span>
      </div>

      {/* Footer / Logout */}
      <div className="border-t border-base-300/80 pt-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-error hover:bg-error/10 font-bold rounded-xl text-sm transition-colors duration-200"
        >
          <FiLogOut className="text-lg" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
