// src/pages/transfer/MoneyTransfer.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSend, 
  FiBriefcase, 
  FiRefreshCw, 
  FiArrowRight, 
  FiCheckCircle, 
  FiXCircle, 
  FiLock,
  FiTrendingUp
} from 'react-icons/fi';
import { FaQrcode } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
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

const MoneyTransfer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Active tab selection
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'send');

  // Transaction form states
  const [payeeName, setPayeeName] = useState('');
  const [payeeUpi, setPayeeUpi] = useState('');
  const [payeePhone, setPayeePhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  
  // Bank transfer specific states
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('');

  // Self transfer specific states
  const [fromBankId, setFromBankId] = useState('');
  const [toBankId, setToBankId] = useState('');

  // QR Generate states
  const [qrAmount, setQrAmount] = useState('');

  // Flow control states
  const [step, setStep] = useState(1); // 1: Input Details, 2: Enter PIN, 3: Processing, 4: Result
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [socketStatus, setSocketStatus] = useState('');
  const [socketError, setSocketError] = useState('');
  const [finalTxId, setFinalTxId] = useState('');

  // 1. Fetch Linked Bank Accounts
  const { data: banks = [] } = useQuery({
    queryKey: ['banks'],
    queryFn: async () => (await api.get('/bank/list')).data
  });

  // 2. Fetch Saved Beneficiary Contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => (await api.get('/beneficiary')).data
  });

  // 3. Fetch Linked UPI accounts
  const { data: upiAccounts = [] } = useQuery({
    queryKey: ['upiAccounts'],
    queryFn: async () => (await api.get('/upi/list')).data
  });

  const upiId = upiAccounts[0]?.upiId || `${user?.username || 'user'}@payflow`;
  const fullName = user?.fullName || user?.username || 'PayFlow User';

  // Check URL query parameters for pre-filled transfer targets
  useEffect(() => {
    const toParam = searchParams.get('to');
    if (toParam) {
      // Find matching contact
      const match = contacts.find(c => c.targetUpiId === toParam || c.targetAccountNumber === toParam);
      if (match) {
        setPayeeName(match.nickname);
        setPayeeUpi(match.targetUpiId);
        setPayeePhone(match.targetAccountNumber); // Use account number if UPI is blank
      } else {
        setPayeePhone(toParam);
        setPayeeUpi(toParam.includes('@') ? toParam : '');
      }
    }
  }, [searchParams, contacts]);

  // Update tab in URL for cleaner route history
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setStep(1);
    setAmount('');
    setNote('');
    setPayeeName('');
    setPayeeUpi('');
    setPayeePhone('');
    setBankAccount('');
    setBankIfsc('');
    setBankName('');
  };

  // Select contact helper
  const handleSelectContact = (c) => {
    setPayeeName(c.nickname);
    setPayeeUpi(c.targetUpiId);
    setPayeePhone(c.targetAccountNumber || '');
  };

  // Submit First Step: Details Verification
  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (activeTab === 'send') {
      if (!payeeUpi && !payeePhone) {
        toast.error("Please enter a UPI ID or Account Number");
        return;
      }
      if (!payeeName) setPayeeName(payeeUpi || payeePhone);
    } else if (activeTab === 'bank') {
      if (!bankAccount || !bankIfsc || !bankName) {
        toast.error("Please fill in all bank details");
        return;
      }
      setPayeeName(`${bankName} Acc: ${bankAccount.slice(-4)}`);
      setPayeeUpi(''); // Clear UPI field
    } else if (activeTab === 'self') {
      if (!fromBankId || !toBankId || fromBankId === toBankId) {
        toast.error("Please select different source and destination bank accounts");
        return;
      }
      const toBank = banks.find(b => b.id === parseInt(toBankId));
      const fromBank = banks.find(b => b.id === parseInt(fromBankId));
      setPayeeName(toBank.bankName);
      setBankAccount(toBank.accountNumber);
      setBankIfsc(toBank.ifscCode);
      setBankName(toBank.bankName);
    }

    setPin(['', '', '', '', '', '']);
    setStep(2); // Go to PIN Entry
  };

  // UPI PIN keypad input helper
  const handlePinPress = (num) => {
    const nextIdx = pin.findIndex(val => val === '');
    if (nextIdx !== -1) {
      const newPin = [...pin];
      newPin[nextIdx] = num;
      setPin(newPin);

      // Submit once PIN is fully entered
      if (nextIdx === 5) {
        triggerSecurePayment(newPin.join(''));
      }
    }
  };

  const handlePinBackspace = () => {
    const lastFilledIdx = pin.map(v => v !== '').lastIndexOf(true);
    if (lastFilledIdx !== -1) {
      const newPin = [...pin];
      newPin[lastFilledIdx] = '';
      setPin(newPin);
    }
  };

  // STEP 3: Handle transaction via REST API Submit
  const triggerSecurePayment = async (fullPin) => {
    setStep(3); // Show processing screen
    setSocketStatus('Initiating secure transfer...');
    setSocketError('');

    try {
      let response;
      if (activeTab === 'qr') {
        // Scan & Pay
        response = await api.post('/transactions/qr-payment', {
          qrData: payeeUpi || payeePhone,
          amount: parseFloat(amount),
          upiPin: fullPin
        });
      } else {
        // Send / Bank / Self
        const selectedSenderUpi = activeTab === 'self'
          ? (upiAccounts.find(u => u.bankAccountId === parseInt(fromBankId))?.upiId || upiId)
          : upiId;

        const payload = {
          senderUpiId: selectedSenderUpi,
          receiverUpiId: activeTab === 'send' && payeeUpi ? payeeUpi.trim() : undefined,
          targetAccountNumber: activeTab === 'bank' || activeTab === 'self' ? bankAccount : undefined,
          targetIfscCode: activeTab === 'bank' || activeTab === 'self' ? bankIfsc : undefined,
          amount: parseFloat(amount),
          upiPin: fullPin,
          description: note || 'PayFlow Transfer'
        };
        response = await api.post('/transactions/send', payload);
      }

      const tx = response.data;
      setFinalTxId(tx.referenceId || tx.id.toString());

      setSocketStatus('Validating transaction status...');
      
      if (tx.status === 'SUCCESS') {
        setSocketStatus('Payment processed successfully!');
        queryClient.invalidateQueries(['walletBalance']);
        queryClient.invalidateQueries(['transactions']);
        queryClient.invalidateQueries(['profile']);
        
        setTimeout(() => {
          setStep(4); // Success outcome
          toast.success('Payment completed successfully!');
        }, 1000);
      } else {
        setSocketError(tx.errorMessage || 'Transaction declined by bank.');
        setStep(4);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Payment failed. Please verify details and PIN.';
      setSocketError(errorMsg);
      setStep(4);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 1. TABS HEADER (Only shown on Details Input step) */}
      {step === 1 && (
        <div className="flex bg-base-200 p-1.5 rounded-2xl border border-base-300 overflow-x-auto gap-1">
          {[
            { id: 'send', label: 'Send UPI', icon: FiSend },
            { id: 'bank', label: 'Bank Transfer', icon: FiBriefcase },
            { id: 'self', label: 'Self Transfer', icon: FiRefreshCw },
            { id: 'qr', label: 'Scan & Pay', icon: FaQrcode }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex-1 transition-all duration-200 ${
                activeTab === t.id 
                  ? 'bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] text-white shadow-md' 
                  : 'text-base-content/75 hover:bg-base-300 hover:text-base-content'
              }`}
            >
              <t.icon />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* 2. TRANSACTION STEPS PANELS */}
      <div className="bg-base-200 p-6 rounded-3xl border border-base-300 shadow-sm relative min-h-[380px] flex flex-col justify-between">
        
        {/* Step 1: Input transaction details */}
        {step === 1 && (
          <form onSubmit={handleDetailsSubmit} className="space-y-4 text-left flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-base-content mb-4 text-left">
                {activeTab === 'send' && "Send Money via UPI"}
                {activeTab === 'bank' && "Transfer to Bank Account"}
                {activeTab === 'self' && "Self Money Transfer"}
                {activeTab === 'qr' && "Scan / Generate QR Code"}
              </h3>

              {/* --- TAB VIEW A: SEND MONEY --- */}
              {activeTab === 'send' && (
                <div className="space-y-4">
                  {/* Enter Mobile or UPI ID */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs font-bold text-base-content/75">Recipient UPI ID or Mobile</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. name@payflow or +91 98765 43210"
                      className="input input-bordered bg-base-100 text-sm w-full"
                      value={payeeUpi || payeePhone}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.includes('@')) {
                          setPayeeUpi(val);
                          setPayeePhone('');
                        } else {
                          setPayeePhone(val);
                          setPayeeUpi('');
                        }
                      }}
                    />
                  </div>

                  {/* Quick Select Recent Contacts */}
                  <div>
                    <h4 className="text-[11px] uppercase tracking-widest text-base-content/50 font-bold mb-2">Recent Contacts</h4>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {contacts.map((c) => {
                        const initials = getInitials(c.nickname);
                        const avatarColor = getAvatarColor(c.nickname);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelectContact(c)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-base-100 border border-base-300 rounded-xl hover:bg-base-300 transition-colors"
                          >
                            <div className={`w-6 h-6 rounded-md bg-gradient-to-r ${avatarColor} text-white flex items-center justify-center text-[10px] font-bold`}>
                              {initials}
                            </div>
                            <span className="text-xs font-bold text-base-content whitespace-nowrap">{c.nickname}</span>
                          </button>
                        );
                      })}
                      {contacts.length === 0 && (
                        <span className="text-xs text-base-content/50">No saved contacts yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB VIEW B: BANK TRANSFER --- */}
              {activeTab === 'bank' && (
                <div className="space-y-3">
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text text-xs font-bold">Bank Name</span></label>
                    <input 
                      type="text" 
                      placeholder="e.g. HDFC Bank, SBI" 
                      className="input input-bordered bg-base-100 text-sm"
                      value={bankName}
                      onChange={(e)=>setBankName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="form-control">
                      <label className="label py-1"><span className="label-text text-xs font-bold">Account Number</span></label>
                      <input 
                        type="password" 
                        placeholder="Enter full account number" 
                        className="input input-bordered bg-base-100 text-sm"
                        value={bankAccount}
                        onChange={(e)=>setBankAccount(e.target.value)}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label py-1"><span className="label-text text-xs font-bold">IFSC Code</span></label>
                      <input 
                        type="text" 
                        placeholder="e.g. HDFCN000214" 
                        className="input input-bordered bg-base-100 text-sm uppercase"
                        value={bankIfsc}
                        onChange={(e)=>setBankIfsc(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB VIEW C: SELF TRANSFER --- */}
              {activeTab === 'self' && (
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text text-xs font-bold text-base-content/75">From Bank Account</span></label>
                    <select 
                      className="select select-bordered bg-base-100 text-sm"
                      value={fromBankId}
                      onChange={(e)=>setFromBankId(e.target.value)}
                    >
                      <option value="">Select Source Account</option>
                      {banks.map(b => (
                        <option key={b.id} value={b.id}>{b.bankName} ({b.accountNumber.slice(-4)})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text text-xs font-bold text-base-content/75">To Bank Account</span></label>
                    <select 
                      className="select select-bordered bg-base-100 text-sm"
                      value={toBankId}
                      onChange={(e)=>setToBankId(e.target.value)}
                    >
                      <option value="">Select Destination Account</option>
                      {banks.map(b => (
                        <option key={b.id} value={b.id}>{b.bankName} ({b.accountNumber.slice(-4)})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* --- TAB VIEW D: QR SCAN / GENERATE --- */}
              {activeTab === 'qr' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Part 1: SCAN QR (Mock Scanner) */}
                  <div className="flex flex-col items-center p-4 bg-base-100 rounded-2xl border border-base-300 text-center relative overflow-hidden">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-3">Live Scanner Camera</span>
                    <div className="w-40 h-40 bg-slate-900 border-2 border-primary rounded-xl relative overflow-hidden flex items-center justify-center">
                      <div className="scanner-laser absolute left-0 right-0 h-0.5 bg-primary shadow-lg shadow-primary"></div>
                      <FaQrcode className="text-slate-700 text-6xl animate-pulse" />
                    </div>
                    <p className="text-[10px] text-base-content/65 mt-3">Align QR code within the frame to automatically parse payee details.</p>
                    <button 
                      type="button" 
                      onClick={() => {
                        // Simulate scanning Priya's QR
                        setPayeeName("Priya Sharma");
                        setPayeeUpi("priya@payflow");
                        setActiveTab('send');
                        toast.success("QR Parsed: Priya Sharma");
                      }}
                      className="btn btn-xs border-none bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] hover:brightness-110 text-white rounded-lg mt-3"
                    >
                      Simulate QR Detection
                    </button>
                  </div>

                  {/* Part 2: GENERATE QR */}
                  <div className="flex flex-col items-center justify-between p-4 bg-base-100 rounded-2xl border border-base-300 text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1">My UPI Payment QR</span>
                    
                    <div className="p-3 bg-white rounded-xl shadow-inner border border-base-300 my-2">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&color=0f52ba&data=${encodeURIComponent(
                          `upi://pay?pa=${upiId}&pn=${encodeURIComponent(fullName)}${qrAmount ? `&am=${qrAmount}` : ''}`
                        )}`}
                        alt="PayFlow QR Code"
                        className="w-32 h-32"
                      />
                    </div>
                    
                    <div className="form-control w-full mt-2">
                      <input 
                        type="number" 
                        placeholder="Request specific amount? (Optional)" 
                        className="input input-xs input-bordered bg-base-100 text-[10px] w-full text-center"
                        value={qrAmount}
                        onChange={(e)=>setQrAmount(e.target.value)}
                      />
                    </div>
                    <span className="text-[10px] text-base-content/60 font-bold mt-2 truncate max-w-full">
                      {upiId}
                    </span>
                  </div>
                </div>
              )}

              {/* Amount and Note Fields (Only if not Generate QR tab) */}
              {activeTab !== 'qr' && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="form-control col-span-1">
                    <label className="label py-1"><span className="label-text text-xs font-bold text-left">Amount (₹)</span></label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      className="input input-bordered bg-base-100 text-sm font-bold"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="form-control col-span-2">
                    <label className="label py-1"><span className="label-text text-xs font-bold text-left">Add Note (Optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Rent, Dinner split"
                      className="input input-bordered bg-base-100 text-sm"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer trigger button */}
            {activeTab !== 'qr' && (
              <button
                type="submit"
                className="btn border-none w-full bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] hover:brightness-110 text-white font-bold rounded-xl mt-6 flex items-center justify-center gap-2"
              >
                <span>Proceed to Pay</span>
                <FiArrowRight />
              </button>
            )}
          </form>
        )}

        {/* Step 2: UPI PIN entry pad (CONFIRM TRANSACTION) */}
        {step === 2 && (
          <div className="flex flex-col items-center justify-between flex-1 py-4">
            <div className="text-center">
              <span className="text-xs uppercase font-extrabold tracking-widest text-secondary">Secure Settlement</span>
              <h3 className="text-xl font-bold mt-1 text-base-content">Enter 6-Digit UPI PIN</h3>
              <p className="text-xs text-base-content/65 mt-1">Paying ₹{parseFloat(amount).toLocaleString()} to {payeeName}</p>
            </div>

            {/* Hidden Input dots display */}
            <div className="flex gap-3 my-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border-2 border-base-300 transition-all duration-200 ${
                    pin[index] !== '' ? 'bg-primary dark:bg-secondary border-primary dark:border-secondary scale-110 shadow-lg' : 'bg-transparent'
                  }`}
                ></div>
              ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-x-8 gap-y-3 max-w-[280px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePinPress(num)}
                  className="w-14 h-14 rounded-full bg-base-100 hover:bg-base-300 active:scale-95 text-base-content font-bold text-lg shadow-sm border border-base-300/40 flex items-center justify-center transition-all"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handlePinBackspace}
                className="w-14 h-14 rounded-full hover:bg-base-300 active:scale-95 text-error font-bold flex items-center justify-center transition-all animate-pulse"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handlePinPress(0)}
                className="w-14 h-14 rounded-full bg-base-100 hover:bg-base-300 active:scale-95 text-base-content font-bold text-lg shadow-sm border border-base-300/40 flex items-center justify-center transition-all"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-14 h-14 rounded-full hover:bg-base-300 active:scale-95 text-primary dark:text-secondary font-bold text-xs flex items-center justify-center transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Transaction Processing */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center flex-1 py-8 text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-slate-300 border-t-primary animate-spin"></div>
              <FiLock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-primary" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-base-content animate-pulse">Payment in Progress</h4>
              <p className="text-xs text-base-content/75 mt-2 bg-base-100 px-4 py-2 rounded-2xl border border-base-300 shadow-sm inline-block">
                {socketStatus}
              </p>
            </div>
            <p className="text-[10px] text-base-content/50 uppercase tracking-widest font-semibold">Do not close the page or press back button</p>
          </div>
        )}

        {/* Step 4: Final Outcome (Confetti / Error Screen) */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-between flex-1 py-6 text-center">
            <div className="space-y-4">
              {socketError ? (
                <div className="flex flex-col items-center gap-3">
                  <FiXCircle className="text-6xl text-error animate-bounce" />
                  <h3 className="text-xl font-bold text-base-content">Transaction Failed</h3>
                  <p className="text-xs text-error font-semibold bg-error/10 px-4 py-2 rounded-xl border border-error/20 max-w-sm">
                    {socketError}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <FiCheckCircle className="text-6xl text-success animate-bounce" />
                  <h3 className="text-xl font-bold text-base-content">Payment Successful</h3>
                  <p className="text-2xl font-black text-primary dark:text-secondary">
                    ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-base-content/75">Transferred successfully to <span className="font-bold">{payeeName}</span></p>
                </div>
              )}
            </div>

            {/* Receipt Summary Details */}
            <div className="w-full bg-base-100 p-4 rounded-2xl border border-base-300/40 text-left my-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-base-content/60">Transaction ID</span>
                <span className="font-bold text-base-content select-all">{finalTxId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/60">UPI Ref Number</span>
                <span className="font-bold text-base-content">UPI-{finalTxId?.slice(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/60">Date & Time</span>
                <span className="font-bold text-base-content">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/60">Method</span>
                <span className="font-bold text-base-content uppercase">{activeTab} Transfer</span>
              </div>
            </div>

            {/* Back triggers */}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => handleTabChange(activeTab)}
                className="btn border-2 border-[#0F52BA] text-[#0F52BA] hover:bg-[#0F52BA] hover:text-white flex-1 rounded-xl text-xs font-bold"
              >
                New Transfer
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn border-none bg-gradient-to-r from-[#0F52BA] to-[#D4AF37] hover:brightness-110 text-white flex-1 rounded-xl text-xs font-bold"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MoneyTransfer;
