// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
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
      await login(data.username, data.password);
      navigate('/');
    } catch (err) {
      // toast is already triggered inside login context
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
      <div className="text-center mb-6 lg:hidden">
        {/* Logo shown on mobile layout instead of side panel */}
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
            <span className="font-extrabold text-white text-sm">QP</span>
          </div>
          <span className="text-xl font-bold tracking-wide text-primary dark:text-white">Quick-Pay</span>
        </div>
      </div>

      <div className="text-left mb-6">
        <h2 className="text-2xl font-bold text-base-content">Welcome Back!</h2>
        <p className="text-xs text-base-content/65 mt-1">Please sign in to access your digital wallet.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username Field */}
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-semibold text-xs">Username</span>
          </label>
          <div className="relative flex items-center">
            <FiUser className="absolute left-3.5 text-base-content/50 text-md" />
            <input
              type="text"
              placeholder="e.g. alexmorgan"
              className={`input input-bordered w-full pl-10 text-sm ${errors.username ? 'input-error' : ''}`}
              {...register('username', {
                required: 'Username is required',
              })}
            />
          </div>
          {errors.username && (
            <span className="text-error text-[10px] mt-1 font-bold">{errors.username.message}</span>
          )}
        </div>

        {/* Password Field */}
        <div className="form-control">
          <div className="flex justify-between items-center">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs">Password</span>
            </label>
            <Link to="/forgot-password" className="text-xs font-bold text-primary dark:text-secondary hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="relative flex items-center">
            <FiLock className="absolute left-3.5 text-base-content/50 text-md" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
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

        {/* Sign In Button */}
        <button
          type="submit"
          className="btn border-none w-full bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] hover:brightness-115 active:scale-95 text-white font-black transition-all duration-150 mt-2 shadow-md shadow-primary/10"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loading loading-spinner text-white"></span>
          ) : (
            'Sign In to PayFlow'
          )}
        </button>
      </form>

      {/* Register Redirect */}
      <div className="text-center mt-6">
        <p className="text-xs text-base-content/75">
          Don't have a wallet account?{' '}
          <Link to="/register" className="text-primary dark:text-secondary font-bold hover:underline">
            Register Now
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;
