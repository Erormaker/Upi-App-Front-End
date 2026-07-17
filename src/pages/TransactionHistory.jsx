// src/pages/TransactionHistory.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiCalendar, FiFilter, FiChevronDown, FiChevronUp, FiRepeat, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';

const TransactionHistory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); // all, today, weekly, monthly, custom
  const [statusFilter, setStatusFilter] = useState('all'); // all, SUCCESS, FAILED, PENDING
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Track expanded transaction card
  const [expandedTxId, setExpandedTxId] = useState(null);

  // 1. Fetch transactions (page size 100 for historical feed)
  const { data: txPage, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await api.get('/transactions/history', { params: { size: 100 } });
      return res.data;
    }
  });

  const transactionsRaw = txPage?.content || [];

  // 2. Filter transactions client-side for precision
  const filteredTransactions = transactionsRaw.filter(tx => {
    // A. Status Filter
    if (statusFilter !== 'all' && tx.status !== statusFilter) {
      return false;
    }

    // B. Search Term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = (tx.senderName || '').toLowerCase().includes(term) || 
                        (tx.receiverName || '').toLowerCase().includes(term);
      const matchDetails = (tx.description || '').toLowerCase().includes(term) ||
                           (tx.referenceId || '').toLowerCase().includes(term) ||
                           (tx.senderUpiId || '').toLowerCase().includes(term) ||
                           (tx.receiverUpiId || '').toLowerCase().includes(term);
      if (!matchName && !matchDetails) return false;
    }

    // C. Time Filter
    const txDate = new Date(tx.createdAt);
    const today = new Date();

    if (timeFilter === 'today') {
      if (txDate.toDateString() !== today.toDateString()) return false;
    } else if (timeFilter === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      if (txDate < oneWeekAgo) return false;
    } else if (timeFilter === 'monthly') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(today.getDate() - 30);
      if (txDate < oneMonthAgo) return false;
    } else if (timeFilter === 'custom') {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (txDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (txDate > end) return false;
      }
    }

    return true;
  });

  const toggleExpand = (id) => {
    setExpandedTxId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-left">
        <h2 className="text-xl font-bold text-base-content">Transaction History</h2>
        <p className="text-xs text-base-content/65">Track, filter, and audit all incoming and outgoing payments.</p>
      </div>

      {/* Filter and Search Bar controls */}
      <div className="bg-base-200 p-5 rounded-3xl border border-base-300 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative flex items-center col-span-1 md:col-span-2">
            <FiSearch className="absolute left-3.5 text-base-content/50" />
            <input
              type="text"
              placeholder="Search recipient, note, reference ID..."
              className="input input-sm input-bordered w-full pl-10 bg-base-100 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Time Filter Select */}
          <div className="form-control">
            <select
              className="select select-sm select-bordered bg-base-100 text-xs font-bold"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="all">All Times</option>
              <option value="today">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Picker Container */}
        {timeFilter === 'custom' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-2 gap-4 pt-1"
          >
            <div className="form-control text-left">
              <label className="label py-1"><span className="label-text text-[10px] font-bold">Start Date</span></label>
              <input
                type="date"
                className="input input-sm input-bordered bg-base-100 text-xs"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-control text-left">
              <label className="label py-1"><span className="label-text text-[10px] font-bold">End Date</span></label>
              <input
                type="date"
                className="input input-sm input-bordered bg-base-100 text-xs"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </motion.div>
        )}

        {/* Status filtering tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { id: 'all', label: 'All Statuses' },
            { id: 'SUCCESS', label: 'Success Only' },
            { id: 'FAILED', label: 'Failed' },
            { id: 'PENDING', label: 'Pending' }
          ].map(tag => (
            <button
              key={tag.id}
              onClick={() => setStatusFilter(tag.id)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                statusFilter === tag.id
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-base-100 text-base-content/75 border-base-300 hover:bg-base-300'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List display */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="bg-base-200 border border-base-300 p-10 rounded-3xl text-center">
              <FiAlertCircle className="text-3xl text-base-content/40 mx-auto mb-2" />
              <p className="text-xs text-base-content/65 font-bold">No transactions found matching the selected filters.</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isExpanded = expandedTxId === tx.id;
              const isReceive = tx.transactionType === 'RECEIVE' || tx.transactionType === 'DEPOSIT';
              
              const txTitle = isReceive 
                ? (tx.senderName ? `Received from ${tx.senderName}` : 'Received Funds')
                : (tx.receiverName ? `Sent to ${tx.receiverName}` : 'Sent Funds');

              const txDetail = tx.description || (isReceive ? 'Added to wallet' : 'Transferred via UPI');

              const formattedDate = tx.createdAt
                ? new Date(tx.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                : 'Unknown Date';

              const formattedTime = tx.createdAt
                ? new Date(tx.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : '';

              return (
                <div
                  key={tx.id}
                  className="bg-base-200 rounded-2xl border border-base-300 overflow-hidden shadow-sm hover:shadow transition-shadow duration-200"
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => toggleExpand(tx.id)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-base-300/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isReceive ? 'bg-success/15 text-success' : 'bg-red-500/15 text-red-500'
                      }`}>
                        {isReceive ? '+' : '-'}
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-base-content">{txTitle}</h4>
                        <p className="text-[9px] text-base-content/60 mt-0.5">{formattedDate} • {formattedTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`text-xs font-bold ${
                          isReceive ? 'text-success' : 'text-base-content'
                        }`}>
                          {isReceive ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                        </span>
                        <div className="mt-0.5">
                          <span className={`badge badge-xs font-black text-[9px] ${
                            tx.status === 'SUCCESS' ? 'badge-success text-white' : tx.status === 'FAILED' ? 'badge-error text-white' : 'badge-warning text-neutral'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                      {isExpanded ? <FiChevronUp className="text-base-content/50" /> : <FiChevronDown className="text-base-content/50" />}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="border-t border-base-300 bg-base-100/40 text-left overflow-hidden text-xs"
                      >
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-base-content/65">
                              <span className="font-bold">Transaction Reference ID:</span> <span className="select-all font-mono">{tx.referenceId || tx.id}</span>
                            </p>
                            <p className="text-base-content/65">
                              <span className="font-bold">Bank Reference Number:</span> <span className="select-all font-mono">UPI-{tx.referenceId || tx.id}</span>
                            </p>
                            <p className="text-base-content/65">
                              <span className="font-bold">Detail Description:</span> {txDetail}
                            </p>
                          </div>
                          
                          <div className="flex flex-col justify-end items-start sm:items-end gap-2">
                            {!isReceive && (tx.receiverUpiId || tx.targetAccountNumber) && (
                              <button
                                onClick={() => navigate(`/transfer?tab=send&to=${encodeURIComponent(tx.receiverUpiId || tx.targetAccountNumber)}`)}
                                className="btn btn-xs border-none bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] hover:brightness-110 text-white font-bold rounded-lg flex items-center gap-1.5"
                              >
                                <FiRepeat className="text-xs" />
                                <span>Repeat Payment</span>
                              </button>
                            )}
                            <span className="text-[10px] text-base-content/50">
                              Payment settled instantly under PayFlow Safe Network.
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
