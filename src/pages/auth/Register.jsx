// src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Clean phone number: remove spaces, dashes, and leading +91
      let cleanPhone = data.phone.replace(/[\s-]/g, '');
      if (cleanPhone.startsWith('+91')) cleanPhone = cleanPhone.slice(3);
      if (cleanPhone.startsWith('91') && cleanPhone.length > 10) cleanPhone = cleanPhone.slice(2);
      
      const res = await signup(data.username, data.password, data.email, cleanPhone, data.name);
      console.log("DEBUG SIGNUP RESPONSE:", res);
      const match = res?.message?.match(/\d{6}$/);
      const otpCode = match ? match[0] : '';
      console.log("DEBUG EXTRACTED OTP:", otpCode);
      if (otpCode) {
        sessionStorage.setItem('temp_reg_otp', otpCode);
      }
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      // Errors handled in context toast
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
      <div className="text-left mb-6">
        <h2 className="text-2xl font-bold text-base-content">Create Wallet</h2>
        <p className="text-xs text-base-content/65 mt-1">Get started by creating your secure UPI wallet.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-semibold text-xs">Full Name</span>
          </label>
          <div className="relative flex items-center">
            <FiUser className="absolute left-3.5 text-base-content/50 text-md" />
            <input
              type="text"
              placeholder="e.g. John Doe"
              className={`input input-bordered w-full pl-10 text-sm ${errors.name ? 'input-error' : ''}`}
              {...register('name', { required: 'Full Name is required' })}
            />
          </div>
          {errors.name && (
            <span className="text-error text-[10px] mt-1 font-bold">{errors.name.message}</span>
          )}
        </div>

        {/* Username */}
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-semibold text-xs">Username</span>
          </label>
          <div className="relative flex items-center">
            <FiUser className="absolute left-3.5 text-base-content/50 text-md" />
            <input
              type="text"
              placeholder="e.g. johndoe1"
              className={`input input-bordered w-full pl-10 text-sm ${errors.username ? 'input-error' : ''}`}
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters',
                },
              })}
            />
          </div>
          {errors.username && (
            <span className="text-error text-[10px] mt-1 font-bold">{errors.username.message}</span>
          )}
        </div>

        {/* Email Address */}
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-semibold text-xs">Email Address</span>
          </label>
          <div className="relative flex items-center">
            <FiMail className="absolute left-3.5 text-base-content/50 text-md" />
            <input
              type="email"
              placeholder="e.g. john@example.com"
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

        {/* Phone Number */}
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-semibold text-xs">Phone Number (UPI Linked)</span>
          </label>
          <div className="relative flex items-center">
            <FiPhone className="absolute left-3.5 text-base-content/50 text-md" />
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              className={`input input-bordered w-full pl-10 text-sm ${errors.phone ? 'input-error' : ''}`}
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^(\+91)?[6-9][0-9]{9}$/,
                  message: 'Enter a valid 10-digit Indian phone number',
                },
              })}
            />
          </div>
          {errors.phone && (
            <span className="text-error text-[10px] mt-1 font-bold">{errors.phone.message}</span>
          )}
        </div>

        {/* Password */}
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-semibold text-xs">Security Password</span>
          </label>
          <div className="relative flex items-center">
            <FiLock className="absolute left-3.5 text-base-content/50 text-md" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 6 characters"
              className={`input input-bordered w-full pl-10 pr-10 text-sm ${errors.password ? 'input-error' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 btn btn-ghost btn-circle btn-xs text-base-content/60"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.password && (
            <span className="text-error text-[10px] mt-1 font-bold">{errors.password.message}</span>
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
            'Register & Create Wallet'
          )}
        </button>
      </form>

      {/* Redirect to Login */}
      <div className="text-center mt-6">
        <p className="text-xs text-base-content/75">
          Already have a PayFlow account?{' '}
          <Link to="/login" className="text-primary dark:text-secondary font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Register;
