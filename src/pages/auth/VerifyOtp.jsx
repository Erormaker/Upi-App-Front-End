// src/pages/auth/VerifyOtp.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const VerifyOtp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const tempOtp = sessionStorage.getItem('temp_reg_otp');
    console.log("DEBUG RETRIEVED TEMP OTP:", tempOtp);
    if (tempOtp && tempOtp.length === 6) {
      setOtp(tempOtp.split(''));
      sessionStorage.removeItem('temp_reg_otp');
      toast.success(`Development auto-fill: OTP is ${tempOtp}`, { duration: 6000 });
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Focus previous on backspace
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleResend = () => {
    setTimer(60);
    toast.success("New 6-digit verification code sent!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    const mode = searchParams.get('mode') || 'register';

    setIsLoading(true);
    try {
      if (mode === 'reset') {
        toast.success("Code entered! Set your new password.");
        navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${fullOtp}`);
      } else {
        await api.post(`/auth/verify-email?email=${encodeURIComponent(email)}&code=${fullOtp}`);
        toast.success("Email verified successfully! You can now login.");
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP code entered.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card bg-base-200 shadow-2xl p-6 md:p-8 border border-base-300"
    >
      <div className="flex items-center gap-2 mb-4">
        <Link to={`/forgot-password`} className="btn btn-ghost btn-circle btn-sm text-base-content">
          <FiArrowLeft className="text-lg" />
        </Link>
        <span className="text-xs font-bold text-base-content/65 uppercase tracking-wider">Change Email</span>
      </div>

      <div className="text-left mb-6">
        <h2 className="text-2xl font-bold text-base-content">Verify OTP</h2>
        <p className="text-xs text-base-content/65 mt-1">
          We have sent a verification code to <span className="font-bold text-primary dark:text-secondary">{email}</span>. Please enter it below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input Fields */}
        <div className="flex justify-between gap-2">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              name="otp-input"
              maxLength="1"
              className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-base-300 bg-base-100 text-base-content focus:border-primary focus:outline-none transition-colors duration-200"
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>

        <button
          type="submit"
          className="btn border-none w-full bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] hover:brightness-115 active:scale-95 text-white font-black transition-all duration-150 shadow-md shadow-primary/10"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loading loading-spinner text-white"></span>
          ) : (
            'Verify & Continue'
          )}
        </button>
      </form>

      {/* Timer & Resend Option */}
      <div className="text-center mt-6 text-xs">
        {timer > 0 ? (
          <p className="text-base-content/60">
            Resend code in <span className="font-bold text-secondary">{timer}s</span>
          </p>
        ) : (
          <button 
            type="button"
            onClick={handleResend}
            className="text-primary dark:text-secondary font-bold hover:underline"
          >
            Resend Verification OTP
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default VerifyOtp;
