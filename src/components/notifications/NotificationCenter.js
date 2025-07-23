// Create: src/components/notifications/NotificationCenter.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, MessageCircle, UserPlus, Phone, Video, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import moment from 'moment';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, messages, calls, friends
  const { user } = useAuth();

  // Mock notifications - replace with real data
  useEffect(() => {
    if (isOpen) {
      const mockNotifications = [
        {
          id: '1',
          type: 'message',
          title: 'New message from Alice',
          message: 'Hey! How are you doing?',
          avatar: null,
          timestamp: new Date(Date.now() - 300000),
          read: false,
          actionable: true,
          data: { userId: 'alice', chatId: 'chat1' }
        },
        {
          id: '2',
          type: 'friend_request',
          title: 'Friend request from Bob Smith',
          message: 'Bob wants to connect with you',
          avatar: null,
          timestamp: new Date(Date.now() - 900000),
          read: false,
          actionable: true,
          data: { userId: 'bob' }
        },
        {
          id: '3',
          type: 'missed_call',
          title: 'Missed call from Charlie',
          message: 'Voice call • 2 minutes ago',
          avatar: null,
          timestamp: new Date(Date.now() - 120000),
          read: true,
          actionable: true,
          data: { userId: 'charlie', callType: 'voice' }
        },
        {
          id: '4',
          type: 'group_invite',
          title: 'Added to "Team Project"',
          message: 'Diana added you to the group',
          avatar: null,
          timestamp: new Date(Date.now() - 1800000),
          read: false,
          actionable: false,
          data: { groupId: 'group1', inviterId: 'diana' }
        },
        {
          id: '5',
          type: 'message',
          title: 'New message in Team Project',
          message: '5 new messages',
          avatar: null,
          timestamp: new Date(Date.now() - 600000),
          read: true,
          actionable: true,
          data: { chatId: 'group1' }
        }
      ];
      setNotifications(mockNotifications);
    }
  }, [isOpen]);

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
      case 'group_invite':
        return <UserPlus size={20} className="text-indigo-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'messages') return ['message', 'group_invite'].includes(notification.type);
    if (filter === 'calls') return ['missed_call', 'video_call'].includes(notification.type);
    if (filter === 'friends') return notification.type === 'friend_request';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleNotificationAction = (notification) => {
    switch (notification.type) {
      case 'message':
        // Open chat
        console.log('Opening chat:', notification.data.chatId);
        markAsRead(notification.id);
        onClose();
        break;
      case 'friend_request':
        // Open friend request modal
        console.log('Opening friend request for:', notification.data.userId);
        break;
      case 'missed_call':
        // Start call back
        console.log('Calling back:', notification.data.userId);
        break;
      default:
        markAsRead(notification.id);
    }
  };

  const filters = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'messages', label: 'Messages', count: notifications.filter(n => ['message', 'group_invite'].includes(n.type)).length },
    { id: 'calls', label: 'Calls', count: notifications.filter(n => ['missed_call', 'video_call'].includes(n.type)).length },
    { id: 'friends', label: 'Friends', count: notifications.filter(n => n.type === 'friend_request').length }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center space-x-3">
            <Bell size={24} className="text-gray-700 dark:text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
              >
                <Check size={16} className="mr-2" />
                Mark all read
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex border-b border-gray-200 dark:border-dark-700">
          {filters.map((filterItem) => (
            <button
              key={filterItem.id}
              onClick={() => setFilter(filterItem.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors relative ${
                filter === filterItem.id
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span>{filterItem.label}</span>
              {filterItem.count > 0 && (
                <span className="bg-gray-300 dark:bg-dark-600 text-gray-700 dark:text-gray-300 text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-4 flex items-center justify-center">
                  {filterItem.count}
                </span>
              )}
              {filter === filterItem.id && (
                <motion.div
                  layoutId="activeFilter"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
          <AnimatePresence>
            {filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-dark-700">
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-dark-700 cursor-pointer transition-colors relative ${
                      !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                    onClick={() => handleNotificationAction(notification)}
                  >
                    {/* Unread Indicator */}
                    {!notification.read && (
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary-500 rounded-full"></div>
                    )}

                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${
                              !notification.read 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {moment(notification.timestamp).fromNow()}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-full transition-colors"
                                title="Mark as read"
                              >
                                <Check size={14} className="text-gray-500 dark:text-gray-400" />
                              </button>
                            )}
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-full transition-colors"
                              title="Remove notification"
                            >
                              <X size={14} className="text-gray-500 dark:text-gray-400" />
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons for specific notification types */}
                        {notification.type === 'friend_request' && (
                          <div className="flex space-x-2 mt-3">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Accept friend request');
                                markAsRead(notification.id);
                              }}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Decline friend request');
                                removeNotification(notification.id);
                              }}
                            >
                              Decline
                            </Button>
                          </div>
                        )}

                        {notification.type === 'missed_call' && (
                          <div className="flex space-x-2 mt-3">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Call back');
                                markAsRead(notification.id);
                              }}
                            >
                              <Phone size={14} className="mr-2" />
                              Call Back
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Send message');
                                markAsRead(notification.id);
                              }}
                            >
                              <MessageCircle size={14} className="mr-2" />
                              Message
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mb-4">
                  <Bell size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No notifications
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {filter === 'all' 
                    ? "You're all caught up! New notifications will appear here."
                    : `No ${filter} notifications at the moment.`
                  }
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-700">
          <Button
            variant="ghost"
            className="w-full justify-center"
            onClick={() => console.log('Open notification settings')}
          >
            <Settings size={16} className="mr-2" />
            Notification Settings
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Create: src/components/notifications/InAppNotification.js
export const InAppNotification = ({ notification, onClose, onAction }) => {
  useEffect(() => {
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

// Create: src/hooks/useNotifications.js
export const useNotifications = () => {
  const [inAppNotifications, setInAppNotifications] = useState([]);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setHasPermission(permission === 'granted');
      });
    }
  }, []);

  const showNotification = useCallback((notification) => {
    // Show browser notification if permission granted and page not focused
    if (hasPermission && document.hidden) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico', // Add your app icon
        badge: '/favicon.ico',
        tag: notification.id,
      });
    }

    // Always show in-app notification
    const inAppNotification = {
      ...notification,
      id: notification.id || Date.now().toString(),
      timestamp: new Date()
    };

    setInAppNotifications(prev => [...prev, inAppNotification]);
  }, [hasPermission]);

  const removeInAppNotification = useCallback((notificationId) => {
    setInAppNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const clearAllInAppNotifications = useCallback(() => {
    setInAppNotifications([]);
  }, []);

  return {
    inAppNotifications,
    showNotification,
    removeInAppNotification,
    clearAllInAppNotifications,
    hasPermission
  };
};

export default NotificationCenter;