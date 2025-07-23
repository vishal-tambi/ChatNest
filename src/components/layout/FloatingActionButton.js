// Create this file: src/components/layout/FloatingActionButton.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageCircle, Users, UserPlus, Bell } from 'lucide-react';

export const FloatingActionButton = ({ 
  onNewChat, 
  onNewGroup, 
  onFindPeople,
  onOpenNotifications,
  notificationCount = 0 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: MessageCircle,
      label: 'New Chat',
      onClick: onNewChat,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: Users,
      label: 'New Group',
      onClick: onNewGroup,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      icon: UserPlus,
      label: 'Find People',
      onClick: onFindPeople,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      icon: Bell,
      label: 'Notifications',
      onClick: onOpenNotifications,
      color: 'bg-orange-500 hover:bg-orange-600',
      badge: notificationCount
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                    transition: { delay: index * 0.05 }
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0, 
                    y: 20,
                    transition: { delay: (actions.length - 1 - index) * 0.05 }
                  }}
                  onClick={() => {
                    action.onClick?.();
                    setIsOpen(false);
                  }}
                  className={`
                    relative w-12 h-12 rounded-full shadow-lg text-white transition-all duration-200 
                    transform hover:scale-110 group ${action.color}
                  `}
                >
                  <Icon size={20} className="mx-auto" />
                  
                  {/* Badge */}
                  {action.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {action.badge > 99 ? '99+' : action.badge}
                    </span>
                  )}

                  {/* Tooltip */}
                  <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
                      {action.label}
                    </div>
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg 
          transition-all duration-200 flex items-center justify-center
          ${isOpen ? 'rotate-45' : 'rotate-0'}
        `}
      >
        <Plus size={24} />
      </motion.button>

      {/* Notification Badge on Main Button */}
      {notificationCount > 0 && !isOpen && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center"
        >
          {notificationCount > 99 ? '99+' : notificationCount}
        </motion.span>
      )}
    </div>
  );
};