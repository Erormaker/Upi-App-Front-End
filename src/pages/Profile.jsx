// src/pages/Profile.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  FiUser, 
  FiShield, 
  FiBell, 
  FiCheckCircle, 
  FiCamera, 
  FiSun, 
  FiMoon, 
  FiToggleLeft, 
  FiToggleRight,
  FiBriefcase
} from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useTheme();
  
  // KYC Submission form states
  const [docType, setDocType] = useState('PAN');
  const [docNumber, setDocNumber] = useState('');

  // 1. Fetch Profile Info
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/users/profile')).data
  });

  // 2. Fetch Linked UPI accounts
  const { data: upiAccounts = [] } = useQuery({
    queryKey: ['upiAccounts'],
    queryFn: async () => (await api.get('/upi/list')).data
  });

  const upiId = upiAccounts[0]?.upiId || `${profile?.username || 'user'}@payflow`;

  // Local settings states (saved to localStorage as they are non-sensitive configuration)
  const [securitySettings, setSecuritySettings] = useState(() => {
    const saved = localStorage.getItem('payflow_security_settings');
    return saved ? JSON.parse(saved) : { twoFactor: true, biometrics: false, autoLock: true };
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('payflow_notification_settings');
    return saved ? JSON.parse(saved) : { payments: true, promotions: true, securityAlerts: true };
  });

  // KYC Mutation
  const kycMutation = useMutation({
    mutationFn: async (kycData) => api.post('/users/kyc', kycData),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      toast.success('KYC documents submitted successfully!');
      setDocNumber('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'KYC submission failed.');
    }
  });

  const handleToggleSecurity = (field) => {
    const newSettings = { ...securitySettings, [field]: !securitySettings[field] };
    setSecuritySettings(newSettings);
    localStorage.setItem('payflow_security_settings', JSON.stringify(newSettings));
    toast.success('Security settings updated!');
  };

  const handleToggleNotification = (field) => {
    const newSettings = { ...notifications, [field]: !notifications[field] };
    setNotifications(newSettings);
    localStorage.setItem('payflow_notification_settings', JSON.stringify(newSettings));
    toast.success('Notification settings updated!');
  };

  const handleKycSubmit = (e) => {
    e.preventDefault();
    if (!docNumber) {
      toast.error('Please enter a document number');
      return;
    }
    kycMutation.mutate({
      documentType: docType,
      documentNumber: docNumber
    });
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const initials = profile.fullName 
    ? profile.fullName.split(" ").map(n => n[0]).join("")
    : profile.username.substring(0, 2).toUpperCase();

  const isVerified = profile.status === 'VERIFIED';

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-base-content">My Profile & Settings</h2>
        <p className="text-xs text-base-content/65">Manage your personal security keys, notification filters, and visual theme settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PART 1: PERSONAL PROFILE DISPLAY */}
        <div className="bg-base-200 p-6 rounded-3xl border border-base-300 flex flex-col items-center text-center col-span-1 shadow-sm h-fit space-y-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center font-bold text-2xl border-4 border-secondary shadow-lg">
              {initials}
            </div>
            <button 
              className="absolute -bottom-1 -right-1 p-2 bg-secondary text-neutral hover:bg-secondary-focus rounded-xl shadow-md"
              title="Change Avatar"
            >
              <FiCamera className="text-xs" />
            </button>
          </div>

          <div className="w-full">
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="text-base font-bold text-base-content">{profile.fullName || profile.username}</h3>
              {isVerified && (
                <span className="badge badge-success text-[8px] font-black text-white px-1.5 py-0.5">KYC VERIFIED</span>
              )}
            </div>
            <p className="text-xs text-base-content/60 mt-1">{profile.email}</p>
            <p className="text-xs text-base-content/75 font-semibold mt-0.5">{profile.phoneNumber || 'No phone linked'}</p>
            
            <div className="divider my-4"></div>
            
            {/* Display UPI Address */}
            <div className="bg-base-100 p-3 rounded-2xl border border-base-300/40 text-center select-all cursor-pointer" title="Click to copy UPI ID">
              <span className="text-[10px] uppercase font-bold tracking-widest text-base-content/40 block">Primary UPI ID</span>
              <span className="text-xs font-bold text-primary dark:text-secondary mt-1 block">{upiId}</span>
            </div>
          </div>

          {/* KYC Submission panel (Only if not verified yet) */}
          {!isVerified && (
            <div className="w-full bg-base-100 p-4 rounded-2xl border border-base-300/40 text-left space-y-3">
              <h4 className="text-xs font-bold text-base-content flex items-center gap-1.5">
                <FiShield className="text-secondary" /> Submit KYC Verification
              </h4>
              <form onSubmit={handleKycSubmit} className="space-y-3 text-xs">
                <div className="form-control">
                  <label className="label py-0.5"><span className="label-text-alt font-bold">Document Type</span></label>
                  <select 
                    className="select select-xs select-bordered bg-base-200"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    <option value="PAN">PAN Card</option>
                    <option value="AADHAAR">Aadhaar Card</option>
                    <option value="PASSPORT">Passport</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label py-0.5"><span className="label-text-alt font-bold">Document Number</span></label>
                  <input 
                    type="text" 
                    placeholder="Enter document number"
                    className="input input-xs input-bordered bg-base-200"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-xs border-none w-full bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] hover:brightness-110 text-white font-bold rounded-lg"
                  disabled={kycMutation.isPending}
                >
                  {kycMutation.isPending ? 'Submitting...' : 'Submit Documents'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* PART 2: PROFILE SETTINGS OPTIONS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* A. Theme & Display */}
          <div className="bg-base-200 p-5 rounded-3xl border border-base-300 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-base-content/50 flex items-center gap-2">
              <FiSun /> Display Theme
            </h4>
            <div className="flex items-center justify-between p-3.5 bg-base-100 rounded-2xl border border-base-300/40">
              <div>
                <h5 className="text-xs font-bold text-base-content">App Theme Switcher</h5>
                <p className="text-[10px] text-base-content/65 mt-0.5">Toggle between Dark and Light mode for PayFlow.</p>
              </div>
              <button 
                onClick={toggleTheme} 
                className="btn btn-sm border-none bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] hover:brightness-110 text-white flex items-center gap-1.5 font-bold rounded-xl"
              >
                {theme === 'payflowLight' ? (
                  <>
                    <FiMoon className="text-sm" />
                    <span className="text-xs">Dark Mode</span>
                  </>
                ) : (
                  <>
                    <FiSun className="text-sm" />
                    <span className="text-xs">Light Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* B. Security Settings */}
          <div className="bg-base-200 p-5 rounded-3xl border border-base-300 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-base-content/50 flex items-center gap-2">
              <FiShield /> Security & Privacy
            </h4>
            
            <div className="space-y-3">
              {[
                { key: 'twoFactor', title: 'Two-Factor Authentication', desc: 'Secure login checks with mobile OTP.' },
                { key: 'biometrics', title: 'Biometric Login lock', desc: 'Unlock wallet instantly using device fingerprint sensors.' },
                { key: 'autoLock', title: 'Session Auto-Lock (5m)', desc: 'Automatically log out inactive sessions.' }
              ].map((setting) => {
                const isActive = securitySettings[setting.key];
                return (
                  <div 
                    key={setting.key}
                    className="flex items-center justify-between p-3.5 bg-base-100 rounded-2xl border border-base-300/40"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-base-content">{setting.title}</h5>
                      <p className="text-[10px] text-base-content/65 mt-0.5">{setting.desc}</p>
                    </div>
                    <button
                      onClick={() => handleToggleSecurity(setting.key)}
                      className={`text-2xl transition-colors duration-200 focus:outline-none ${
                        isActive ? 'text-success' : 'text-base-content/30'
                      }`}
                      aria-label={`Toggle ${setting.title}`}
                    >
                      {isActive ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* C. Notification Settings */}
          <div className="bg-base-200 p-5 rounded-3xl border border-base-300 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-base-content/50 flex items-center gap-2">
              <FiBell /> Notification Channels
            </h4>

            <div className="space-y-3">
              {[
                { key: 'payments', title: 'Payment Alerts', desc: 'Receive instant push updates for money sent/received.' },
                { key: 'promotions', title: 'Offers & Promotions', desc: 'Keep track of cashbacks, scratch cards and reward cards.' },
                { key: 'securityAlerts', title: 'Security Warnings', desc: 'Alerts for logins, linked banks or password reset trials.' }
              ].map((notif) => {
                const isActive = notifications[notif.key];
                return (
                  <div 
                    key={notif.key}
                    className="flex items-center justify-between p-3.5 bg-base-100 rounded-2xl border border-base-300/40"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-base-content">{notif.title}</h5>
                      <p className="text-[10px] text-base-content/65 mt-0.5">{notif.desc}</p>
                    </div>
                    <button
                      onClick={() => handleToggleNotification(notif.key)}
                      className={`text-2xl transition-colors duration-200 focus:outline-none ${
                        isActive ? 'text-success' : 'text-base-content/30'
                      }`}
                      aria-label={`Toggle ${notif.title}`}
                    >
                      {isActive ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
