// src/layouts/DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BottomNavigation from '../components/BottomNavigation';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  FiX, 
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

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();

  const handleLinkClick = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-base-100 flex text-base-content font-sans">
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-h-screen relative pb-16 lg:pb-0 overflow-x-hidden">
        {/* Navbar */}
        <Navbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        
        {/* Inner Page View */}
        <main className="flex-grow p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
        
        {/* Bottom Nav - Mobile */}
        <BottomNavigation />
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            
            {/* Drawer Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-base-200 z-50 p-4 flex flex-col lg:hidden shadow-2xl border-r border-base-300"
            >
              {/* Header */}
              <div className="flex justify-between items-center py-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
                    <span className="font-extrabold text-white text-sm">QP</span>
                  </div>
                  <span className="text-lg font-bold text-primary dark:text-white">
                    Quick<span className="text-secondary font-black">-Pay</span>
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn btn-ghost btn-circle text-base-content"
                  aria-label="Close menu"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              {/* User Summary */}
              <div className="flex items-center gap-3 p-3 bg-base-100 rounded-xl border border-base-300/40 my-3 shadow-sm mx-1">
                <div className="avatar placeholder">
                  <div className="w-10 rounded-full bg-primary text-white font-bold">
                    {user?.name ? user.name.split(" ").map(n=>n[0]).join("") : "PF"}
                  </div>
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold truncate text-base-content">{user?.name}</h4>
                  <p className="text-[10px] text-base-content/65 truncate">{user?.upiId}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 space-y-1 py-4 overflow-y-auto px-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleLinkClick(item.path)}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                        window.location.pathname === item.path
                          ? 'bg-gradient-to-r from-primary to-primary/95 text-white shadow-md'
                          : 'text-base-content/75 hover:bg-base-300 hover:text-base-content'
                      }`}
                    >
                      <Icon className="text-lg" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Active Users */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-success/15 rounded-xl border border-success/20 mb-4 mx-1">
                <FiActivity className="text-success animate-pulse text-sm" />
                <span className="text-xs font-semibold text-success">{onlineUsers} Online Users</span>
              </div>

              {/* Logout Button */}
              <div className="border-t border-base-300/80 pt-4">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-error hover:bg-error/10 font-bold rounded-xl text-sm transition-colors duration-200 text-left"
                >
                  <FiLogOut className="text-lg" />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
