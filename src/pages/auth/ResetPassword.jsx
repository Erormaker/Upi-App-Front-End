// src/pages/auth/ResetPassword.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  const otp = searchParams.get('otp') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        recipient: email,
        otpCode: otp,
        newPassword: data.password,
      });
      toast.success('Password updated successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
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
        <h2 className="text-2xl font-bold text-base-content">Reset Password</h2>
        <p className="text-xs text-base-content/65 mt-1">
          Create a new strong password for your digital wallet.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password */}
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-semibold text-xs">New Password</span>
          </label>
          <div className="relative flex items-center">
            <FiLock className="absolute left-3.5 text-base-content/50 text-md" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 6 characters"
              className={`input input-bordered w-full pl-10 pr-10 text-sm ${errors.password ? 'input-error' : ''}`}
              {...register('password', {
                required: 'New Password is required',
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

        {/* Confirm Password */}
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-semibold text-xs">Confirm Password</span>
          </label>
          <div className="relative flex items-center">
            <FiLock className="absolute left-3.5 text-base-content/50 text-md" />
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm new password"
              className={`input input-bordered w-full pl-10 pr-10 text-sm ${errors.confirmPassword ? 'input-error' : ''}`}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 btn btn-ghost btn-circle btn-xs text-base-content/60"
            >
              {showConfirm ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="text-error text-[10px] mt-1 font-bold">{errors.confirmPassword.message}</span>
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
            'Reset Password'
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default ResetPassword;
