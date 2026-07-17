// src/layouts/AuthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { FiShield, FiTrendingUp, FiZap } from 'react-icons/fi';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-base-100 flex text-base-content font-sans">
      {/* Left Banner Panel (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/95 to-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative Grid Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/15 rounded-full filter blur-[80px] -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-[100px] -ml-20 -mb-20"></div>

        {/* Brand Logo */}
        <div className="flex items-center gap-2 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
            <span className="font-extrabold text-secondary text-lg">QP</span>
          </div>
          <span className="text-xl font-bold tracking-wide text-white">
            Quick<span className="text-secondary font-black">-Pay</span>
          </span>
        </div>

        {/* Dynamic Marketing Graphic/Text */}
        <div className="my-auto relative z-10 space-y-8 max-w-lg">
          <h2 className="text-4xl font-extrabold leading-tight tracking-wide">
            Experience the next generation of <span className="text-secondary">UPI Payments</span>.
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Fast, secure, and smart money transfers. Linked with your favorite banks, credit cards, and digital assets. Track spending, win cashbacks, and split bills instantly.
          </p>

          {/* Core App Pillars */}
          <div className="space-y-4 pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl text-secondary border border-white/10 shadow">
                <FiZap className="text-xl" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Instant Settlements</h4>
                <p className="text-xs text-slate-400">Transfer funds in sub-seconds directly via bank accounts.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl text-secondary border border-white/10 shadow">
                <FiShield className="text-xl" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Bank-Grade Security</h4>
                <p className="text-xs text-slate-400">Multi-factor security pins, device-binding, and JWT-secured sessions.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl text-secondary border border-white/10 shadow">
                <FiTrendingUp className="text-xl" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Spend Analysis</h4>
                <p className="text-xs text-slate-400">Automatic spending breakdowns and growth tracking widgets.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-400 relative z-10 flex justify-between items-center">
          <span>© {new Date().getFullYear()} Quick-Pay Inc. All rights reserved.</span>
          <span>Version 1.0.0</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-base-100 relative">
        {/* Subtle background glows for light/dark mode */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full filter blur-[60px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/5 rounded-full filter blur-[60px] pointer-events-none"></div>
        
        {/* Outlet container */}
        <div className="w-full max-w-md relative z-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
