// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from '../services/socket';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

import { getCookie } from '../utils/cookies';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated;
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      const token = getCookie('payflow_token');
      const newSocket = io(token);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('[Socket] Live Connection Established');
      });

      newSocket.on('online_users_count', (count) => {
        setOnlineUsers(count);
      });

      newSocket.on('live_notification', (data) => {
        // Trigger visual toast banner
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-bounce duration-500' : 'opacity-0'
            } max-w-sm w-full bg-base-100 shadow-2xl rounded-xl border border-secondary/20 p-4 flex gap-3`}
            onClick={() => toast.dismiss(t.id)}
          >
            <div className="flex-1">
              <span className="badge badge-secondary text-xs mb-1 font-bold">New Notification</span>
              <h4 className="text-sm font-bold text-primary dark:text-white">{data.title}</h4>
              <p className="text-xs text-base-content/75">{data.message}</p>
            </div>
            <div className="flex flex-col items-center justify-center font-bold text-success">
              {data.amount && `+₹${data.amount}`}
            </div>
          </div>
        ), { duration: 5000 });
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      setSocket(null);
      setOnlineUsers(0);
    }
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
