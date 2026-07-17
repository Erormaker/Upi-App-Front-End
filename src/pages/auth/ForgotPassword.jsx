// src/pages/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      toast.success("Verification code sent! Please check your email.");
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}&mode=reset`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
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
        <Link to="/login" className="btn btn-ghost btn-circle btn-sm text-base-content">
          <FiArrowLeft className="text-lg" />
        </Link>
        <span className="text-xs font-bold text-base-content/65 uppercase tracking-wider">Back to Login</span>
      </div>

      <div className="text-left mb-6">
        <h2 className="text-2xl font-bold text-base-content">Forgot Password?</h2>
        <p className="text-xs text-base-content/65 mt-1">
          Don't worry. Enter your registered email and we'll send a 6-digit OTP code to verify your identity.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-semibold text-xs">Registered Email Address</span>
          </label>
          <div className="relative flex items-center">
            <FiMail className="absolute left-3.5 text-base-content/50 text-md" />
            <input
              type="email"
              placeholder="alex@example.com"
              className={`input input-bordered w-full pl-10 text-sm ${errors.email ? 'input-error' : ''}`}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
          </div>
          {errors.email && (
            <span className="text-error text-[10px] mt-1 font-bold">{errors.email.message}</span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn border-none w-full bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] hover:brightness-115 active:scale-95 text-white font-black transition-all duration-150 mt-2 shadow-md shadow-primary/10"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loading loading-spinner text-white"></span>
          ) : (
            'Request Verification OTP'
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default ForgotPassword;
