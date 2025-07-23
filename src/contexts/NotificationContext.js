// Create this file: src/contexts/NotificationContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// InAppNotification Component
const InAppNotification = ({ notification, onClose, onAction }) => {
  const { X, MessageCircle, UserPlus, Phone, Video, Bell } = require('lucide-react');
  const { motion } = require('framer-motion');
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 5000); // Auto dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageCircle size={20} className="text-blue-500" />;
      case 'friend_request':
        return <UserPlus size={20} className="text-green-500" />;
      case 'missed_call':
        return <Phone size={20} className="text-red-500" />;
      case 'video_call':
        return <Video size={20} className="text-purple-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -100, scale: 0.8 }}
      className="bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-600 p-4 max-w-sm w-full mx-auto cursor-pointer hover:shadow-xl transition-all duration-200"
      onClick={() => onAction && onAction(notification)}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {notification.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {notification.message}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(notification.id);
          }}
          className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors"
        >
          <X size={16} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [inAppNotifications, setInAppNotifications] = useState([]);
  const [hasPermission, setHasPermission] = useState(false);

  // Request notification permission on first load
  React.useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setHasPermission(permission === 'granted');
      });
    }
  }, []);

  const showNotification = useCallback((notification) => {
    // Show browser notification if permission granted and page not focused
    if (hasPermission && document.hidden) {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: false,
        silent: false
      });

      // Auto close browser notification after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);

      // Handle browser notification click
      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        if (notification.onClick) {
          notification.onClick();
        }
      };
    }

    // Always show in-app notification when page is focused
    if (!document.hidden) {
      const inAppNotification = {
        ...notification,
        id: notification.id || Date.now().toString(),
        timestamp: new Date()
      };

      setInAppNotifications(prev => [...prev, inAppNotification]);

      // Auto remove after 5 seconds if not actionable
      if (!notification.actionable) {
        setTimeout(() => {
          removeInAppNotification(inAppNotification.id);
        }, 5000);
      }
    }
  }, [hasPermission]);

  const removeInAppNotification = useCallback((notificationId) => {
    setInAppNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const clearAllInAppNotifications = useCallback(() => {
    setInAppNotifications([]);
  }, []);

  const handleNotificationAction = useCallback((notification) => {
    if (notification.onClick) {
      notification.onClick();
    }
    removeInAppNotification(notification.id);
  }, [removeInAppNotification]);

  return (
    <NotificationContext.Provider value={{
      inAppNotifications,
      showNotification,
      removeInAppNotification,
      clearAllInAppNotifications,
      hasPermission
    }}>
      {children}
      
      {/* In-App Notification Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {inAppNotifications.map((notification) => (
            <div key={notification.id} className="pointer-events-auto">
              <InAppNotification
                notification={notification}
                onClose={removeInAppNotification}
                onAction={handleNotificationAction}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};