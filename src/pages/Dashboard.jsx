// src/pages/Dashboard.jsx
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiSend, 
  FiBriefcase, 
  FiUserCheck, 
  FiGift,
  FiTrendingUp,
  FiArrowRight,
  FiArrowDownLeft,
  FiRefreshCw
} from 'react-icons/fi';
import { FaQrcode } from 'react-icons/fa';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import api from '../services/api';


// Register ChartJS plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Fetch Profile Data
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/users/profile');
      return res.data;
    }
  });

  // 2. Fetch Wallet Balance
  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: async () => {
      const res = await api.get('/wallet/balance');
      return res.data;
    }
  });

  // 3. Fetch Transactions Data
  const { data: txPage, isLoading: isTxLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await api.get('/transactions/history');
      return res.data;
    }
  });
  const transactions = txPage?.content || [];

  // 4. Fetch Contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const res = await api.get('/beneficiary');
      return res.data;
    }
  });

  // 5. Fetch Cashback
  const { data: totalCashback = 0 } = useQuery({
    queryKey: ['totalCashback'],
    queryFn: async () => {
      const res = await api.get('/rewards/cashback');
      return res.data;
    }
  });

  // 6. Fetch Rewards
  const { data: rewards = [] } = useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      const res = await api.get('/rewards');
      return res.data;
    }
  });

  // 7. Fetch UPI list
  const { data: upiAccounts = [] } = useQuery({
    queryKey: ['upiAccounts'],
    queryFn: async () => {
      const res = await api.get('/upi/list');
      return res.data;
    }
  });

  if (isProfileLoading || isWalletLoading || isTxLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Helper variables mapped from API data
  const walletBalance = wallet?.balance ?? 0.0;
  const upiId = upiAccounts[0]?.upiId ?? `${profile?.username || 'user'}@payflow`;

  const spendingToday = transactions
    .filter(t => {
      if (t.transactionType !== 'SEND' && t.transactionType !== 'WITHDRAWAL') return false;
      const tDate = new Date(t.createdAt);
      const today = new Date();
      return tDate.toDateString() === today.toDateString();
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const rewardsCount = rewards?.length || 0;
  const rewardsTotal = rewards?.reduce((sum, r) => sum + r.amount, 0) || 0;

  // --- CHART CONFIGURATIONS ---

  // Chart 1: Monthly Spending (Bar)
  const monthlySpendingData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Spending (₹)',
        data: [12000, 18500, 15000, 24000, 19200, 28000, spendingToday * 10 || 12500],
        backgroundColor: '#0F52BA', // Primary Blue
        borderRadius: 6,
      }
    ]
  };

  // Chart 2: Income vs Expense (Doughnut)
  const incomeVsExpenseData = {
    labels: ['Income', 'Expense', 'Savings'],
    datasets: [
      {
        data: [45000, 28000, 17000],
        backgroundColor: ['#16A34A', '#DC2626', '#D4AF37'], // Green, Red, Gold
        borderWidth: 0,
      }
    ]
  };

  // Chart 3: Weekly Transfers (Line)
  const weeklyTransfersData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Transfers',
        data: [1200, 4500, 800, 3200, 1500, 500, 2500],
        borderColor: '#D4AF37', // Gold Yellow
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  // Chart 4: Wallet Growth (Line)
  const walletGrowthData = {
    labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
    datasets: [
      {
        label: 'Balance Growth',
        data: [15000, 18500, 21000, walletBalance],
        borderColor: '#0F52BA',
        backgroundColor: 'rgba(15, 82, 186, 0.05)',
        fill: true,
        tension: 0.3,
        borderWidth: 3,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: 'currentColor', font: { family: 'Outfit', size: 11 } }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'currentColor', font: { family: 'Outfit', size: 10 } } },
      y: { grid: { color: 'rgba(156, 163, 175, 0.1)' }, ticks: { color: 'currentColor', font: { family: 'Outfit', size: 10 } } }
    }
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: 'currentColor', font: { family: 'Outfit', size: 11 } }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP CARDS SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balance Card (Blue and Gold Premium Card) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-gradient-to-br from-primary via-blue-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-secondary/20 flex flex-col justify-between overflow-hidden md:col-span-1"
        >
          {/* Accent Gold Circle Deco */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/15 rounded-full filter blur-2xl -mr-8 -mt-8"></div>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs uppercase tracking-widest text-slate-300 font-bold">Quick-Pay Balance</span>
              <span className="badge badge-secondary text-white font-extrabold text-[10px]">UPI ACTIVE</span>
            </div>
            <h3 className="text-3xl font-black tracking-wide text-white">
              ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Virtual Account: {upiId}</p>
          </div>


        </motion.div>

        {/* Small stats (Today's spend, Rewards, Cashback) */}
        <div className="grid grid-cols-2 gap-4 md:col-span-2">
          {/* Card 2: Today's Spend */}
          <div className="bg-base-200 p-5 rounded-3xl border border-base-300 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0F52BA]/10 rounded-2xl text-[#0F52BA]">
                <FiTrendingUp className="text-xl" />
              </div>
              <div>
                <p className="text-xs text-base-content/65 font-semibold">Today's Spend</p>
                <h4 className="text-xl font-bold mt-0.5 text-base-content">
                  ₹{spendingToday.toLocaleString('en-IN')}
                </h4>
              </div>
            </div>
            <span className="text-[10px] text-[#0F52BA] font-bold mt-2">Within your daily budget</span>
          </div>

          {/* Card 3: Rewards Card */}
          <div className="bg-base-200 p-5 rounded-3xl border border-base-300 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#D4AF37]/10 rounded-2xl text-[#D4AF37]">
                <FiGift className="text-xl" />
              </div>
              <div>
                <p className="text-xs text-base-content/65 font-semibold">Total Rewards</p>
                <h4 className="text-xl font-bold mt-0.5 text-base-content">
                  ₹{rewardsTotal.toLocaleString('en-IN')}
                </h4>
              </div>
            </div>
            <span className="text-[10px] text-[#D4AF37] font-bold mt-2">{rewardsCount} Scratch cards won</span>
          </div>

          {/* Card 4: Cashback Card */}
          <div className="bg-base-200 p-5 rounded-3xl border border-base-300 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#1A6FD4]/10 rounded-2xl text-[#1A6FD4]">
                <FiUserCheck className="text-xl" />
              </div>
              <div>
                <p className="text-xs text-base-content/65 font-semibold">Cashbacks</p>
                <h4 className="text-xl font-bold mt-0.5 text-base-content">
                  ₹{totalCashback.toLocaleString('en-IN')}
                </h4>
              </div>
            </div>
            <span className="text-[10px] text-[#1A6FD4] font-bold mt-2">Saved 1.5% this month</span>
          </div>

          {/* Card 5: Total Transactions */}
          <div className="bg-base-200 p-5 rounded-3xl border border-base-300 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#B8960C]/10 rounded-2xl text-[#B8960C]">
                <FiBriefcase className="text-xl" />
              </div>
              <div>
                <p className="text-xs text-base-content/65 font-semibold">Total Txns</p>
                <h4 className="text-xl font-bold mt-0.5 text-base-content">{transactions.length}</h4>
              </div>
            </div>
            <span className="text-[10px] text-[#B8960C] font-bold mt-2">All networks active</span>
          </div>
        </div>
      </div>

      {/* 2. QUICK MONEY TRANSFER SHORTCUTS */}
      <div className="bg-base-200 p-6 rounded-3xl border border-base-300">
        <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/60 mb-4 text-left">Quick Actions</h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
          {[
            { label: 'Send', icon: FiSend, tab: 'send', color: 'bg-[#0F52BA]' },
            { label: 'Receive', icon: FiArrowDownLeft, tab: 'receive', color: 'bg-[#D4AF37]' },
            { label: 'Scan QR', icon: FaQrcode, tab: 'qr', color: 'bg-[#1A6FD4]' },
            { label: 'UPI ID', icon: FiUserCheck, tab: 'upi', color: 'bg-[#B8960C]' },
            { label: 'Mobile', icon: FiSend, tab: 'mobile', color: 'bg-[#2563EB]' },
            { label: 'Bank', icon: FiBriefcase, tab: 'bank', color: 'bg-[#C9A826]' },
            { label: 'Self', icon: FiRefreshCw, tab: 'self', color: 'bg-[#0D47A1]' },
            { label: 'History', icon: FiTrendingUp, tab: 'history', color: 'bg-[#A89025]', isLink: true }
          ].map((act, index) => (
            <button
              key={index}
              onClick={() => {
                if (act.isLink) navigate('/history');
                else navigate(`/transfer?tab=${act.tab}`);
              }}
              className="flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-200"
            >
              <div className={`w-12 h-12 rounded-2xl ${act.color} text-white flex items-center justify-center shadow-md`}>
                <act.icon className="text-xl" />
              </div>
              <span className="text-xs font-bold text-base-content/85">{act.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Monthly Spending (Bar) */}
        <div className="bg-base-200 p-5 rounded-3xl border border-base-300 h-80 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold text-base-content">Monthly Spend Analysis</h4>
            <span className="text-xs text-primary font-bold">2026 FY</span>
          </div>
          <div className="flex-grow min-h-0 relative">
            <Bar data={monthlySpendingData} options={chartOptions} />
          </div>
        </div>

        {/* Chart B: Income vs Expense (Doughnut) */}
        <div className="bg-base-200 p-5 rounded-3xl border border-base-300 h-80 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold text-base-content">Income vs Expense vs Savings</h4>
            <span className="text-xs text-success font-bold">This Month</span>
          </div>
          <div className="flex-grow min-h-0 relative flex items-center justify-center">
            <div className="w-44 h-44">
              <Doughnut data={incomeVsExpenseData} options={donutOptions} />
            </div>
          </div>
        </div>

        {/* Chart C: Weekly Transfers (Line) */}
        <div className="bg-base-200 p-5 rounded-3xl border border-base-300 h-80 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold text-base-content">Weekly Transfer Volume</h4>
            <span className="text-xs text-secondary font-bold">7 Days</span>
          </div>
          <div className="flex-grow min-h-0 relative">
            <Line data={weeklyTransfersData} options={chartOptions} />
          </div>
        </div>

        {/* Chart D: Wallet Growth (Line) */}
        <div className="bg-base-200 p-5 rounded-3xl border border-base-300 h-80 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold text-base-content">Wallet Balance Growth</h4>
            <span className="text-xs text-primary dark:text-secondary font-bold">This Month</span>
          </div>
          <div className="flex-grow min-h-0 relative">
            <Line data={walletGrowthData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* 4. RECENT CONTACTS & TRANSACTIONS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contacts List */}
        <div className="bg-base-200 p-5 rounded-3xl border border-base-300 lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-base-content">Quick Send</h4>
            <button onClick={() => navigate('/contacts')} className="text-xs font-bold text-[#0F52BA] dark:text-[#D4AF37] hover:underline flex items-center gap-1">
              View All <FiArrowRight />
            </button>
          </div>
          <div className="flex flex-row lg:flex-col gap-4 overflow-x-auto pb-2 lg:pb-0 lg:overflow-x-visible">
            {contacts.slice(0, 4).map((c) => {
              const initials = getInitials(c.nickname);
              const avatarColor = getAvatarColor(c.nickname);
              return (
                <button
                  key={c.id}
                  onClick={() => navigate(`/transfer?tab=send&to=${encodeURIComponent(c.targetUpiId || '')}`)}
                  className="flex flex-col lg:flex-row items-center gap-3 p-2 bg-base-100 rounded-2xl hover:bg-[#0F52BA]/10 transition-all duration-200 w-20 lg:w-full flex-shrink-0"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${avatarColor} text-white flex items-center justify-center font-bold text-sm`}>
                    {initials}
                  </div>
                  <div className="text-center lg:text-left overflow-hidden hidden lg:block flex-1">
                    <h5 className="text-xs font-bold text-base-content truncate">{c.nickname}</h5>
                    <p className="text-[10px] text-base-content/65 truncate">{c.targetUpiId || c.targetAccountNumber}</p>
                  </div>
                </button>
              );
            })}
            {contacts.length === 0 && (
              <p className="text-xs text-base-content/50 py-4 text-center">No saved contacts yet.</p>
            )}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-base-200 p-5 rounded-3xl border border-base-300 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-base-content">Recent Transactions</h4>
            <button onClick={() => navigate('/history')} className="text-xs font-bold text-[#0F52BA] dark:text-[#D4AF37] hover:underline flex items-center gap-1">
              Full History <FiArrowRight />
            </button>
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 3).map((tx) => {
              const isReceive = tx.transactionType === 'RECEIVE' || tx.transactionType === 'DEPOSIT';
              const txTitle = isReceive 
                ? `Received from ${tx.senderName || 'Sender'}` 
                : `Sent to ${tx.receiverName || 'Recipient'}`;
              const txDetail = tx.description || `Ref: ${tx.referenceId}`;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 bg-base-100 rounded-2xl border border-base-300/40 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isReceive ? 'bg-success/15 text-success' : 'bg-red-500/15 text-red-500'
                    }`}>
                      {isReceive ? '+' : '-'}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-base-content">{txTitle}</h5>
                      <p className="text-[10px] text-base-content/65 mt-0.5">{txDetail}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`text-xs font-bold ${
                      isReceive ? 'text-success' : 'text-base-content'
                    }`}>
                      {isReceive ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                    <div className="mt-1">
                      <span className={`badge badge-xs font-bold text-[9px] ${
                        tx.status === 'SUCCESS' ? 'badge-success text-white' : tx.status === 'FAILED' ? 'badge-error text-white' : 'badge-warning text-neutral'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {transactions.length === 0 && (
              <p className="text-xs text-base-content/50 py-8 text-center">No transactions recorded yet.</p>
            )}
          </div>
        </div>
      </div>


    </div>
  );
};

export default Dashboard;
