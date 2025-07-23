// Replace your src/components/sidebar/UserProfile.js with this complete version
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Edit3, Save, Moon, Sun, Bell, BellOff, Lock, HelpCircle, LogOut } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const UserProfile = ({ isOpen, onClose, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    status: user?.status || 'Available',
    email: user?.email || '',
    bio: user?.bio || ''
  });
  const [notifications, setNotifications] = useState(true);
  
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const statusOptions = [
    { value: 'Available', emoji: '🟢', color: 'text-green-500' },
    { value: 'Busy', emoji: '🔴', color: 'text-red-500' },
    { value: 'Away', emoji: '🟡', color: 'text-yellow-500' },
    { value: 'Do not disturb', emoji: '⛔', color: 'text-gray-500' },
  ];

  const handleSave = () => {
    // Here you would normally save to backend
    console.log('Saving user data:', editedUser);
    setIsEditing(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle image upload logic here
      console.log('Uploading image:', file);
    }
  };

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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Profile' : 'Profile'}
          </h2>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                >
                  <Save size={16} className="mr-2" />
                  Save
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 size={16} className="mr-2" />
                Edit
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

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center py-8 px-6">
            <div className="relative group">
              <Avatar
                name={editedUser.name}
                src={user?.avatar}
                size="xl"
                online={true}
              />
              
              {isEditing && (
                <motion.label
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera size={24} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </motion.label>
              )}
            </div>

            {/* User Info */}
            <div className="mt-4 text-center w-full">
              {isEditing ? (
                <input
                  type="text"
                  value={editedUser.name}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
                  className="text-xl font-semibold text-center bg-transparent border-b-2 border-gray-300 dark:border-dark-600 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 transition-colors w-full"
                />
              ) : (
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editedUser.name}
                </h3>
              )}
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {editedUser.email}
              </p>
            </div>
          </div>

          {/* Status Section */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Status
            </h4>
            
            {isEditing ? (
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditedUser(prev => ({ ...prev, status: option.value }))}
                    className={`w-full flex items-center p-3 rounded-lg border-2 transition-all ${
                      editedUser.status === option.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
                    }`}
                  >
                    <span className="text-lg mr-3">{option.emoji}</span>
                    <span className={`font-medium ${option.color}`}>
                      {option.value}
                    </span>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                <span className="text-lg">
                  {statusOptions.find(s => s.value === editedUser.status)?.emoji}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {editedUser.status}
                </span>
              </div>
            )}
          </div>

          {/* Bio Section */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              About
            </h4>
            
            {isEditing ? (
              <textarea
                value={editedUser.bio}
                onChange={(e) => setEditedUser(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Write something about yourself..."
                className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                rows="3"
              />
            ) : (
              <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-dark-700 p-3 rounded-lg">
                {editedUser.bio || 'No bio added yet.'}
              </p>
            )}
          </div>

          {/* Settings Section */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Settings
            </h4>
            
            <div className="space-y-2">
              {/* Theme Toggle */}
              <div 
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg transition-colors cursor-pointer" 
                onClick={toggleTheme}
              >
                <div className="flex items-center space-x-3">
                  {isDark ? 
                    <Moon size={18} className="text-gray-600 dark:text-gray-400" /> : 
                    <Sun size={18} className="text-gray-600 dark:text-gray-400" />
                  }
                  <span className="text-gray-700 dark:text-gray-300">
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors relative ${
                  isDark ? 'bg-primary-500' : 'bg-gray-300'
                }`}>
                  <motion.div
                    animate={{ x: isDark ? 16 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 left-0.5"
                  />
                </div>
              </div>

              {/* Notifications */}
              <div 
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg transition-colors cursor-pointer"
                onClick={() => setNotifications(!notifications)}
              >
                <div className="flex items-center space-x-3">
                  {notifications ? 
                    <Bell size={18} className="text-gray-600 dark:text-gray-400" /> : 
                    <BellOff size={18} className="text-gray-600 dark:text-gray-400" />
                  }
                  <span className="text-gray-700 dark:text-gray-300">
                    Notifications
                  </span>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors relative ${
                  notifications ? 'bg-primary-500' : 'bg-gray-300'
                }`}>
                  <motion.div
                    animate={{ x: notifications ? 16 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 left-0.5"
                  />
                </div>
              </div>

              {/* Privacy */}
              <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Lock size={18} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Privacy & Security
                  </span>
                </div>
              </button>

              {/* Help */}
              <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <HelpCircle size={18} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Help & Support
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Account Info Section */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Account Information
            </h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Member since</span>
                <span className="text-gray-900 dark:text-white">January 2025</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Messages sent</span>
                <span className="text-gray-900 dark:text-white">1,234</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Active chats</span>
                <span className="text-gray-900 dark:text-white">8</span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="px-6 py-4 border-t border-red-100 dark:border-red-900/30">
            <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-3">
              Danger Zone
            </h4>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => {
                if (window.confirm('Are you sure you want to sign out?')) {
                  logout();
                  onClose();
                }
              }}
            >
              <LogOut size={18} className="mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserProfile;