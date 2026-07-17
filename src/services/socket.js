// src/services/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:9092';

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
