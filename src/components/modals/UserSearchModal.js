// Create: src/components/modals/UserSearchModal.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, UserPlus, MessageCircle, Users, Check, 
  Clock, UserCheck, UserX, Mail, Phone, Video 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI, friendAPI } from '../../services/api';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const UserSearchModal = ({ 
  isOpen, 
  onClose, 
  onStartChat,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onDeclineFriendRequest
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'requests', 'friends'
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAllUsers();
      loadCurrentUserData();
    }
  }, [isOpen]);

  const loadAllUsers = async () => {
    try {
      setIsLoading(true);
      // Try the /all endpoint first, fallback if it doesn't exist
      try {
        const response = await userAPI.getAllUsers({ limit: 100 });
        if (response.data.success) {
          setAllUsers(response.data.users);
          return;
        }
      } catch (error) {
        // If /all endpoint doesn't exist, we'll use search with common letters
        console.log('Using search endpoint as fallback');
      }
      
      // Fallback: Try to get users by searching common letters
      const searchQueries = ['a', 'e', 'i', 'o', 'u', 'te', 'us', 'ex'];
      const allUsers = new Set();
      
      for (const query of searchQueries) {
        try {
          const response = await userAPI.searchUsers(query, 50);
          if (response.data.success && response.data.users) {
            response.data.users.forEach(user => allUsers.add(JSON.stringify(user)));
          }
        } catch (err) {
          console.log(`Search for "${query}" failed:`, err);
        }
      }
      
      // Convert back to array of unique users
      const uniqueUsers = Array.from(allUsers).map(userStr => JSON.parse(userStr));
      setAllUsers(uniqueUsers);
      
    } catch (error) {
      console.error('Failed to load users:', error);
      // Fallback: set empty array to prevent errors
      setAllUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentUserData = async () => {
    try {
      // Load friends and friend requests using dedicated APIs
      const [friendsResponse, requestsResponse] = await Promise.all([
        friendAPI.getFriends(),
        friendAPI.getRequests()
      ]);

      if (friendsResponse.data.success) {
        setFriends(friendsResponse.data.friends.map(f => ({
          ...f,
          id: f._id,
          online: f.isOnline || false,
          lastSeen: f.lastSeen,
          status: f.status || 'Available'
        })));
      }

      if (requestsResponse.data.success) {
        setFriendRequests(requestsResponse.data.requests.map(req => ({
          ...req,
          id: req._id,
          timestamp: req.requestSentAt,
          mutualFriends: 0 // Could be calculated
        })));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };


  // Debounced search function
  const debouncedSearch = useCallback(async (term) => {
    setIsSearching(true);
    
    try {
      if (term.trim().length >= 2) {
        // Use API search for terms with 2+ characters
        const response = await userAPI.searchUsers(term, 20);
        if (response.data.success) {
          const results = response.data.users.map(u => ({
            ...u,
            id: u._id,
            mutualFriends: u.mutualFriendsCount || 0,
            status: u.friendshipStatus || 'none'
          }));
          setSearchResults(results);
        }
      } else if (term.trim() === '') {
        // Show all users when search is empty
        const results = allUsers.map(u => ({
          ...u,
          id: u._id,
          mutualFriends: 0,
          status: 'none',
          online: u.isOnline
        }));
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to local search
      if (term.trim()) {
        const results = allUsers.filter(u => 
          u.name.toLowerCase().includes(term.toLowerCase()) ||
          u.email?.toLowerCase().includes(term.toLowerCase()) ||
          u.username?.toLowerCase().includes(term.toLowerCase())
        ).map(u => ({
          ...u,
          id: u._id,
          mutualFriends: 0,
          status: 'none',
          online: u.isOnline
        }));
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  }, [allUsers]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      debouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, debouncedSearch]);

  const handleSendFriendRequest = async (userId) => {
    try {
      await friendAPI.sendRequest(userId);
      setSearchResults(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, status: 'sent' } : user
        )
      );
      onSendFriendRequest?.(userId);
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      await friendAPI.acceptRequest(userId);
      const acceptedUser = friendRequests.find(req => req.id === userId);
      if (acceptedUser) {
        setFriends(prev => [...prev, { ...acceptedUser, status: 'Available' }]);
        setFriendRequests(prev => prev.filter(req => req.id !== userId));
      }
      onAcceptFriendRequest?.(userId);
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const handleDeclineRequest = async (userId) => {
    try {
      await friendAPI.declineRequest(userId);
      setFriendRequests(prev => prev.filter(req => req.id !== userId));
      onDeclineFriendRequest?.(userId);
    } catch (error) {
      console.error('Failed to decline friend request:', error);
    }
  };

  const getStatusButton = (user) => {
    switch (user.status) {
      case 'friend':
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onStartChat?.(user)}
          >
            <MessageCircle size={16} className="mr-2" />
            Message
          </Button>
        );
      case 'sent':
        return (
          <Button variant="secondary" size="sm" disabled>
            <Clock size={16} className="mr-2" />
            Sent
          </Button>
        );
      case 'pending':
        return (
          <div className="flex space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAcceptRequest(user.id)}
            >
              <Check size={16} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDeclineRequest(user.id)}
            >
              <X size={16} />
            </Button>
          </div>
        );
      default:
        return (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSendFriendRequest(user.id)}
          >
            <UserPlus size={16} className="mr-2" />
            Add Friend
          </Button>
        );
    }
  };

  const tabs = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'requests', label: 'Requests', icon: UserPlus, count: friendRequests.length },
    { id: 'friends', label: 'Friends', icon: Users, count: friends.length }
  ];

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
        className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Find People
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-dark-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="ml-1 bg-primary-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="p-6">
              {/* Search Input */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or username..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>

              {/* Search Results */}
              <AnimatePresence>
                {isSearching && (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <div className="space-y-3">
                    {searchResults.map((user, index) => (
                      <motion.div
                        key={user.id || user._id || `search-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar 
                            name={user.name} 
                            src={user.avatar} 
                            size="md"
                            online={user.online}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {user.name}
                              </h3>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                @{user.username}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {user.bio}
                            </p>
                            {user.mutualFriends > 0 && (
                              <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                                {user.mutualFriends} mutual friend{user.mutualFriends !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                        {getStatusButton(user)}
                      </motion.div>
                    ))}
                  </div>
                )}

                {!isSearching && searchTerm && searchResults.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No results found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Try searching with different keywords
                    </p>
                  </div>
                )}

                {!searchTerm && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Search for people
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Find friends by name, email, or username
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Friend Requests Tab */}
          {activeTab === 'requests' && (
            <div className="p-6">
              {friendRequests.length > 0 ? (
                <div className="space-y-3">
                  {friendRequests.map((request, index) => (
                    <motion.div
                      key={request.id || request._id || `request-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar 
                          name={request.name} 
                          src={request.avatar} 
                          size="md"
                          online={request.online}
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {request.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {request.bio}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            {request.mutualFriends > 0 && (
                              <span className="text-xs text-primary-600 dark:text-primary-400">
                                {request.mutualFriends} mutual friend{request.mutualFriends !== 1 ? 's' : ''}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(request.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                        >
                          <UserCheck size={16} className="mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDeclineRequest(request.id)}
                        >
                          <UserX size={16} className="mr-2" />
                          Decline
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No friend requests
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    When people send you friend requests, they'll appear here
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <div className="p-6">
              {friends.length > 0 ? (
                <div className="space-y-3">
                  {friends.map((friend, index) => (
                    <motion.div
                      key={friend.id || friend._id || `friend-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar 
                          name={friend.name} 
                          src={friend.avatar} 
                          size="md"
                          online={friend.online}
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {friend.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {friend.bio}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {friend.online ? (
                              <span className="text-green-500">Online • {friend.status}</span>
                            ) : (
                              <span>Last seen {new Date(friend.lastSeen).toLocaleString()}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                        
                          variant="ghost"
                          size="sm"
                          onClick={() => console.log('Voice call:', friend.name)}
                        >
                          <Phone size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => console.log('Video call:', friend.name)}
                        >
                          <Video size={16} />
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onStartChat?.(friend)}
                        >
                          <MessageCircle size={16} className="mr-2" />
                          Message
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No friends yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Search for people to connect with them
                  </p>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => setActiveTab('search')}
                  >
                    Find People
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserSearchModal;