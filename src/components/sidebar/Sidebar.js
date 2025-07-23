// Create: src/components/sidebar/Sidebar.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Users, MessageCircle, Settings, LogOut, MoreVertical } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';
import ChatList from './ChatList';
import UserProfile from './UserProfile';

const Sidebar = ({ 
  selectedChatId, 
  onChatSelect, 
  onNewChat, 
  onNewGroup,
  chats = [],
  searchTerm = '',
  onSearchChange 
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNewChatMenu, setShowNewChatMenu] = useState(false);
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();

  const handleLogout = () => {
    logout();
  };

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage?.text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-80 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <MessageCircle className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ChatNest
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <div className="relative">
              <button
                onClick={() => setShowNewChatMenu(!showNewChatMenu)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors"
              >
                <Plus size={20} />
              </button>

              {/* New Chat Menu */}
              <AnimatePresence>
                {showNewChatMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    className="absolute top-12 right-0 bg-white dark:bg-dark-300 rounded-lg shadow-lg py-2 z-10 min-w-40"
                  >
                    <button
                      onClick={() => {
                        onNewChat && onNewChat();
                        setShowNewChatMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
                    >
                      <MessageCircle size={16} className="mr-3" />
                      New Chat
                    </button>
                    
                    <button
                      onClick={() => {
                        onNewGroup && onNewGroup();
                        setShowNewChatMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
                    >
                      <Users size={16} className="mr-3" />
                      New Group
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div 
          onClick={() => setShowProfileModal(true)}
          className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg cursor-pointer transition-colors"
        >
          <Avatar 
            name={user?.name} 
            src={user?.avatar}
            size="md" 
            online={true}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {user?.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user?.status || 'Available'}
            </p>
          </div>
          <MoreVertical size={16} className="text-gray-400" />
        </div>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Online Status Bar */}
      {onlineUsers.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-glow"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {onlineUsers.length} online
            </span>
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <ChatList 
          chats={filteredChats}
          selectedChatId={selectedChatId}
          onChatSelect={onChatSelect}
          onlineUsers={onlineUsers}
          searchTerm={searchTerm}
        />
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-dark-700 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setShowProfileModal(true)}
        >
          <Settings size={18} className="mr-3" />
          Settings & Profile
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={handleLogout}
        >
          <LogOut size={18} className="mr-3" />
          Sign Out
        </Button>
      </div>

      {/* User Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <UserProfile
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            user={user}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Sidebar;