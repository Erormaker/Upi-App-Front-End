// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiBell, FiSun, FiMoon, FiMenu } from 'react-icons/fi';
import { FaQrcode } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

const Navbar = ({ onOpenMobileMenu }) => {
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();

  // Fetch notifications to count unread ones
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    refetchInterval: 10000, // refresh every 10s to capture mock socket additions
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="navbar bg-base-100 border-b border-base-300 px-4 md:px-6 h-16 sticky top-0 z-30">
      {/* Mobile Drawer Toggle / Brand */}
      <div className="flex-1 gap-2">
        <button 
          onClick={onOpenMobileMenu}
          className="btn btn-ghost btn-circle lg:hidden text-base-content"
          aria-label="Open menu"
        >
          <FiMenu className="text-xl" />
        </button>
        
        {/* Brand logo shown on mobile */}
        <Link to="/" className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-md">
            <span className="font-extrabold text-white text-md">P</span>
          </div>
          <span className="text-lg font-bold tracking-wide text-primary dark:text-white">
            Pay<span className="text-secondary font-black">Flow</span>
          </span>
        </Link>

        {/* Welcome message shown on desktop */}
        <div className="hidden lg:block text-left">
          <h2 className="text-md font-bold text-base-content">
            Hello, <span className="text-primary dark:text-secondary">{user?.name}</span>!
          </h2>
          <p className="text-xs text-base-content/60">Manage your payments and wallet securely.</p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex-none gap-2 md:gap-4">
        {/* Live Users Counter on Header for Tablet/Mobile */}
        <div className="hidden sm:flex lg:hidden items-center gap-1.5 px-3 py-1 bg-success/10 rounded-full border border-success/20 text-success text-xs font-semibold mr-1">
          <span className="w-2 h-2 rounded-full bg-success animate-ping"></span>
          <span>{onlineUsers} online</span>
        </div>

        {/* QR Code Shortcut */}
        <button
          onClick={() => navigate('/transfer?tab=qr')}
          className="btn btn-ghost btn-circle text-base-content hover:text-primary transition-colors duration-200"
          title="Scan/Generate QR"
        >
          <FaQrcode className="text-xl" />
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="btn btn-ghost btn-circle text-base-content"
          title={theme === 'payflowLight' ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === 'payflowLight' ? <FiMoon className="text-xl" /> : <FiSun className="text-xl" />}
        </button>

        {/* Notification Bell */}
        <Link 
          to="/notifications" 
          className="btn btn-ghost btn-circle relative text-base-content hover:text-primary"
          title="Notifications"
        >
          <FiBell className="text-xl" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 badge badge-secondary badge-xs py-1 px-1.5 text-[9px] font-black animate-pulse">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User Dropdown */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
            <div className="w-10 rounded-full bg-primary text-white font-bold border-2 border-secondary/50">
              {user?.name ? user.name.split(" ").map(n=>n[0]).join("") : "PF"}
            </div>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-2xl bg-base-200 rounded-box w-52 border border-base-300">
            <li className="menu-title px-4 py-2 text-xs font-bold uppercase text-base-content/50">My Account</li>
            <li><Link to="/profile">Profile Settings</Link></li>
            <li><Link to="/wallet">Wallet & Cards</Link></li>
            <li><Link to="/history">Transaction History</Link></li>
            <div className="divider my-1"></div>
            <li>
              <button onClick={logout} className="text-error font-bold hover:bg-error/10">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
