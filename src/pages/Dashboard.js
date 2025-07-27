// Replace your src/pages/Dashboard.js with this complete version
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useNotifications } from '../contexts/NotificationContext';
import { chatAPI, userAPI } from '../services/api';

// Components
import Sidebar from '../components/sidebar/Sidebar';
import ChatRoom from '../components/chat/ChatRoom';
import CallModal from '../components/calls/CallModal';
import GroupChatModal from '../components/modals/GroupChatModal';
import UserSearchModal from '../components/modals/UserSearchModal';
import NotificationCenter from '../components/notifications/NotificationCenter';
import { FloatingActionButton } from '../components/layout/FloatingActionButton';

const Dashboard = () => {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  
  // Modal states
  const [showCallModal, setShowCallModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showUserSearchModal, setShowUserSearchModal] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  
  // Call states
  const [currentCall, setCurrentCall] = useState(null);
  const [callStatus, setCallStatus] = useState('calling');
  
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const { inAppNotifications, showNotification } = useNotifications();

  // Load chats from API
  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  const loadChats = async () => {
    try {
      setIsLoadingChats(true);
      const response = await chatAPI.getChats();
      if (response.data.success) {
        const transformedChats = response.data.chats.map(chat => ({
          id: chat._id,
          name: getChatDisplayName(chat),
          type: chat.type,
          avatar: chat.avatar,
          members: chat.participants?.map(p => ({
            id: p.user._id || p.user,
            name: p.user.name || 'Unknown',
            online: p.user.isOnline || false
          })) || [],
          lastMessage: chat.lastMessage ? {
            id: chat.lastMessage._id,
            text: chat.lastMessage.content,
            sender: {
              id: chat.lastMessage.sender._id || chat.lastMessage.sender,
              name: chat.lastMessage.sender.name || 'Unknown'
            },
            timestamp: new Date(chat.lastMessage.createdAt),
            type: chat.lastMessage.type || 'text'
          } : null,
          unreadCount: chat.unreadCount || 0,
          isPinned: chat.isPinned || false,
          isMuted: chat.isMuted || false,
          isArchived: chat.isArchived || false,
          isTyping: false,
          updatedAt: new Date(chat.updatedAt)
        }));
        
        // Sort chats by last activity
        transformedChats.sort((a, b) => {
          const aTime = a.lastMessage?.timestamp || a.updatedAt;
          const bTime = b.lastMessage?.timestamp || b.updatedAt;
          return new Date(bTime) - new Date(aTime);
        });
        
        setChats(transformedChats);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
      // Fallback to empty state
      setChats([]);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const getChatDisplayName = (chat) => {
    if (chat.type === 'group') {
      return chat.name || 'Group Chat';
    } else {
      // For private chats, find the other participant
      const otherParticipant = chat.participants?.find(p => 
        (p.user._id || p.user) !== user?.id
      );
      return otherParticipant?.user?.name || 'Unknown User';
    }
  };

  // Handle room ID from URL
  useEffect(() => {
    if (roomId) {
      setSelectedChatId(roomId);
    }
  }, [roomId]);

  // Simulate receiving notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 10 seconds
        const notifications = [
          {
            type: 'message',
            title: 'New message from Alice',
            message: 'Hey! Check out the new design updates 🎨',
            onClick: () => handleChatSelect('2')
          },
          {
            type: 'friend_request',
            title: 'Friend request from Mike',
            message: 'Mike wants to connect with you',
            actionable: true
          },
          {
            type: 'missed_call',
            title: 'Missed call from Sarah',
            message: 'Voice call • Just now',
            onClick: () => handleVoiceCall({ id: '3', name: 'Sarah Wilson' })
          }
        ];
        
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        showNotification(randomNotification);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [showNotification]);

  const handleChatSelect = (chatId) => {
    setSelectedChatId(chatId);
    navigate(`/chat/${chatId}`);
    
    // Mark messages as read and remove typing indicator
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, unreadCount: 0, isTyping: false } 
        : chat
    ));
  };

  const handleNewChat = () => {
    setShowUserSearchModal(true);
  };

  const handleNewGroup = () => {
    setShowGroupModal(true);
  };

  const handleCreateGroup = async (groupData) => {
    if (isCreatingChat) return;
    
    try {
      setIsCreatingChat(true);
      
      // Use real API to create group chat
      const createData = {
        type: 'group',
        name: groupData.name,
        description: groupData.description,
        participants: groupData.members?.map(member => member.id) || []
      };

      const response = await chatAPI.createGroupChat(createData);
      
      if (response.data.success) {
        const newChat = response.data.chat;
        
        // Transform API response to match frontend format
        const transformedChat = {
          id: newChat._id,
          name: newChat.name,
          type: newChat.type,
          avatar: newChat.avatar,
          members: newChat.participants?.map(p => ({
            id: p.user._id || p.user,
            name: p.user.name || 'Unknown',
            online: p.user.isOnline || false
          })) || [],
          lastMessage: null,
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          isArchived: false,
          isTyping: false,
          updatedAt: new Date(newChat.updatedAt)
        };

        setChats(prev => [transformedChat, ...prev]);
        
        // Show success notification
        showNotification({
          type: 'success',
          title: 'Group Created!',
          message: `${groupData.name} has been created successfully`,
          onClick: () => handleChatSelect(transformedChat.id)
        });

        // Navigate to the new group
        handleChatSelect(transformedChat.id);
      } else {
        throw new Error(response.data.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('Failed to create group:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to create group. Please try again.'
      });
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleStartChat = async (targetUser) => {
    if (isCreatingChat) return;
    
    try {
      setIsCreatingChat(true);
      
      // Check if chat already exists
      const existingChat = chats.find(chat => 
        chat.type === 'private' && 
        chat.members?.some(member => member.id === targetUser.id)
      );

      if (existingChat) {
        handleChatSelect(existingChat.id);
        setShowUserSearchModal(false);
        setIsCreatingChat(false);
        return;
      }

      // Create new private chat using API
      const createData = {
        type: 'private',
        participants: [targetUser.id]
      };

      const response = await chatAPI.createChat(createData);
      
      if (response.data.success) {
        const newChat = response.data.chat;
        
        // Transform API response to match frontend format
        const transformedChat = {
          id: newChat._id,
          name: getChatDisplayName(newChat),
          type: newChat.type,
          avatar: newChat.avatar,
          members: newChat.participants?.map(p => ({
            id: p.user._id || p.user,
            name: p.user.name || 'Unknown',
            online: p.user.isOnline || false
          })) || [],
          lastMessage: null,
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          isArchived: false,
          isTyping: false,
          updatedAt: new Date(newChat.updatedAt)
        };

        setChats(prev => [transformedChat, ...prev]);
        handleChatSelect(transformedChat.id);
        setShowUserSearchModal(false);

        showNotification({
          type: 'success',
          title: 'Chat Started!',
          message: `You can now chat with ${targetUser.name}`,
        });
      } else {
        throw new Error(response.data.message || 'Failed to create chat');
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to start chat. Please try again.'
      });
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleVoiceCall = (chat) => {
    setCurrentCall({
      ...chat,
      type: 'voice',
      participant: chat.type === 'group' 
        ? { name: chat.name, avatar: chat.avatar }
        : chat.members?.find(m => m.id !== user?.id)
    });
    setCallStatus('calling');
    setShowCallModal(true);

    // Simulate call connection after 3 seconds
    setTimeout(() => {
      setCallStatus('connected');
    }, 3000);
  };

  const handleVideoCall = (chat) => {
    setCurrentCall({
      ...chat,
      type: 'video',
      participant: chat.type === 'group' 
        ? { name: chat.name, avatar: chat.avatar }
        : chat.members?.find(m => m.id !== user?.id)
    });
    setCallStatus('calling');
    setShowCallModal(true);

    // Simulate call connection after 3 seconds
    setTimeout(() => {
      setCallStatus('connected');
    }, 3000);
  };

  const handleEndCall = () => {
    setShowCallModal(false);
    setCurrentCall(null);
    setCallStatus('calling');
  };

  const handleAcceptCall = () => {
    setCallStatus('connected');
  };

  const handleDeclineCall = () => {
    handleEndCall();
  };

  const handleAddMembers = (chat) => {
    // Open user search modal to add members to group
    console.log('Add members to:', chat.name);
    setShowUserSearchModal(true);
  };

  const handleChatInfo = (chat) => {
    console.log('Opening chat info for:', chat.name);
    // You can implement a chat info modal here
  };

  const handleBack = () => {
    setSelectedChatId(null);
    navigate('/dashboard');
  };

  const handleSendFriendRequest = async (userId) => {
    // Mock friend request - replace with real API call
    console.log('Sending friend request to:', userId);
    showNotification({
      type: 'success',
      title: 'Friend Request Sent!',
      message: 'Your friend request has been sent successfully'
    });
  };

  const handleAcceptFriendRequest = async (userId) => {
    // Mock accept friend request - replace with real API call
    console.log('Accepting friend request from:', userId);
    showNotification({
      type: 'success',
      title: 'Friend Request Accepted!',
      message: 'You are now connected'
    });
  };

  const handleDeclineFriendRequest = async (userId) => {
    // Mock decline friend request - replace with real API call
    console.log('Declining friend request from:', userId);
  };

  const selectedChat = chats.find(chat => chat.id === selectedChatId);
  const unreadNotificationCount = inAppNotifications.filter(n => !n.read).length;

  return (
    <div className="h-screen bg-gray-50 dark:bg-dark-900 flex overflow-hidden">
      {/* Sidebar - always visible on desktop, conditional on mobile */}
      <div className={`${selectedChatId ? 'hidden lg:flex' : 'flex'} flex-shrink-0`}>
        <Sidebar
          selectedChatId={selectedChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onNewGroup={handleNewGroup}
          chats={chats}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {/* Chat Area */}
      <div className={`flex-1 ${selectedChatId ? 'flex' : 'hidden lg:flex'}`}>
        <ChatRoom
          chat={selectedChat}
          onBack={handleBack}
          onVoiceCall={handleVoiceCall}
          onVideoCall={handleVideoCall}
          onAddMembers={handleAddMembers}
          onChatInfo={handleChatInfo}
        />
      </div>

      {/* Floating Action Button (Mobile) */}
      <div className="lg:hidden">
        <FloatingActionButton
          onNewChat={handleNewChat}
          onNewGroup={handleNewGroup}
          onFindPeople={() => setShowUserSearchModal(true)}
          onOpenNotifications={() => setShowNotificationCenter(true)}
          notificationCount={unreadNotificationCount}
        />
      </div>

      {/* Modals */}
      <AnimatePresence>
        {/* Call Modal */}
        {showCallModal && currentCall && (
          <CallModal
            isOpen={showCallModal}
            onClose={handleEndCall}
            callType={currentCall.type}
            callStatus={callStatus}
            participant={currentCall.participant}
            onAccept={handleAcceptCall}
            onDecline={handleDeclineCall}
            onToggleMute={(muted) => console.log('Mute:', muted)}
            onToggleVideo={(videoOn) => console.log('Video:', videoOn)}
            onToggleSpeaker={(speakerOn) => console.log('Speaker:', speakerOn)}
          />
        )}

        {/* Group Chat Creation Modal */}
        {showGroupModal && (
          <GroupChatModal
            isOpen={showGroupModal}
            onClose={() => setShowGroupModal(false)}
            onCreateGroup={handleCreateGroup}
            availableUsers={[]} // Pass your available users list here
          />
        )}

        {/* User Search Modal */}
        {showUserSearchModal && (
          <UserSearchModal
            isOpen={showUserSearchModal}
            onClose={() => setShowUserSearchModal(false)}
            onStartChat={handleStartChat}
            onSendFriendRequest={handleSendFriendRequest}
            onAcceptFriendRequest={handleAcceptFriendRequest}
            onDeclineFriendRequest={handleDeclineFriendRequest}
          />
        )}

        {/* Notification Center */}
        {showNotificationCenter && (
          <NotificationCenter
            isOpen={showNotificationCenter}
            onClose={() => setShowNotificationCenter(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Notification Bell (in top bar or sidebar) */}
      <div className="hidden lg:block">
        {/* This would typically be in your header/sidebar */}
        {unreadNotificationCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="fixed top-4 right-4 z-30"
          >
            <button
              onClick={() => setShowNotificationCenter(true)}
              className="relative p-3 bg-white dark:bg-dark-800 rounded-full shadow-lg border border-gray-200 dark:border-dark-600 hover:shadow-xl transition-all duration-200"
            >
              <Bell size={20} className="text-gray-600 dark:text-gray-400" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
              </span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Socket Event Listeners */}
      {socket && (
        <SocketEventHandler 
          socket={socket}
          onNewMessage={(data) => {
            // Update chat with new message
            setChats(prev => prev.map(chat => 
              chat.id === data.chatId 
                ? { 
                    ...chat, 
                    lastMessage: data.message,
                    unreadCount: chat.id === selectedChatId ? 0 : chat.unreadCount + 1,
                    isTyping: false
                  }
                : chat
            ));

            // Show notification if not in current chat
            if (data.chatId !== selectedChatId) {
              showNotification({
                type: 'message',
                title: `New message from ${data.message.sender?.name}`,
                message: data.message.text,
                onClick: () => handleChatSelect(data.chatId)
              });
            }
          }}
          onUserTyping={(data) => {
            setChats(prev => prev.map(chat => 
              chat.id === data.chatId 
                ? { ...chat, isTyping: data.userId !== user?.id }
                : chat
            ));
          }}
          onUserStoppedTyping={(data) => {
            setChats(prev => prev.map(chat => 
              chat.id === data.chatId 
                ? { ...chat, isTyping: false }
                : chat
            ));
          }}
          onIncomingCall={(data) => {
            setCurrentCall({
              ...data,
              participant: { name: data.callerName, avatar: data.callerAvatar }
            });
            setCallStatus('incoming');
            setShowCallModal(true);

            showNotification({
              type: 'incoming_call',
              title: `Incoming ${data.type} call`,
              message: `${data.callerName} is calling...`,
              actionable: true
            });
          }}
        />
      )}
    </div>
  );
};

// Socket Event Handler Component
const SocketEventHandler = ({ socket, onNewMessage, onUserTyping, onUserStoppedTyping, onIncomingCall }) => {
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', onNewMessage);
    socket.on('user_typing', onUserTyping);
    socket.on('user_stopped_typing', onUserStoppedTyping);
    socket.on('incoming_call', onIncomingCall);

    return () => {
      socket.off('receive_message', onNewMessage);
      socket.off('user_typing', onUserTyping);
      socket.off('user_stopped_typing', onUserStoppedTyping);
      socket.off('incoming_call', onIncomingCall);
    };
  }, [socket, onNewMessage, onUserTyping, onUserStoppedTyping, onIncomingCall]);

  return null;
};

export default Dashboard;