// src/pages/Contacts.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiSearch, FiUserPlus, FiStar, FiChevronRight, FiPhone, FiUserCheck } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

// Helper functions for dynamic avatar colors and initials
const getInitials = (name) => {
  if (!name) return 'U';
  return name.trim().charAt(0).toUpperCase();
};

const getAvatarColor = (name) => {
  const colors = [
    'from-blue-500 to-indigo-500',
    'from-green-500 to-emerald-500',
    'from-purple-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-red-500',
    'from-teal-500 to-cyan-500'
  ];
  let sum = 0;
  for (let i = 0; i < (name || '').length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

const Contacts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // 1. Fetch contacts from REST API
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const res = await api.get('/beneficiary');
      return res.data;
    }
  });

  // 2. Add contact mutation
  const addContactMutation = useMutation({
    mutationFn: async (newContact) => {
      return api.post('/beneficiary', newContact);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      toast.success('Beneficiary added successfully!');
      setShowAddModal(false);
      reset();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add contact');
    }
  });

  // 3. Toggle favorite contact mutation
  const favoriteMutation = useMutation({
    mutationFn: async (contactId) => {
      return api.patch(`/beneficiary/${contactId}/favorite`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      toast.success('Beneficiary updated!');
    },
    onError: (err) => {
      toast.error('Failed to update favorite status');
    }
  });

  const onSubmit = (data) => {
    addContactMutation.mutate({
      nickname: data.name,
      targetUpiId: data.upiId || '',
      targetAccountNumber: data.phone || '',
      targetIfscCode: '',
      isFavorite: false
    });
  };

  const toggleFavorite = (contact) => {
    favoriteMutation.mutate(contact.id);
  };

  // Filter contacts locally based on search term
  const filteredContacts = contacts.filter(c => {
    const search = searchTerm.toLowerCase();
    return (
      c.nickname.toLowerCase().includes(search) ||
      (c.targetUpiId && c.targetUpiId.toLowerCase().includes(search)) ||
      (c.targetAccountNumber && c.targetAccountNumber.toLowerCase().includes(search))
    );
  });

  const favorites = filteredContacts.filter(c => c.favorite);
  const others = filteredContacts.filter(c => !c.favorite);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-left">
          <h2 className="text-xl font-bold text-base-content">Contacts & Beneficiaries</h2>
          <p className="text-xs text-base-content/65">Search and select beneficiaries for instant payment settlement.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn border-none bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] hover:brightness-110 text-white font-bold rounded-xl text-xs flex items-center gap-2"
        >
          <FiUserPlus />
          <span>Add Beneficiary</span>
        </button>
      </div>

      {/* Search Box */}
      <div className="relative flex items-center">
        <FiSearch className="absolute left-4 text-base-content/50 text-md" />
        <input
          type="text"
          placeholder="Search nickname, phone/account number or UPI ID..."
          className="input input-bordered w-full pl-11 pr-4 bg-base-200 text-sm focus:bg-base-100 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* FAVORITE CONTACTS CARD GRID */}
          {favorites.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 text-left">
                <FiStar className="text-secondary fill-secondary" /> Favorites
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {favorites.map((c) => {
                  const initials = getInitials(c.nickname);
                  const avatarColor = getAvatarColor(c.nickname);
                  return (
                    <motion.div
                      key={c.id}
                      whileHover={{ y: -3 }}
                      className="bg-base-200 border border-base-300 p-4 rounded-3xl flex flex-col items-center relative overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFavorite(c)}
                        className="absolute top-2 right-2 text-secondary hover:scale-110 transition-transform"
                      >
                        <FiStar className="fill-secondary text-sm" />
                      </button>

                      <div 
                        onClick={() => navigate(`/transfer?tab=send&to=${encodeURIComponent(c.targetUpiId || c.targetAccountNumber)}`)}
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${avatarColor} text-white flex items-center justify-center font-bold text-md shadow-md`}>
                          {initials}
                        </div>
                        <h4 className="text-xs font-bold mt-3 text-base-content truncate max-w-[120px]">{c.nickname}</h4>
                        <p className="text-[10px] text-base-content/65 mt-0.5 truncate max-w-[120px]">{c.targetUpiId || c.targetAccountNumber}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ALL CONTACTS LIST */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 text-left">All Beneficiaries</h3>
            <div className="bg-base-200 rounded-3xl border border-base-300 divide-y divide-base-300/40 overflow-hidden">
              {others.map((c) => {
                const initials = getInitials(c.nickname);
                const avatarColor = getAvatarColor(c.nickname);
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-4 hover:bg-base-300/30 transition-colors"
                  >
                    <div 
                      onClick={() => navigate(`/transfer?tab=send&to=${encodeURIComponent(c.targetUpiId || c.targetAccountNumber)}`)}
                      className="flex items-center gap-3 cursor-pointer flex-1 text-left"
                    >
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                        {initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-base-content">{c.nickname}</h4>
                        <p className="text-[10px] text-base-content/65 mt-0.5">{c.targetUpiId || c.targetAccountNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFavorite(c)}
                        className="btn btn-ghost btn-circle btn-sm text-base-content/40 hover:text-secondary"
                      >
                        <FiStar className="text-sm" />
                      </button>
                      <button
                        onClick={() => navigate(`/transfer?tab=send&to=${encodeURIComponent(c.targetUpiId || c.targetAccountNumber)}`)}
                        className="btn btn-ghost btn-circle btn-sm text-base-content/60"
                      >
                        <FiChevronRight className="text-sm" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {others.length === 0 && favorites.length === 0 && (
                <div className="p-8 text-center text-xs text-base-content/50">
                  No beneficiaries found. Click "Add Beneficiary" to link one!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- ADD BENEFICIARY MODAL --- */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box rounded-3xl bg-base-200 border border-base-300 text-left">
            <h3 className="font-bold text-lg text-base-content">Add New Beneficiary</h3>
            <p className="text-xs text-base-content/65 mt-1">Save contact details for quick future money transfers.</p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 my-4">
              {/* Name */}
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-xs font-bold">Nickname</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. Priyanth" 
                  className={`input input-bordered bg-base-100 text-sm ${errors.name ? 'input-error' : ''}`}
                  {...register('name', { required: 'Name/Nickname is required' })}
                />
                {errors.name && <span className="text-[10px] text-error mt-1">{errors.name.message}</span>}
              </div>

              {/* Account Number */}
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-xs font-bold">Phone or Account Number (Optional)</span></label>
                <div className="relative flex items-center">
                  <FiPhone className="absolute left-3 text-base-content/50" />
                  <input 
                    type="text" 
                    placeholder="e.g. 9876543210" 
                    className="input input-bordered bg-base-100 pl-10 text-sm w-full"
                    {...register('phone')}
                  />
                </div>
              </div>

              {/* UPI ID */}
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-xs font-bold">UPI ID (Optional)</span></label>
                <div className="relative flex items-center">
                  <FiUserCheck className="absolute left-3 text-base-content/50" />
                  <input 
                    type="text" 
                    placeholder="e.g. priyanth@payflow" 
                    className={`input input-bordered bg-base-100 pl-10 text-sm w-full ${errors.upiId ? 'input-error' : ''}`}
                    {...register('upiId', {
                      pattern: {
                        value: /^[\w.-]+@[\w.-]+$/,
                        message: 'Invalid UPI ID format (e.g. name@bank)'
                      }
                    })}
                  />
                </div>
                {errors.upiId && <span className="text-[10px] text-error mt-1">{errors.upiId.message}</span>}
              </div>

              <div className="modal-action">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-ghost rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn border-none bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] hover:brightness-110 text-white font-bold rounded-xl text-sm"
                  disabled={addContactMutation.isPending}
                >
                  {addContactMutation.isPending ? 'Saving...' : 'Add Beneficiary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
