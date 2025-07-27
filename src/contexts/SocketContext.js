import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import Cookies from 'js-cookie';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../utils/constants';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = Cookies.get('token');
      
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('user_online', (data) => {
        setOnlineUsers(prev => {
          const exists = prev.find(u => u._id === data.userId);
          if (!exists) {
            return [...prev, data.user];
          }
          return prev;
        });
      });

      newSocket.on('user_offline', (data) => {
        setOnlineUsers(prev => prev.filter(u => u._id !== data.userId));
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  const joinRoom = (chatId) => {
    if (socket) {
      socket.emit('join_room', { chatId });
    }
  };

  const leaveRoom = (chatId) => {
    if (socket) {
      socket.emit('leave_room', { chatId });
    }
  };

  const sendMessage = (messageData) => {
    if (socket) {
      socket.emit('send_message', messageData);
    }
  };

  const sendTyping = (chatId) => {
    if (socket) {
      socket.emit('typing', { chatId });
    }
  };

  const stopTyping = (chatId) => {
    if (socket) {
      socket.emit('stop_typing', { chatId });
    }
  };

  return (
    <SocketContext.Provider value={{ 
      socket, 
      onlineUsers, 
      isConnected,
      joinRoom,
      leaveRoom,
      sendMessage,
      sendTyping,
      stopTyping
    }}>
      {children}
    </SocketContext.Provider>
  );
};