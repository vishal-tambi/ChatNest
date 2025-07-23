// Create: src/components/chat/MessageBubble.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Reply, Smile, Copy, Trash2, Edit3, Check, CheckCheck } from 'lucide-react';
import moment from 'moment';
import Avatar from '../ui/Avatar';

const MessageBubble = ({ 
  message, 
  isOwn = false, 
  showAvatar = true, 
  onReply, 
  onReact, 
  onEdit, 
  onDelete 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  const handleReaction = (emoji) => {
    onReact && onReact(message.id, emoji);
    setShowReactions(false);
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(message.text);
    setShowActions(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`flex items-end space-x-2 mb-4 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar for received messages */}
      {!isOwn && showAvatar && (
        <Avatar 
          name={message.sender?.name} 
          src={message.sender?.avatar}
          size="sm"
          online={message.sender?.online}
        />
      )}

      <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Reply Context */}
        {message.replyTo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-1 p-2 text-xs rounded-lg border-l-4 ${
              isOwn 
                ? 'bg-primary-100 border-primary-300 dark:bg-primary-900/20 dark:border-primary-600' 
                : 'bg-gray-100 border-gray-300 dark:bg-dark-300 dark:border-dark-200'
            }`}
          >
            <p className="font-medium text-gray-600 dark:text-gray-400">
              Replying to {message.replyTo.sender?.name}
            </p>
            <p className="text-gray-500 dark:text-gray-500 truncate">
              {message.replyTo.text}
            </p>
          </motion.div>
        )}

        {/* Message Bubble */}
        <div className="relative group">
          <div className={`
            relative px-4 py-2 rounded-2xl shadow-sm
            ${isOwn 
              ? 'bg-primary-500 text-white rounded-br-md' 
              : 'bg-white dark:bg-dark-200 text-gray-800 dark:text-gray-200 rounded-bl-md'
            }
          `}>
            {/* Message Content */}
            <div className="break-words">
              {message.type === 'text' && (
                <p className="text-sm leading-relaxed">{message.text}</p>
              )}
              
              {message.type === 'image' && (
                <div className="space-y-2">
                  <img 
                    src={message.imageUrl} 
                    alt="Shared image"
                    className="max-w-full h-auto rounded-lg"
                  />
                  {message.text && (
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  )}
                </div>
              )}

              {message.type === 'file' && (
                <div className="flex items-center space-x-2 p-2 bg-black/10 rounded-lg">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-dark-400 rounded flex items-center justify-center">
                    📄
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{message.fileName}</p>
                    <p className="text-xs opacity-75">{message.fileSize}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Message Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.reactions.map((reaction, index) => (
                  <motion.span
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center px-1.5 py-0.5 bg-white/20 rounded-full text-xs cursor-pointer hover:bg-white/30 transition-colors"
                    onClick={() => handleReaction(reaction.emoji)}
                  >
                    {reaction.emoji} {reaction.count > 1 && reaction.count}
                  </motion.span>
                ))}
              </div>
            )}

            {/* Message Actions */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: showActions ? 1 : 0, scale: showActions ? 1 : 0.8 }}
              className={`absolute top-0 ${isOwn ? 'left-0 -ml-12' : 'right-0 -mr-12'} 
                flex items-center space-x-1 bg-white dark:bg-dark-300 rounded-full shadow-lg px-2 py-1`}
            >
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-full transition-colors"
              >
                <Smile size={14} className="text-gray-600 dark:text-gray-400" />
              </button>
              
              <button
                onClick={() => onReply && onReply(message)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-full transition-colors"
              >
                <Reply size={14} className="text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-full transition-colors"
                >
                  <MoreVertical size={14} className="text-gray-600 dark:text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-8 right-0 bg-white dark:bg-dark-300 rounded-lg shadow-lg py-1 z-10 min-w-32"
                  >
                    <button
                      onClick={copyMessage}
                      className="flex items-center w-full px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
                    >
                      <Copy size={14} className="mr-2" />
                      Copy
                    </button>
                    
                    {isOwn && (
                      <>
                        <button
                          onClick={() => onEdit && onEdit(message)}
                          className="flex items-center w-full px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
                        >
                          <Edit3 size={14} className="mr-2" />
                          Edit
                        </button>
                        
                        <button
                          onClick={() => onDelete && onDelete(message)}
                          className="flex items-center w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={14} className="mr-2" />
                          Delete
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Reactions Picker */}
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`absolute ${isOwn ? 'left-0' : 'right-0'} -top-12 bg-white dark:bg-dark-300 
                  rounded-full shadow-lg px-2 py-1 flex space-x-1 z-10`}
              >
                {reactions.map((emoji, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction(emoji)}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-dark-200 
                      flex items-center justify-center transition-colors"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Message Status & Time */}
        <div className={`flex items-center mt-1 space-x-1 text-xs text-gray-500 dark:text-gray-400
          ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}
        >
          <span>{moment(message.timestamp).format('HH:mm')}</span>
          
          {isOwn && (
            <div className="flex items-center">
              {message.status === 'sent' && <Check size={12} />}
              {message.status === 'delivered' && <CheckCheck size={12} />}
              {message.status === 'seen' && <CheckCheck size={12} className="text-primary-500" />}
            </div>
          )}

          {message.edited && (
            <span className="italic opacity-75">(edited)</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;