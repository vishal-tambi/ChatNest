// Create: src/components/sidebar/ChatList.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import Avatar from '../ui/Avatar';
import { Users, Volume2, VolumeX, Pin, Archive, MessageCircle, Search } from 'lucide-react';
const ChatList = ({ 
  chats = [], 
  selectedChatId, 
  onChatSelect, 
  onlineUsers = [],
  searchTerm = ''
}) => {
  const isUserOnline = (userId) => {
    return onlineUsers.some(user => user.id === userId);
  };

  const getChatAvatar = (chat) => {
    if (chat.type === 'group') {
      return (
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <Users size={20} className="text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-400 dark:bg-dark-600 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-medium">
              {chat.members?.length || 0}
            </span>
          </div>
        </div>
      );
    }

    const otherUser = chat.members?.find(member => member.id !== 'currentUserId'); // Replace with actual current user ID
    return (
      <Avatar
        name={otherUser?.name || chat.name}
        src={otherUser?.avatar || chat.avatar}
        size="md"
        online={otherUser ? isUserOnline(otherUser.id) : false}
      />
    );
  };

  const getChatName = (chat) => {
    if (chat.type === 'group') {
      return chat.name;
    }
    const otherUser = chat.members?.find(member => member.id !== 'currentUserId');
    return otherUser?.name || chat.name;
  };

  const getLastMessageText = (chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    
    const { text, type, sender } = chat.lastMessage;
    const senderName = sender?.id === 'currentUserId' ? 'You' : sender?.name;
    
    switch (type) {
      case 'image':
        return `${senderName}: 📷 Photo`;
      case 'file':
        return `${senderName}: 📎 ${chat.lastMessage.fileName}`;
      case 'voice':
        return `${senderName}: 🎤 Voice message`;
      default:
        return `${senderName}: ${text}`;
    }
  };

  const getLastMessageTime = (chat) => {
    if (!chat.lastMessage?.timestamp) return '';
    
    const now = moment();
    const messageTime = moment(chat.lastMessage.timestamp);
    
    if (now.diff(messageTime, 'days') === 0) {
      return messageTime.format('HH:mm');
    } else if (now.diff(messageTime, 'days') === 1) {
      return 'Yesterday';
    } else if (now.diff(messageTime, 'days') < 7) {
      return messageTime.format('dddd');
    } else {
      return messageTime.format('DD/MM');
    }
  };

  // Separate pinned and regular chats
  const pinnedChats = chats.filter(chat => chat.isPinned);
  const regularChats = chats.filter(chat => !chat.isPinned);

  const renderChatItem = (chat) => (
    <motion.div
      key={chat.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
      onClick={() => onChatSelect(chat.id)}
      className={`
        relative flex items-center p-3 cursor-pointer transition-all duration-200 rounded-lg mx-2
        ${selectedChatId === chat.id 
          ? 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500' 
          : 'hover:bg-gray-50 dark:hover:bg-dark-700'
        }
      `}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {getChatAvatar(chat)}
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0 ml-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <h3 className={`font-semibold truncate ${
              selectedChatId === chat.id 
                ? 'text-primary-700 dark:text-primary-300' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {getChatName(chat)}
            </h3>
            
            {/* Chat Status Icons */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              {chat.isPinned && (
                <Pin size={12} className="text-gray-400 dark:text-gray-500" />
              )}
              {chat.isMuted && (
                <VolumeX size={12} className="text-gray-400 dark:text-gray-500" />
              )}
              {chat.isArchived && (
                <Archive size={12} className="text-gray-400 dark:text-gray-500" />
              )}
            </div>
          </div>

          {/* Time & Status */}
          <div className="flex flex-col items-end space-y-1 flex-shrink-0 ml-2">
            <span className={`text-xs ${
              selectedChatId === chat.id 
                ? 'text-primary-600 dark:text-primary-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {getLastMessageTime(chat)}
            </span>
            
            {/* Unread Count */}
            {chat.unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="min-w-[18px] h-[18px] bg-primary-500 rounded-full flex items-center justify-center"
              >
                <span className="text-xs text-white font-medium">
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Last Message */}
        <div className="flex items-center justify-between">
          <p className={`text-sm truncate flex-1 ${
            chat.unreadCount > 0 
              ? 'font-medium text-gray-900 dark:text-white' 
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {getLastMessageText(chat)}
          </p>

          {/* Typing Indicator */}
          {chat.isTyping && (
            <div className="flex items-center space-x-1 ml-2">
              <div className="flex space-x-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      delay: i * 0.2,
                    }}
                    className="w-1 h-1 bg-primary-500 rounded-full"
                  />
                ))}
              </div>
              <span className="text-xs text-primary-500">typing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Selection Indicator */}
      {selectedChatId === chat.id && (
        <motion.div
          layoutId="selectedChat"
          className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r"
        />
      )}
    </motion.div>
  );

  return (
    <div className="py-2">
      {/* Pinned Chats Section */}
      <AnimatePresence>
        {pinnedChats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-4 py-2">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center">
                <Pin size={12} className="mr-1" />
                Pinned
              </h4>
            </div>
            <div className="space-y-1">
              {pinnedChats.map(renderChatItem)}
            </div>
            {regularChats.length > 0 && (
              <div className="border-b border-gray-100 dark:border-dark-600 mx-4 my-2" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regular Chats */}
      <AnimatePresence>
        {regularChats.length > 0 ? (
          <motion.div className="space-y-1">
            {regularChats.map(renderChatItem)}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mb-4">
              <MessageCircle size={32} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No conversations yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Start a new conversation to begin chatting
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Search Results */}
      {searchTerm && chats.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mb-4">
            <Search size={32} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No results found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Try searching with different keywords
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ChatList;