// Create: src/components/chat/TypingIndicator.js
import React from 'react';
import { motion } from 'framer-motion';
import Avatar from '../ui/Avatar';

const TypingIndicator = ({ users = [] }) => {
  if (!users || users.length === 0) return null;

  const dotVariants = {
    initial: { opacity: 0.4, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].name} is typing...`;
    } else if (users.length === 2) {
      return `${users[0].name} and ${users[1].name} are typing...`;
    } else {
      return `${users[0].name} and ${users.length - 1} others are typing...`;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex items-end space-x-2 mb-4"
    >
      {/* Show avatar of first typing user */}
      <Avatar 
        name={users[0].name} 
        src={users[0].avatar}
        size="sm"
        online={users[0].online}
      />

      <div className="flex flex-col">
        {/* Typing bubble */}
        <div className="bg-gray-200 dark:bg-dark-200 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs">
          <div className="flex items-center space-x-1">
            {/* Animated dots */}
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                variants={dotVariants}
                animate="animate"
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 0.6,
                  delay: index * 0.2,
                }}
                className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Typing status text */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-3"
        >
          {getTypingText()}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;