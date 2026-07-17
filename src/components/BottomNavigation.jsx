// src/components/BottomNavigation.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiSend, 
  FiClock, 
  FiCreditCard, 
  FiUsers 
} from 'react-icons/fi';

const navItems = [
  { path: '/', label: 'Home', icon: FiHome },
  { path: '/transfer', label: 'Transfer', icon: FiSend },
  { path: '/history', label: 'History', icon: FiClock },
  { path: '/wallet', label: 'Wallet', icon: FiCreditCard },
  { path: '/contacts', label: 'Contacts', icon: FiUsers },
];

const BottomNavigation = () => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-base-200 border-t border-base-300 flex items-center justify-around z-30 px-2 pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'text-primary dark:text-secondary'
                  : 'text-base-content/65 hover:text-base-content'
              }`
            }
          >
            <Icon className="text-xl" />
            <span className="text-[10px] tracking-wide">{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
