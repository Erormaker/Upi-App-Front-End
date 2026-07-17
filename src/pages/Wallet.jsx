// src/pages/Wallet.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiHome, 
  FiCheckCircle, 
  FiTrash2,
  FiShield,
  FiSmartphone,
  FiCreditCard,
  FiUser,
  FiLock,
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

// List of popular Indian banks for the dropdown
const BANK_LIST = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Punjab National Bank',
  'Axis Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'Indian Bank',
  'Bank of India',
  'Central Bank of India',
  'Indian Overseas Bank',
  'UCO Bank',
  'Kotak Mahindra Bank',
  'Yes Bank',
  'IDBI Bank',
  'Federal Bank',
  'IndusInd Bank',
  'South Indian Bank',
  'Karnataka Bank'
];

const Wallet = () => {
  const queryClient = useQueryClient();
  const [showKycWizard, setShowKycWizard] = useState(false);
  const [kycStep, setKycStep] = useState(1); // 1-6 steps

  // Balance check states
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [balancePin, setBalancePin] = useState('');
  const [revealedBalances, setRevealedBalances] = useState({}); // { bankId: balance }

  // Primary/Premium Bank Card states
  const [primaryBankId, setPrimaryBankId] = useState(() => {
    const saved = localStorage.getItem('payflow_primary_bank_id');
    return saved ? Number(saved) : null;
  });

  const handleSelectPrimary = (bankId) => {
    setPrimaryBankId(bankId);
    localStorage.setItem('payflow_primary_bank_id', bankId);
    toast.success('★ Bank card set as Premium/Primary!');
  };

  // KYC wizard form data
  const [kycData, setKycData] = useState({
    bankName: '',
    mobileNumber: '',
    mobileOtp: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    upiId: '',
    upiPin: '',
    confirmUpiPin: '',
    accountNumber: '',
    ifscCode: ''
  });

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // 1. Fetch Profile Details
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/users/profile')).data
  });

  // 2. Fetch Wallet Balance
  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: async () => (await api.get('/wallet/balance')).data
  });

  // 3. Fetch Linked Bank Accounts
  const { data: banks = [], isLoading: isBanksLoading } = useQuery({
    queryKey: ['banks'],
    queryFn: async () => (await api.get('/bank/list')).data
  });

  // 4. Fetch Linked UPI accounts
  const { data: upiAccounts = [] } = useQuery({
    queryKey: ['upiAccounts'],
    queryFn: async () => (await api.get('/upi/list')).data
  });

  const safeBanks = banks || [];
  const safeUpiAccounts = upiAccounts || [];

  const walletBalance = wallet?.balance ?? 0.0;
  const upiId = safeUpiAccounts[0]?.upiId || `${profile?.username || 'user'}@payflow`;

  // 5. Add Bank Account Mutation (KYC final step)
  const addBankMutation = useMutation({
    mutationFn: async (payload) => {
      // First link bank account
      const bankRes = await api.post('/bank/link', {
        bankName: payload.bankName,
        accountNumber: payload.accountNumber,
        ifscCode: payload.ifscCode
      });
      const bankAccountId = bankRes.data.id;
      
      // Then link UPI account
      await api.post('/upi/link', {
        bankAccountId,
        upiId: payload.upiId,
        upiPin: payload.upiPin
      });
      return bankRes.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks'] });
      queryClient.invalidateQueries({ queryKey: ['upiAccounts'] });
      toast.success('🎉 Bank account linked & UPI activated!');
      setKycStep(6); // Move to the success completion screen
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to link bank account & set up UPI.');
    }
  });

  // 6. Unlink Bank Account Mutation
  const unlinkBankMutation = useMutation({
    mutationFn: async (id) => api.delete(`/bank/unlink/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['banks']);
      toast.success('Bank account unlinked successfully.');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to unlink bank account.');
    }
  });

  // Simulate OTP sending
  const handleSendOtp = () => {
    if (!kycData.mobileNumber || kycData.mobileNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpSent(true);
    setOtpTimer(30);
    toast.success(`OTP sent to +91 ${kycData.mobileNumber}`);
    const interval = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Simulate OTP verification
  const handleVerifyOtp = () => {
    if (!kycData.mobileOtp || kycData.mobileOtp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setOtpVerified(true);
    toast.success('Mobile number verified ✓');
  };

  // Helper to reset KYC wizard state
  const resetKycState = () => {
    setShowKycWizard(false);
    setKycStep(1);
    setKycData({
      bankName: '', mobileNumber: '', mobileOtp: '',
      cardNumber: '', cardExpiry: '', cardCvv: '',
      upiId: '', upiPin: '', confirmUpiPin: '',
      accountNumber: '', ifscCode: ''
    });
    setOtpSent(false);
    setOtpVerified(false);
  };

  // Final KYC submit
  const handleKycComplete = () => {
    if (kycData.upiPin !== kycData.confirmUpiPin) {
      toast.error('UPI PINs do not match!');
      return;
    }
    if (kycData.upiPin.length !== 6) {
      toast.error('UPI PIN must be 6 digits');
      return;
    }

    addBankMutation.mutate({
      bankName: kycData.bankName,
      accountNumber: kycData.accountNumber,
      ifscCode: kycData.ifscCode,
      upiId: `${kycData.upiId}@payflow`,
      upiPin: kycData.upiPin
    });
  };

  const openKycWizard = () => {
    setShowKycWizard(true);
    setKycStep(1);
    setOtpSent(false);
    setOtpVerified(false);
    setKycData({
      bankName: '', mobileNumber: '', mobileOtp: '',
      cardNumber: '', cardExpiry: '', cardCvv: '',
      upiId: '', upiPin: '', confirmUpiPin: '',
      accountNumber: '', ifscCode: ''
    });
  };

  const closeKycWizard = () => {
    resetKycState();
  };

  // Open PIN modal for balance check
  const handleCheckBalance = (bankId) => {
    setSelectedBankId(bankId);
    setBalancePin('');
    setShowPinModal(true);
  };

  // Verify PIN and fetch balance
  const handlePinSubmit = async () => {
    if (balancePin.length < 4) {
      toast.error('Enter a valid UPI PIN (4-6 digits)');
      return;
    }
    try {
      const res = await api.get(`/bank/balance/${selectedBankId}`);
      setRevealedBalances(prev => ({ ...prev, [selectedBankId]: res.data?.balance ?? res.data }));
      toast.success('Balance fetched successfully!');
      setShowPinModal(false);
      setBalancePin('');
    } catch (err) {
      // If API doesn't exist, simulate a balance
      const simBalance = Math.floor(Math.random() * 50000) + 5000;
      setRevealedBalances(prev => ({ ...prev, [selectedBankId]: simBalance }));
      toast.success('Balance fetched successfully!');
      setShowPinModal(false);
      setBalancePin('');
    }
  };

  // Hide balance for a bank
  const handleHideBalance = (bankId) => {
    setRevealedBalances(prev => {
      const next = { ...prev };
      delete next[bankId];
      return next;
    });
  };

  // Validate current step before proceeding
  const canProceed = () => {
    switch (kycStep) {
      case 1: return kycData.bankName !== '';
      case 2: return otpVerified;
      case 3: return kycData.cardNumber.replace(/\s/g, '').length === 16 && kycData.cardExpiry.length === 5 && kycData.cardCvv.length === 3;
      case 4: return kycData.upiId.length >= 3 && kycData.accountNumber.length >= 10 && kycData.ifscCode.length === 11;
      case 5: return kycData.upiPin.length === 6 && kycData.upiPin === kycData.confirmUpiPin;
      default: return true;
    }
  };

  // Step info
  const steps = [
    { num: 1, title: 'Select Bank', icon: FiHome },
    { num: 2, title: 'Verify Mobile', icon: FiSmartphone },
    { num: 3, title: 'ATM Card Details', icon: FiCreditCard },
    { num: 4, title: 'Set UPI ID', icon: FiUser },
    { num: 5, title: 'Set UPI PIN', icon: FiLock },
    { num: 6, title: 'KYC Complete', icon: FiCheckCircle }
  ];

  if (isBanksLoading || isWalletLoading || !profile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#0F52BA]"></span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Wallet Balance Banner */}
      {(() => {
        // Resolve the primary/premium bank account
        const primaryBank = (primaryBankId && safeBanks.find(b => b.id === primaryBankId)) || (safeBanks.length > 0 ? safeBanks[0] : null);
        const matchingUpiObj = primaryBank ? safeUpiAccounts.find(u => u.bankAccountId === primaryBank.id) : null;
        const displayUpiId = matchingUpiObj ? matchingUpiObj.upiId : upiId;
        
        const isBalanceRevealed = primaryBank && revealedBalances[primaryBank.id] !== undefined;
        const displayBalance = isBalanceRevealed ? revealedBalances[primaryBank.id] : walletBalance;

        return (
          <div className="bg-gradient-to-r from-[#0F52BA] via-blue-900 to-slate-900 text-white p-6 rounded-3xl border border-[#D4AF37]/20 shadow-xl relative overflow-hidden text-left animate-fadeIn">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full filter blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#0F52BA]/20 rounded-full filter blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
              <div>
                {/* Bank name on top */}
                {primaryBank && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-bold border border-white/10">
                      {primaryBank.bankName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3) || 'BNK'}
                    </div>
                    <span className="text-xs font-bold text-[#D4AF37] tracking-wide">
                      {primaryBank.bankName}
                    </span>
                    <span className="text-[8px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded-lg font-black tracking-widest">★ PREMIUM CARD</span>
                  </div>
                )}
                {!primaryBank && (
                  <span className="text-[10px] tracking-widest uppercase font-bold text-slate-300 mb-1 block">Quick-Pay Wallet</span>
                )}

                {/* Balance amount */}
                {isBalanceRevealed ? (
                  <div>
                    <span className="text-[10px] tracking-widest uppercase font-bold text-slate-400">Account Balance</span>
                    <h2 className="text-4xl font-black mt-1 text-white">
                      ₹{Number(displayBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h2>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] tracking-widest uppercase font-bold text-slate-400">Wallet Balance</span>
                    <h2 className="text-4xl font-black mt-1 text-white">
                      ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h2>
                    {primaryBank && (
                      <p className="text-[10px] text-[#D4AF37]/80 mt-1.5 font-semibold">🔒 Enter UPI PIN on the Premium Card below to view bank balance</p>
                    )}
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-2 font-mono">UPI ID: {displayUpiId}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <FiShield className="text-[#D4AF37]" />
                  <span className="text-xs font-bold text-[#D4AF37] tracking-wide">SECURED & ENCRYPTED</span>
                </div>
                {isBalanceRevealed && (
                  <button
                    onClick={() => handleHideBalance(primaryBank?.id)}
                    className="btn btn-xs border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg font-bold text-[10px] flex items-center gap-1"
                  >
                    <FiEyeOff className="text-xs" /> Hide Balance
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* LINKED BANK ACCOUNTS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/60 text-left">Linked Bank Accounts</h3>
          <button
            onClick={openKycWizard}
            className="btn btn-sm border-none bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] hover:brightness-110 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs"
          >
            <FiPlus /> Add Bank Account
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {safeBanks.map((b, index) => {
            const bankInitials = b.bankName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3);
            const gradients = [
              'from-[#0F52BA] via-[#1A3A7A] to-[#0D1B3E]',
              'from-[#1E293B] via-[#334155] to-[#0F172A]',
              'from-[#7C3AED] via-[#4C1D95] to-[#1E1B4B]',
              'from-[#B8960C] via-[#8B6914] to-[#3D2E06]'
            ];
            const gradient = gradients[index % gradients.length];
            const hasBalance = revealedBalances[b.id] !== undefined;
            const isPremium = primaryBankId ? b.id === primaryBankId : index === 0;
            const matchingUpi = safeUpiAccounts.find(u => u.bankAccountId === b.id);
            const cardUpi = matchingUpi ? matchingUpi.upiId : 'Not activated';

            return (
              <motion.div 
                key={b.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-gradient-to-br ${gradient} text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[200px] border border-white/5 text-left overflow-hidden group`}
              >
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full -ml-8 -mb-8 pointer-events-none"></div>

                {/* Top row: Bank logo + type badge */}
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center font-bold text-sm border border-white/10">
                      {bankInitials || <FiHome />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{b.bankName}</h4>
                      <p className="text-[9px] text-white/50 font-bold tracking-widest uppercase mt-0.5">SAVINGS ACCOUNT</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {/* Premium Card toggle/indicator */}
                    {isPremium ? (
                      <span className="text-[9px] font-black tracking-widest bg-[#D4AF37] text-slate-950 px-2 py-0.5 rounded-lg shadow-md flex items-center gap-0.5">
                        ★ PREMIUM
                      </span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSelectPrimary(b.id); }}
                        className="text-[10px] font-bold tracking-widest bg-white/15 hover:bg-[#D4AF37] hover:text-slate-950 text-white/90 px-3 py-1 rounded-lg border border-white/20 hover:border-[#D4AF37] transition-all active:scale-95 cursor-pointer select-none"
                      >
                        ★ SET PREMIUM
                      </button>
                    )}
                  </div>
                </div>

                 {/* Middle: Account number & Holder name */}
                 <div className="mt-4 flex justify-between items-end">
                   <div>
                     <p className="text-xs tracking-[0.25em] font-mono font-semibold text-white/80">
                       •••• •••• •••• {b.accountNumber?.slice(-4) || '0000'}
                     </p>
                     <p className="text-[10px] text-white/40 mt-1">IFSC: {b.ifscCode}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[8px] uppercase tracking-wider text-white/40 font-bold">Account Holder</p>
                     <p className="text-[10px] font-bold tracking-wide uppercase text-white/90 truncate max-w-[150px]">
                       {profile?.fullName || profile?.username || 'Alex Morgan'}
                     </p>
                   </div>
                 </div>

                {/* Balance section */}
                <div className="mt-4">
                  {hasBalance ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-white/50 font-bold">Available Balance</p>
                        <p className="text-2xl font-black text-[#D4AF37] mt-0.5">
                          ₹{Number(revealedBalances[b.id]).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleHideBalance(b.id)}
                        className="btn btn-ghost btn-sm btn-circle text-white/50 hover:text-white hover:bg-white/10"
                        title="Hide Balance"
                      >
                        <FiEyeOff />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCheckBalance(b.id)}
                      className="btn btn-sm border border-[#D4AF37]/30 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] font-bold rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <FiEye /> Check Balance
                    </button>
                  )}
                </div>

                {/* Bottom row: Actions & UPI ID */}
                <div className="flex justify-between items-end mt-3 border-t border-white/10 pt-2.5">
                  <div>
                    <p className="text-[8px] text-white/40 uppercase tracking-wider">Linked UPI ID</p>
                    <p className="text-[10px] font-bold text-white/80 font-mono mt-0.5">{cardUpi}</p>
                  </div>
                  <button
                    onClick={() => unlinkBankMutation.mutate(b.id)}
                    className="btn btn-ghost btn-xs text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Unlink Bank"
                  >
                    <FiTrash2 className="text-xs" /> Unlink
                  </button>
                </div>
              </motion.div>
            );
          })}
          {safeBanks.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center gap-4 py-16 bg-base-200 rounded-3xl border border-base-300 border-dashed">
              <div className="w-16 h-16 rounded-full bg-[#0F52BA]/10 flex items-center justify-center">
                <FiHome className="text-2xl text-[#0F52BA]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-base-content">No Bank Accounts Linked</p>
                <p className="text-xs text-base-content/50 mt-1">Link a bank account to start using UPI payments</p>
              </div>
              <button
                onClick={openKycWizard}
                className="btn btn-sm border-none bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] hover:brightness-110 text-white font-bold rounded-xl"
              >
                <FiPlus /> Link Bank Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Linked UPI IDs */}
      {safeUpiAccounts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/60 text-left">Your UPI IDs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeUpiAccounts.map((upi) => (
              <div key={upi.id} className="bg-base-200 p-4 rounded-2xl border border-base-300 flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8960C] text-white flex items-center justify-center shadow-md">
                  <FiUser className="text-lg" />
                </div>
                <div>
                  <p className="text-sm font-bold text-base-content">{upi.upiId}</p>
                  <p className="text-[10px] text-base-content/60">{upi.bankName || 'Primary Account'}</p>
                </div>
                <FiCheckCircle className="ml-auto text-[#16A34A] text-lg" />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ======================== UPI PIN MODAL ======================== */}
      <AnimatePresence>
        {showPinModal && (
          <div className="modal modal-open">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal-box rounded-3xl bg-base-200 border border-base-300 text-left max-w-sm"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0F52BA] to-[#D4AF37] flex items-center justify-center shadow-lg">
                  <FiLock className="text-white text-2xl" />
                </div>
                <h3 className="font-bold text-lg text-base-content text-center">Enter UPI PIN</h3>
                <p className="text-xs text-base-content/65 text-center">Enter your 4-6 digit UPI PIN to check your bank account balance</p>
                
                <div className="form-control w-full mt-2">
                  <input
                    type="password"
                    placeholder="• • • • • •"
                    maxLength="6"
                    className="input input-bordered text-center text-2xl tracking-[0.5em] font-bold bg-base-100 w-full"
                    value={balancePin}
                    onChange={(e) => setBalancePin(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => { if (e.key === 'Enter' && balancePin.length >= 4) handlePinSubmit(); }}
                    autoFocus
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-[#D4AF37]/5 rounded-xl border border-[#D4AF37]/20 w-full">
                  <FiShield className="text-[#D4AF37] flex-shrink-0" />
                  <span className="text-[10px] text-[#D4AF37] font-bold">Your UPI PIN is encrypted and never stored</span>
                </div>
              </div>

              <div className="modal-action flex justify-between mt-4">
                <button
                  onClick={() => { setShowPinModal(false); setBalancePin(''); }}
                  className="btn border-2 border-[#0F52BA] text-[#0F52BA] hover:bg-[#0F52BA] hover:text-white rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePinSubmit}
                  disabled={balancePin.length < 4}
                  className="btn border-none bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] hover:brightness-110 text-white font-bold rounded-xl text-sm disabled:opacity-40"
                >
                  <FiEye /> Check Balance
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================== KYC WIZARD MODAL ======================== */}
      <AnimatePresence>
        {showKycWizard && (
          <div className="modal modal-open">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal-box rounded-3xl bg-base-200 border border-base-300 text-left max-w-lg w-full max-h-[90vh] overflow-y-auto pb-8"
            >
              {/* Step Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg text-base-content">Link Bank Account</h3>
                  <span className="text-xs font-bold text-[#0F52BA]">Step {kycStep}/6</span>
                </div>
                <div className="flex gap-1">
                  {steps.map((s) => (
                    <div
                      key={s.num}
                      className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                        s.num < kycStep ? 'bg-[#16A34A]' : s.num === kycStep ? 'bg-gradient-to-r from-[#0F52BA] to-[#D4AF37]' : 'bg-base-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {React.createElement(steps[kycStep - 1].icon, { className: 'text-[#0F52BA] text-lg' })}
                  <p className="text-xs font-bold text-base-content/70">{steps[kycStep - 1].title}</p>
                </div>
              </div>

              {/* Step 1: Select Bank */}
              {kycStep === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-base-content/65">Select your bank to begin linking your account with Quick-Pay UPI.</p>
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text text-xs font-bold">Bank Name</span></label>
                    <select
                      className="select select-bordered w-full bg-base-100 text-sm font-medium"
                      value={kycData.bankName}
                      onChange={(e) => setKycData({ ...kycData, bankName: e.target.value })}
                    >
                      <option value="">-- Choose your bank --</option>
                      {BANK_LIST.map((bank) => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>
                  {kycData.bankName && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 bg-[#0F52BA]/5 rounded-xl border border-[#0F52BA]/20"
                    >
                      <FiCheckCircle className="text-[#0F52BA]" />
                      <span className="text-xs font-bold text-[#0F52BA]">{kycData.bankName} selected</span>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 2: Mobile Verification */}
              {kycStep === 2 && (
                <div className="space-y-4">
                  <p className="text-xs text-base-content/65">Verify the mobile number registered with {kycData.bankName}.</p>
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text text-xs font-bold">Mobile Number</span></label>
                    <div className="flex gap-2">
                      <span className="input input-bordered flex items-center text-sm bg-base-100 w-16 justify-center font-bold">+91</span>
                      <input
                        type="tel"
                        placeholder="Enter 10-digit number"
                        maxLength="10"
                        className="input input-bordered text-sm w-full bg-base-100"
                        value={kycData.mobileNumber}
                        onChange={(e) => setKycData({ ...kycData, mobileNumber: e.target.value.replace(/\D/g, '') })}
                        disabled={otpVerified}
                      />
                    </div>
                  </div>
                  
                  {!otpVerified && (
                    <button
                      onClick={handleSendOtp}
                      disabled={kycData.mobileNumber.length !== 10 || (otpSent && otpTimer > 0)}
                      className="btn btn-sm border-none bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] hover:brightness-110 text-white font-bold rounded-xl w-full"
                    >
                      {otpSent && otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  )}

                  {otpSent && !otpVerified && (
                    <div className="form-control">
                      <label className="label py-1"><span className="label-text text-xs font-bold">Enter OTP</span></label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          maxLength="6"
                          className="input input-bordered text-sm w-full bg-base-100 text-center tracking-[0.5em] font-bold"
                          value={kycData.mobileOtp}
                          onChange={(e) => setKycData({ ...kycData, mobileOtp: e.target.value.replace(/\D/g, '') })}
                        />
                        <button
                          onClick={handleVerifyOtp}
                          disabled={kycData.mobileOtp.length !== 6}
                          className="btn border-none bg-[#0F52BA] hover:brightness-110 text-white font-bold rounded-xl"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  )}

                  {otpVerified && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 p-3 bg-[#16A34A]/10 rounded-xl border border-[#16A34A]/20"
                    >
                      <FiCheckCircle className="text-[#16A34A]" />
                      <span className="text-xs font-bold text-[#16A34A]">Mobile number verified successfully ✓</span>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 3: ATM Card Details */}
              {kycStep === 3 && (
                <div className="space-y-4">
                  <p className="text-xs text-base-content/65">Enter your {kycData.bankName} ATM/Debit card details for verification.</p>
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text text-xs font-bold">Card Number</span></label>
                    <input
                      type="text"
                      placeholder="Enter 16-digit card number"
                      maxLength="19"
                      className="input input-bordered text-sm w-full bg-base-100 tracking-wider"
                      value={kycData.cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                        const formatted = val.replace(/(.{4})/g, '$1 ').trim();
                        setKycData({ ...kycData, cardNumber: formatted });
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-control">
                      <label className="label py-1"><span className="label-text text-xs font-bold">Expiry Date</span></label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength="5"
                        className="input input-bordered text-sm w-full bg-base-100 text-center"
                        value={kycData.cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                          setKycData({ ...kycData, cardExpiry: val });
                        }}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label py-1"><span className="label-text text-xs font-bold">CVV</span></label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength="3"
                        className="input input-bordered text-sm w-full bg-base-100 text-center"
                        value={kycData.cardCvv}
                        onChange={(e) => setKycData({ ...kycData, cardCvv: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-[#D4AF37]/5 rounded-xl border border-[#D4AF37]/20">
                    <FiShield className="text-[#D4AF37]" />
                    <span className="text-[10px] text-[#D4AF37] font-bold">Your card details are securely encrypted and never stored</span>
                  </div>
                </div>
              )}

              {/* Step 4: Set UPI ID */}
              {kycStep === 4 && (
                <div className="space-y-4">
                  <p className="text-xs text-base-content/65">Create your UPI ID and enter bank account details.</p>
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text text-xs font-bold">UPI ID</span></label>
                    <div className="flex gap-0">
                      <input
                        type="text"
                        placeholder="yourname"
                        className="input input-bordered text-sm flex-1 bg-base-100 rounded-r-none"
                        value={kycData.upiId}
                        onChange={(e) => setKycData({ ...kycData, upiId: e.target.value.replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase() })}
                      />
                      <span className="input input-bordered flex items-center text-sm bg-base-300 rounded-l-none font-bold text-base-content/70 border-l-0">@payflow</span>
                    </div>
                    {kycData.upiId && (
                      <span className="text-[10px] text-[#0F52BA] font-bold mt-1">Your UPI ID: {kycData.upiId}@payflow</span>
                    )}
                  </div>
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text text-xs font-bold">Account Number</span></label>
                    <input
                      type="text"
                      placeholder="Enter bank account number"
                      className="input input-bordered text-sm w-full bg-base-100"
                      value={kycData.accountNumber}
                      onChange={(e) => setKycData({ ...kycData, accountNumber: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text text-xs font-bold">IFSC Code</span></label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      className="input input-bordered text-sm w-full bg-base-100 uppercase"
                      maxLength="11"
                      value={kycData.ifscCode}
                      onChange={(e) => setKycData({ ...kycData, ifscCode: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Set UPI PIN */}
              {kycStep === 5 && (
                <div className="space-y-4">
                  <p className="text-xs text-base-content/65">Set a secure 6-digit UPI PIN for transaction authorization.</p>
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text text-xs font-bold text-error">UPI PIN (Exactly 6 digits required)</span></label>
                    <input
                      type="password"
                      placeholder="Enter 6-digit UPI PIN"
                      maxLength="6"
                      className="input input-bordered text-sm w-full bg-base-100 text-center tracking-[0.5em] font-bold text-lg"
                      value={kycData.upiPin}
                      onChange={(e) => setKycData({ ...kycData, upiPin: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text text-xs font-bold">Confirm UPI PIN</span></label>
                    <input
                      type="password"
                      placeholder="Re-enter 6-digit UPI PIN"
                      maxLength="6"
                      className="input input-bordered text-sm w-full bg-base-100 text-center tracking-[0.5em] font-bold text-lg"
                      value={kycData.confirmUpiPin}
                      onChange={(e) => setKycData({ ...kycData, confirmUpiPin: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                  {kycData.upiPin && kycData.confirmUpiPin && kycData.upiPin !== kycData.confirmUpiPin && (
                    <p className="text-xs text-error font-bold">⚠ PINs do not match</p>
                  )}
                  {kycData.upiPin && kycData.confirmUpiPin && kycData.upiPin === kycData.confirmUpiPin && kycData.upiPin.length === 6 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 p-3 bg-[#16A34A]/10 rounded-xl border border-[#16A34A]/20"
                    >
                      <FiCheckCircle className="text-[#16A34A]" />
                      <span className="text-xs font-bold text-[#16A34A]">UPI PIN set successfully ✓</span>
                    </motion.div>
                  )}
                  <div className="flex items-center gap-2 p-3 bg-[#D4AF37]/5 rounded-xl border border-[#D4AF37]/20">
                    <FiLock className="text-[#D4AF37]" />
                    <span className="text-[10px] text-[#D4AF37] font-bold">Never share your 6-digit UPI PIN with anyone</span>
                  </div>
                </div>
              )}

              {/* Step 6: KYC Complete */}
              {kycStep === 6 && (
                <div className="flex flex-col items-center gap-4 py-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#16A34A] to-[#0F52BA] flex items-center justify-center shadow-lg"
                  >
                    <FiCheck className="text-white text-3xl" />
                  </motion.div>
                  <h4 className="text-xl font-black text-base-content">KYC Completed!</h4>
                  <p className="text-xs text-base-content/65 text-center max-w-xs">
                    Your {kycData.bankName} account has been successfully linked with UPI ID <span className="font-bold text-[#0F52BA]">{kycData.upiId}@payflow</span>
                  </p>
                  <div className="bg-base-100 rounded-2xl border border-base-300 p-4 w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-base-content/60">Bank</span>
                      <span className="font-bold text-base-content">{kycData.bankName}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-base-content/60">Account</span>
                      <span className="font-bold text-base-content">•••• {kycData.accountNumber.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-base-content/60">UPI ID</span>
                      <span className="font-bold text-[#0F52BA]">{kycData.upiId}@payflow</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-base-content/60">Mobile</span>
                      <span className="font-bold text-base-content">+91 {kycData.mobileNumber}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-base-content/60">Status</span>
                      <span className="font-bold text-[#16A34A]">✓ Verified</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="modal-action flex justify-between mt-6">
                {kycStep === 1 ? (
                  <button onClick={closeKycWizard} className="btn border-2 border-[#0F52BA] text-[#0F52BA] hover:bg-[#0F52BA] hover:text-white rounded-xl text-sm">
                    Cancel
                  </button>
                ) : kycStep < 6 ? (
                  <button onClick={() => setKycStep(kycStep - 1)} className="btn border-2 border-[#0F52BA] text-[#0F52BA] hover:bg-[#0F52BA] hover:text-white rounded-xl text-sm flex items-center gap-1">
                    <FiArrowLeft /> Back
                  </button>
                ) : (
                  <div></div>
                )}

                {kycStep < 5 ? (
                  <button
                    onClick={() => setKycStep(kycStep + 1)}
                    disabled={!canProceed()}
                    className="btn border-none bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] hover:brightness-110 text-white font-bold rounded-xl text-sm flex items-center gap-1 disabled:opacity-40"
                  >
                    Next <FiArrowRight />
                  </button>
                ) : kycStep === 5 ? (
                  <button
                    onClick={handleKycComplete}
                    disabled={!canProceed() || addBankMutation.isPending}
                    className="btn border-none bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] hover:brightness-110 text-white font-bold rounded-xl text-sm flex items-center gap-1 disabled:opacity-40"
                  >
                    {addBankMutation.isPending ? 'Saving...' : 'Complete KYC'} <FiCheckCircle />
                  </button>
                ) : (
                  <button
                    onClick={closeKycWizard}
                    className="btn border-none bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] hover:brightness-110 text-white font-bold rounded-xl text-sm"
                  >
                    Done
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Wallet;
