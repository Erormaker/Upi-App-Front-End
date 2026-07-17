// src/services/mockData.js

const INITIAL_PROFILE = {
  name: "Alex Morgan",
  email: "alex.morgan@payflow.com",
  phone: "+91 98765 43210",
  upiId: "alexmorgan@payflow",
  walletBalance: 24500.75,
  spendingToday: 1250.00,
  kycStatus: "VERIFIED", // PENDING, VERIFIED, FAILED
  rewardsEarned: 350.00,
  cashbackEarned: 180.00,
  securitySettings: {
    twoFactor: true,
    biometrics: false,
    autoLock: true
  },
  notifications: {
    payments: true,
    promotions: false,
    securityAlerts: true
  }
};

const INITIAL_CONTACTS = [
  { id: "c1", name: "Priya Sharma", phone: "+91 98123 45678", upiId: "priya@payflow", favorite: true, initials: "PS", avatarColor: "bg-blue-600" },
  { id: "c2", name: "Rohan Verma", phone: "+91 99123 45678", upiId: "rohanv@sbi", favorite: true, initials: "RV", avatarColor: "bg-amber-600" },
  { id: "c3", name: "Ananya Iyer", phone: "+91 97123 45678", upiId: "ananya@hdfc", favorite: false, initials: "AI", avatarColor: "bg-purple-600" },
  { id: "c4", name: "Vikram Singh", phone: "+91 96123 45678", upiId: "vikram@payflow", favorite: true, initials: "VS", avatarColor: "bg-emerald-600" },
  { id: "c5", name: "Kiran Patel", phone: "+91 95123 45678", upiId: "kiran@icici", favorite: false, initials: "KP", avatarColor: "bg-rose-600" },
  { id: "c6", name: "Aditi Rao", phone: "+91 94123 45678", upiId: "aditi@payflow", favorite: false, initials: "AR", avatarColor: "bg-indigo-600" }
];

const INITIAL_BANK_ACCOUNTS = [
  { id: "b1", bankName: "HDFC Bank", accountNo: "•••• 4821", ifsc: "HDFC0000124", upiId: "alexmorgan@hdfc", isPrimary: true, logo: "HDFC" },
  { id: "b2", bankName: "State Bank of India", accountNo: "•••• 9015", ifsc: "SBIN0000843", upiId: "alexmorgan@sbi", isPrimary: false, logo: "SBI" }
];

const INITIAL_CARDS = [
  { id: "card1", cardHolder: "Alex Morgan", cardNo: "•••• •••• •••• 4290", expiry: "12/28", type: "VISA", issuer: "HDFC Bank", theme: "bg-gradient-to-r from-blue-700 to-indigo-900 text-white" },
  { id: "card2", cardHolder: "Alex Morgan", cardNo: "•••• •••• •••• 8812", expiry: "09/30", type: "MASTERCARD", issuer: "ICICI Bank", theme: "bg-gradient-to-r from-slate-800 to-slate-900 text-white border border-slate-700" }
];

const INITIAL_TRANSACTIONS = [
  { id: "tx101", type: "SEND", category: "TRANSFER", title: "Priya Sharma", detail: "UPI Transfer to priya@payflow", amount: 2500, date: new Date(Date.now() - 3600000 * 2).toISOString(), status: "SUCCESS" },
  { id: "tx102", type: "RECEIVE", category: "CASHBACK", title: "PayFlow Cashback", detail: "Cashback for scan pay", amount: 50, date: new Date(Date.now() - 3600000 * 12).toISOString(), status: "SUCCESS" },
  { id: "tx103", type: "SEND", category: "BILL", title: "Netflix Subscription", detail: "Paid via auto-debit Card", amount: 649, date: new Date(Date.now() - 3600000 * 24).toISOString(), status: "SUCCESS" },
  { id: "tx104", type: "RECEIVE", category: "TRANSFER", title: "Rohan Verma", detail: "Received from rohanv@sbi", amount: 4500, date: new Date(Date.now() - 3600000 * 48).toISOString(), status: "SUCCESS" },
  { id: "tx105", type: "SEND", category: "TRANSFER", title: "Vikram Singh", detail: "UPI Transfer to vikram@payflow", amount: 1200, date: new Date(Date.now() - 3600000 * 72).toISOString(), status: "SUCCESS" },
  { id: "tx106", type: "SEND", category: "BILL", title: "Electricity Bill", detail: "Transaction failed", amount: 3200, date: new Date(Date.now() - 3600000 * 96).toISOString(), status: "FAILED" },
  { id: "tx107", type: "RECEIVE", category: "TRANSFER", title: "Dad", detail: "Monthly allowance", amount: 15000, date: new Date(Date.now() - 3600000 * 120).toISOString(), status: "SUCCESS" },
  { id: "tx108", type: "SEND", category: "TRANSFER", title: "Zomato Food Order", detail: "Pending payment confirmation", amount: 450, date: new Date(Date.now() - 1800000).toISOString(), status: "PENDING" },
  { id: "tx109", type: "SEND", category: "TRANSFER", title: "Kiran Patel", detail: "UPI Transfer to kiran@icici", amount: 800, date: new Date(Date.now() - 3600000 * 150).toISOString(), status: "SUCCESS" }
];

const INITIAL_NOTIFICATIONS = [
  { id: "nt1", type: "RECEIVE", title: "Payment Received", message: "Received ₹4,500.00 from Rohan Verma", time: "2 hours ago", read: false },
  { id: "nt2", type: "REWARD", title: "Cashback Scratch Card!", message: "Congratulations! You won ₹50.00 cashback on PayFlow.", time: "12 hours ago", read: false },
  { id: "nt3", type: "FAILED", title: "Transaction Failed", message: "Electricity Bill payment of ₹3,200.00 failed. Amount refunded if deducted.", time: "4 days ago", read: true }
];

// Helper to initialize local storage
const initStorage = () => {
  if (!localStorage.getItem("payflow_profile")) {
    localStorage.setItem("payflow_profile", JSON.stringify(INITIAL_PROFILE));
  }
  if (!localStorage.getItem("payflow_contacts")) {
    localStorage.setItem("payflow_contacts", JSON.stringify(INITIAL_CONTACTS));
  }
  if (!localStorage.getItem("payflow_banks")) {
    localStorage.setItem("payflow_banks", JSON.stringify(INITIAL_BANK_ACCOUNTS));
  }
  if (!localStorage.getItem("payflow_cards")) {
    localStorage.setItem("payflow_cards", JSON.stringify(INITIAL_CARDS));
  }
  if (!localStorage.getItem("payflow_transactions")) {
    localStorage.setItem("payflow_transactions", JSON.stringify(INITIAL_TRANSACTIONS));
  }
  if (!localStorage.getItem("payflow_notifications")) {
    localStorage.setItem("payflow_notifications", JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem("payflow_auth")) {
    localStorage.setItem("payflow_auth", JSON.stringify(null));
  }
};

initStorage();

export const getProfile = () => JSON.parse(localStorage.getItem("payflow_profile"));
export const saveProfile = (data) => localStorage.setItem("payflow_profile", JSON.stringify(data));

export const getContacts = () => JSON.parse(localStorage.getItem("payflow_contacts"));
export const saveContacts = (data) => localStorage.setItem("payflow_contacts", JSON.stringify(data));

export const getBanks = () => JSON.parse(localStorage.getItem("payflow_banks"));
export const saveBanks = (data) => localStorage.setItem("payflow_banks", JSON.stringify(data));

export const getCards = () => JSON.parse(localStorage.getItem("payflow_cards"));
export const saveCards = (data) => localStorage.setItem("payflow_cards", JSON.stringify(data));

export const getTransactions = () => JSON.parse(localStorage.getItem("payflow_transactions"));
export const saveTransactions = (data) => localStorage.setItem("payflow_transactions", JSON.stringify(data));

export const getNotifications = () => JSON.parse(localStorage.getItem("payflow_notifications"));
export const saveNotifications = (data) => localStorage.setItem("payflow_notifications", JSON.stringify(data));

export const getAuth = () => JSON.parse(localStorage.getItem("payflow_auth"));
export const saveAuth = (data) => localStorage.setItem("payflow_auth", JSON.stringify(data));

// Add new transaction and modify profile balance
export const createMockTransaction = (tx) => {
  const transactions = getTransactions();
  const profile = getProfile();
  
  const newTx = {
    id: `tx${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toISOString(),
    status: tx.status || "SUCCESS",
    ...tx
  };

  transactions.unshift(newTx);
  saveTransactions(transactions);

  // Update balance
  if (newTx.status === "SUCCESS") {
    if (newTx.type === "SEND") {
      profile.walletBalance = Math.max(0, profile.walletBalance - newTx.amount);
      profile.spendingToday += newTx.amount;
    } else if (newTx.type === "RECEIVE") {
      profile.walletBalance += newTx.amount;
    }
    saveProfile(profile);
  }

  // Create corresponding notification
  const notifications = getNotifications();
  let title = "Transaction Updated";
  let message = "";
  if (newTx.type === "SEND") {
    title = newTx.status === "SUCCESS" ? "Money Sent" : "Payment Failed";
    message = newTx.status === "SUCCESS" 
      ? `Sent ₹${newTx.amount.toLocaleString()} to ${newTx.title}`
      : `Payment of ₹${newTx.amount.toLocaleString()} to ${newTx.title} failed.`;
  } else {
    title = "Money Received";
    message = `Received ₹${newTx.amount.toLocaleString()} from ${newTx.title}`;
  }

  notifications.unshift({
    id: `nt${Math.floor(1000 + Math.random() * 9000)}`,
    type: newTx.status === "SUCCESS" ? newTx.type : "FAILED",
    title,
    message,
    time: "Just now",
    read: false
  });
  saveNotifications(notifications);

  return newTx;
};
