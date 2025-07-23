// Create: src/components/modals/GroupChatModal.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Users, Camera, Check, Plus, Crown } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const GroupChatModal = ({ 
  isOpen, 
  onClose, 
  onCreateGroup,
  availableUsers = [] // Users that can be added to the group
}) => {
  const [step, setStep] = useState(1); // 1: Select members, 2: Group details
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupIcon, setGroupIcon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Mock users data - replace with real data
  const mockUsers = availableUsers.length > 0 ? availableUsers : [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', avatar: null, online: true },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com', avatar: null, online: false },
    { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', avatar: null, online: true },
    { id: '4', name: 'Diana Prince', email: 'diana@example.com', avatar: null, online: true },
    { id: '5', name: 'Eve Wilson', email: 'eve@example.com', avatar: null, online: false },
    { id: '6', name: 'Frank Miller', email: 'frank@example.com', avatar: null, online: true },
    { id: '7', name: 'Grace Lee', email: 'grace@example.com', avatar: null, online: true },
    { id: '8', name: 'Henry Davis', email: 'henry@example.com', avatar: null, online: false },
  ];

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleUser = (user) => {
    setSelectedMembers(prev => {
      const isSelected = prev.find(member => member.id === user.id);
      if (isSelected) {
        return prev.filter(member => member.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleNext = () => {
    if (selectedMembers.length > 0) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;

    setIsCreating(true);
    
    try {
      const groupData = {
        name: groupName.trim(),
        description: groupDescription.trim(),
        members: selectedMembers,
        icon: groupIcon,
        type: 'group'
      };

      await onCreateGroup(groupData);
      
      // Reset form
      setStep(1);
      setSelectedMembers([]);
      setGroupName('');
      setGroupDescription('');
      setGroupIcon(null);
      setSearchTerm('');
      
      onClose();
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setGroupIcon(e.target.result);
      reader.readAsDataURL(file);
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
        className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center space-x-3">
            {step === 2 && (
              <button
                onClick={handleBack}
                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors"
              >
                ←
              </button>
            )}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {step === 1 ? 'New Group Chat' : 'Group Details'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Step 1: Select Members */}
          {step === 1 && (
            <div className="p-6">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search people..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>

              {/* Selected Members */}
              {selectedMembers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Selected Members ({selectedMembers.length})
                  </h3>
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    {selectedMembers.map((member) => (
                      <motion.div
                        key={member.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center space-x-2 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm"
                      >
                        <Avatar name={member.name} src={member.avatar} size="sm" />
                        <span className="font-medium">{member.name}</span>
                        <button
                          onClick={() => handleToggleUser(member)}
                          className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-1 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Users */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Add People
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <AnimatePresence>
                    {filteredUsers.map((user) => {
                      const isSelected = selectedMembers.find(member => member.id === user.id);
                      return (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' 
                              : 'hover:bg-gray-50 dark:hover:bg-dark-700'
                          }`}
                          onClick={() => handleToggleUser(user)}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar 
                              name={user.name} 
                              src={user.avatar} 
                              size="md"
                              online={user.online}
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          
                          <motion.div
                            animate={{ scale: isSelected ? 1 : 0 }}
                            className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                          >
                            <Check size={16} className="text-white" />
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">No users found</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Group Details */}
          {step === 2 && (
            <div className="p-6 space-y-6">
              {/* Group Icon */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center overflow-hidden">
                    {groupIcon ? (
                      <img src={groupIcon} alt="Group" className="w-full h-full object-cover" />
                    ) : (
                      <Users size={32} className="text-white" />
                    )}
                  </div>
                  
                  <motion.label
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera size={20} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </motion.label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Click to add group photo
                </p>
              </div>

              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  maxLength={50}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {groupName.length}/50
                </p>
              </div>

              {/* Group Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="What's this group about?"
                  maxLength={200}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-all"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {groupDescription.length}/200
                </p>
              </div>

              {/* Selected Members Preview */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Members ({selectedMembers.length + 1})
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {/* Current user as admin */}
                  <div className="flex items-center space-x-3 p-2">
                    <Avatar name="You" size="sm" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        You
                      </p>
                    </div>
                    <Crown size={16} className="text-yellow-500" />
                  </div>
                  
                  {selectedMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-2">
                      <Avatar name={member.name} src={member.avatar} size="sm" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {member.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-dark-700">
          {step === 1 ? (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
              </p>
              <Button
                onClick={handleNext}
                disabled={selectedMembers.length === 0}
                className="min-w-20"
              >
                Next
              </Button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={handleBack}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || isCreating}
                loading={isCreating}
                className="flex-1"
              >
                Create Group
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GroupChatModal;