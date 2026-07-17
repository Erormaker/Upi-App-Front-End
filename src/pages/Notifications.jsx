// src/pages/Notifications.jsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FiBell, 
  FiArrowDownLeft, 
  FiArrowUpRight, 
  FiGift, 
  FiAlertTriangle, 
  FiCheckCircle 
} from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const Notifications = () => {
  const queryClient = useQueryClient();

  // 1. Fetch Notification lists from REST API
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    }
  });

  // 2. Mark a single notification as read mutation
  const markReadMutation = useMutation({
    key: 'markRead',
    mutationFn: async (id) => {
      return api.post(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  // 3. Mark all notifications as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async (unreadList) => {
      const promises = unreadList.map(n => api.post(`/notifications/${n.id}/read`));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('All notifications marked as read.');
    },
    onError: () => {
      toast.error('Failed to update notifications');
    }
  });

  const getNotificationIcon = (title, message) => {
    const txt = `${title} ${message}`.toLowerCase();
    if (txt.includes('receive') || txt.includes('deposit') || txt.includes('loaded')) {
      return {
        icon: <FiArrowDownLeft className="text-xl" />,
        color: 'bg-success/15 text-success'
      };
    }
    if (txt.includes('send') || txt.includes('withdraw') || txt.includes('sent') || txt.includes('transfer')) {
      return {
        icon: <FiArrowUpRight className="text-xl" />,
        color: 'bg-primary/15 text-primary dark:text-secondary dark:bg-secondary/15'
      };
    }
    if (txt.includes('reward') || txt.includes('cashback') || txt.includes('scratch')) {
      return {
        icon: <FiGift className="text-xl" />,
        color: 'bg-amber-500/15 text-amber-500'
      };
    }
    if (txt.includes('fail') || txt.includes('decline') || txt.includes('error')) {
      return {
        icon: <FiAlertTriangle className="text-xl" />,
        color: 'bg-error/15 text-error'
      };
    }
    return {
      icon: <FiBell className="text-xl" />,
      color: 'bg-slate-500/15 text-slate-500'
    };
  };

  const unreadList = notifications.filter(n => n.status === 'UNREAD');
  const hasUnread = unreadList.length > 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
            <span>Notification Feed</span>
            {hasUnread && (
              <span className="badge badge-secondary text-white font-extrabold text-[10px]">
                {unreadList.length} NEW
              </span>
            )}
          </h2>
          <p className="text-xs text-base-content/65">Stay informed with updates regarding your deposits, rewards, and transfers.</p>
        </div>

        {hasUnread && (
          <button
            onClick={() => markAllReadMutation.mutate(unreadList)}
            className="btn btn-sm btn-ghost hover:btn-primary text-xs font-bold rounded-xl flex items-center gap-1.5"
            disabled={markAllReadMutation.isPending}
          >
            <FiCheckCircle />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications lists */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-base-200 border border-base-300 p-12 rounded-3xl text-center">
              <FiBell className="text-3xl text-base-content/30 mx-auto mb-2" />
              <p className="text-xs text-base-content/65 font-bold">Your notification tray is empty.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const meta = getNotificationIcon(n.title, n.message);
              const isUnread = n.status === 'UNREAD';
              const formattedTime = n.createdAt 
                ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
                : '';

              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (isUnread) markReadMutation.mutate(n.id);
                  }}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex gap-4 cursor-pointer ${
                    !isUnread 
                      ? 'bg-base-200/50 border-base-300/60' 
                      : 'bg-base-200 border-primary/20 shadow-sm shadow-primary/5 relative'
                  }`}
                >
                  {/* Unread circle marker dot */}
                  {isUnread && (
                    <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  )}

                  {/* Icon Panel */}
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${meta.color}`}>
                    {meta.icon}
                  </div>

                  {/* Message Detail */}
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-xs font-bold ${!isUnread ? 'text-base-content/80' : 'text-base-content'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-base-content/50 font-bold block ml-4">{formattedTime}</span>
                    </div>
                    <p className="text-xs text-base-content/65 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
