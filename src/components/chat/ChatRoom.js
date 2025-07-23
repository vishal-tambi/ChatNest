// Create: src/components/chat/ChatRoom.js
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Video, MoreVertical, Search, Info, Archive, Delete, UserPlus, MessageCircle } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const ChatRoom = ({ 
  chat, 
  onBack, 
  onVoiceCall, 
  onVideoCall,
  onAddMembers,
  onChatInfo 
}) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  // Mock messages for demo
  useEffect(() => {
    if (chat) {
      setMessages([
        {
          id: '1',
          text: 'Hey! How are you doing?',
          sender: { id: 'other-user', name: 'John Doe', avatar: null },
          timestamp: new Date(Date.now() - 300000),
          status: 'seen',
          type: 'text'
        },
        {
          id: '2',
          text: 'I\'m doing great! Just working on some new features for ChatNest',
          sender: { id: user?.id, name: user?.name },
          timestamp: new Date(Date.now() - 240000),
          status: 'seen',
          type: 'text'
        },
        {
          id: '3',
          text: 'That sounds exciting! Can you tell me more about it?',
          sender: { id: 'other-user', name: 'John Doe' },
          timestamp: new Date(Date.now() - 180000),
          status: 'delivered',
          type: 'text',
          reactions: [{ emoji: '👍', count: 1, users: [user?.id] }]
        }
      ]);
    }
  }, [chat, user]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (messageData) => {
    const newMessage = {
      id: Date.now().toString(),
      text: messageData.text,
      sender: { id: user?.id, name: user?.name, avatar: user?.avatar },
      timestamp: new Date(),
      status: 'sent',
      type: messageData.type || 'text',
      replyTo: messageData.replyTo,
      files: messageData.files
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Emit to socket if available
    if (socket) {
      socket.emit('send_message', {
        chatId: chat.id,
        message: newMessage
      });
    }

    // Clear reply
    setReplyingTo(null);
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing', { chatId: chat.id, userId: user?.id });
    }
  };

  const handleStopTyping = () => {
    if (socket) {
      socket.emit('stop_typing', { chatId: chat.id, userId: user?.id });
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
  };

  const handleReact = (messageId, emoji) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReactions = msg.reactions || [];
        const reactionIndex = existingReactions.findIndex(r => r.emoji === emoji);
        
        if (reactionIndex >= 0) {
          // Toggle reaction
          const reaction = existingReactions[reactionIndex];
          const userIndex = reaction.users.indexOf(user?.id);
          
          if (userIndex >= 0) {
            // Remove user's reaction
            reaction.users.splice(userIndex, 1);
            reaction.count = reaction.users.length;
            
            if (reaction.count === 0) {
              existingReactions.splice(reactionIndex, 1);
            }
          } else {
            // Add user's reaction
            reaction.users.push(user?.id);
            reaction.count = reaction.users.length;
          }
        } else {
          // Add new reaction
          existingReactions.push({
            emoji,
            count: 1,
            users: [user?.id]
          });
        }
        
        return { ...msg, reactions: existingReactions.filter(r => r.count > 0) };
      }
      return msg;
    }));
  };

  const handleEdit = (message) => {
    // Implement edit functionality
    console.log('Edit message:', message);
  };

  const handleDelete = (message) => {
    setMessages(prev => prev.filter(msg => msg.id !== message.id));
  };

  const getChatTitle = () => {
    if (chat.type === 'group') {
      return chat.name;
    }
    const otherUser = chat.members?.find(member => member.id !== user?.id);
    return otherUser?.name || 'Unknown User';
  };

  const getChatSubtitle = () => {
    if (chat.type === 'group') {
      return `${chat.members?.length || 0} members`;
    }
    const otherUser = chat.members?.find(member => member.id !== user?.id);
    return otherUser?.online ? 'Online' : 'Last seen recently';
  };

  const getChatAvatar = () => {
    if (chat.type === 'group') {
      return (
        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-sm">
            {chat.name?.charAt(0)?.toUpperCase()}
          </span>
        </div>
      );
    }
    
    const otherUser = chat.members?.find(member => member.id !== user?.id);
    return (
      <Avatar
        name={otherUser?.name}
        src={otherUser?.avatar}
        size="md"
        online={otherUser?.online}
      />
    );
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="text-center">
          <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-6">
            <MessageCircle size={48} className="text-primary-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Select a conversation
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a conversation from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-dark-900 h-full">
      {/* Chat Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Back Button (Mobile) */}
            <button
              onClick={onBack}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors"
            >
              ←
            </button>

            {/* Chat Info */}
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg p-2 -m-2 transition-colors"
              onClick={onChatInfo}
            >
              {getChatAvatar()}
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {getChatTitle()}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {getChatSubtitle()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Search Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearching(!isSearching)}
              className={isSearching ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''}
            >
              <Search size={18} />
            </Button>

            {/* Voice Call */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVoiceCall && onVoiceCall(chat)}
            >
              <Phone size={18} />
            </Button>

            {/* Video Call */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVideoCall && onVideoCall(chat)}
            >
              <Video size={18} />
            </Button>

            {/* Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChatMenu(!showChatMenu)}
              >
                <MoreVertical size={18} />
              </Button>

              <AnimatePresence>
                {showChatMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    className="absolute top-12 right-0 bg-white dark:bg-dark-300 rounded-lg shadow-lg py-2 z-10 min-w-48"
                  >
                    <button
                      onClick={() => {
                        onChatInfo && onChatInfo(chat);
                        setShowChatMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
                    >
                      <Info size={16} className="mr-3" />
                      Chat Info
                    </button>
                    
                    {chat.type === 'group' && (
                      <button
                        onClick={() => {
                          onAddMembers && onAddMembers(chat);
                          setShowChatMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
                      >
                        <UserPlus size={16} className="mr-3" />
                        Add Members
                      </button>
                    )}
                    
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
                    >
                      <Archive size={16} className="mr-3" />
                      Archive Chat
                    </button>
                    
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Delete size={16} className="mr-3" />
                      Delete Chat
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in conversation..."
                className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
        <AnimatePresence>
          {messages.map((message, index) => {
            const isOwn = message.sender?.id === user?.id;
            const showAvatar = !isOwn && (
              index === 0 || 
              messages[index - 1]?.sender?.id !== message.sender?.id ||
              (new Date(message.timestamp) - new Date(messages[index - 1]?.timestamp)) > 300000
            );

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
                onReply={handleReply}
                onReact={handleReact}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            );
          })}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <TypingIndicator users={typingUsers} />
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
};

export default ChatRoom;