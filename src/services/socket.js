// src/services/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:9092' : 'https://upi-app-pps0.onrender.com');

/**
 * Creates and returns a Socket.IO connection instance linked to the backend server.
 * @param {string} token - The active JWT auth token passed for connection verification
 * @returns {Socket} - Socket.IO Client connection instance
 */
export const connectSocket = (token) => {
  return io(SOCKET_URL, {
    auth: {
      token
    },
    transports: ['websocket', 'polling'],
    autoConnect: true
  });
};

export default connectSocket;
