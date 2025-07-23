import React from 'react';
import { motion } from 'framer-motion';

const Avatar = ({ 
  src, 
  name, 
  size = 'md', 
  online = false, 
  className = '',
  ...props 
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl'
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.div 
      className={`relative inline-block ${className}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      {...props}
    >
      <div className={`
        ${sizes[size]} 
        rounded-full 
        overflow-hidden 
        bg-gradient-to-r 
        from-primary-400 
        to-primary-600 
        flex 
        items-center 
        justify-center 
        text-white 
        font-medium
        shadow-lg
      `}>
        {src ? (
          <img 
            src={src} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      
      {online && (
        <motion.div 
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-dark-900"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

export default Avatar;