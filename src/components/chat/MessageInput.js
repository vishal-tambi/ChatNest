// Create: src/components/chat/MessageInput.js
import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, X, Image, FileText } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = ({ 
  onSendMessage, 
  onTyping, 
  onStopTyping,
  replyingTo = null,
  onCancelReply,
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Handle typing indicators
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setMessage(value);

    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      onTyping && onTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onStopTyping && onStopTyping();
    }, 1000);
  }, [isTyping, onTyping, onStopTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if ((!message.trim() && attachedFiles.length === 0) || disabled) return;

    // Send message
    onSendMessage({
      text: message.trim(),
      files: attachedFiles,
      replyTo: replyingTo,
      type: attachedFiles.length > 0 ? 'file' : 'text'
    });

    // Reset form
    setMessage('');
    setAttachedFiles([]);
    setShowEmojiPicker(false);
    setShowAttachments(false);
    
    // Stop typing
    if (isTyping) {
      setIsTyping(false);
      onStopTyping && onStopTyping();
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Focus input
    inputRef.current?.focus();
  };

  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    const processedFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: type,
      preview: type === 'image' ? URL.createObjectURL(file) : null
    }));
    
    setAttachedFiles(prev => [...prev, ...processedFiles]);
    setShowAttachments(false);
    
    // Reset file inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removeAttachedFile = (fileId) => {
    setAttachedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // Revoke object URLs to prevent memory leaks
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 p-4">
      {/* Reply Context */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg border-l-4 border-primary-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Replying to {replyingTo.sender?.name}
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                  {replyingTo.text}
                </p>
              </div>
              <button
                onClick={onCancelReply}
                className="p-1 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-full transition-colors"
              >
                <X size={16} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attached Files Preview */}
      <AnimatePresence>
        {attachedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 space-y-2"
          >
            {attachedFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-dark-700 rounded-lg"
              >
                {file.type === 'image' ? (
                  <img 
                    src={file.preview} 
                    alt={file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 dark:bg-dark-600 rounded flex items-center justify-center">
                    <FileText size={20} className="text-gray-600 dark:text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {file.size}
                  </p>
                </div>
                
                <button
                  onClick={() => removeAttachedFile(file.id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-full transition-colors"
                >
                  <X size={14} className="text-gray-500 dark:text-gray-400" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end space-x-2">
          {/* Attachment Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAttachments(!showAttachments)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors"
            >
              <Paperclip size={20} />
            </button>

            {/* Attachments Menu */}
            <AnimatePresence>
              {showAttachments && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="absolute bottom-12 left-0 bg-white dark:bg-dark-300 rounded-lg shadow-lg py-2 z-10"
                >
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
                  >
                    <Image size={16} className="mr-3" />
                    Image
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
                  >
                    <FileText size={16} className="mr-3" />
                    Document
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={disabled ? "Chat is disabled" : "Type a message..."}
              disabled={disabled}
              className="w-full px-4 py-2 pr-12 bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 min-h-[44px] max-h-32"
              rows="1"
              style={{ 
                height: 'auto',
                minHeight: '44px',
                maxHeight: '128px'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />

            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full transition-colors"
            >
              <Smile size={18} />
            </button>
          </div>

          {/* Send Button */}
          <motion.button
            type="submit"
            disabled={(!message.trim() && attachedFiles.length === 0) || disabled}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Send size={20} />
          </motion.button>
        </div>

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 z-50"
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme="auto"
                lazyLoadEmojis={true}
                previewConfig={{ showPreview: false }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.zip,.rar"
          onChange={(e) => handleFileSelect(e, 'file')}
          className="hidden"
        />
        
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e, 'image')}
          className="hidden"
        />
      </form>
    </div>
  );
};

export default MessageInput;