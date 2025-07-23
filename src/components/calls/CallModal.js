// Create this file: src/components/calls/CallModal.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, PhoneOff, Video, VideoOff, Mic, MicOff, 
  Volume2, VolumeX, X 
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const CallModal = ({ 
  isOpen, 
  onClose, 
  callType = 'voice', // 'voice' or 'video'
  callStatus = 'calling', // 'calling', 'connected', 'incoming'
  participant,
  onAccept,
  onDecline,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    onToggleMute && onToggleMute(!isMuted);
  };

  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    onToggleVideo && onToggleVideo(!isVideoOn);
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    onToggleSpeaker && onToggleSpeaker(!isSpeakerOn);
  };

  const handleEndCall = () => {
    setCallDuration(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative w-full h-full max-w-2xl max-h-2xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={handleEndCall}
          className="absolute top-4 right-4 z-10 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Call Content */}
        <div className="flex flex-col items-center justify-center h-full text-white">
          <motion.div
            animate={callStatus === 'calling' ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-8"
          >
            <Avatar 
              name={participant?.name} 
              src={participant?.avatar}
              size="xl"
              className="w-32 h-32"
            />
          </motion.div>

          <h2 className="text-2xl font-semibold mb-2">{participant?.name}</h2>
          
          <div className="text-center mb-8">
            {callStatus === 'calling' && (
              <p className="text-gray-300 animate-pulse">
                {callType === 'video' ? 'Video calling...' : 'Calling...'}
              </p>
            )}
            
            {callStatus === 'incoming' && (
              <p className="text-gray-300">
                Incoming {callType} call
              </p>
            )}
            
            {callStatus === 'connected' && (
              <p className="text-gray-300 font-mono text-lg">
                {formatDuration(callDuration)}
              </p>
            )}
          </div>

          {/* Incoming Call Actions */}
          {callStatus === 'incoming' && (
            <div className="flex space-x-8 mb-8">
              <Button
                variant="ghost"
                size="lg"
                onClick={onDecline}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
              >
                <PhoneOff size={24} />
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                onClick={onAccept}
                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white"
              >
                <Phone size={24} />
              </Button>
            </div>
          )}

          {/* Call Controls */}
          {callStatus === 'connected' && (
            <div className="flex items-center justify-center space-x-4">
              {/* Mute Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleMute}
                className={`p-4 rounded-full transition-colors ${
                  isMuted 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-black/30 hover:bg-black/50'
                } text-white backdrop-blur-sm`}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </motion.button>

              {/* Video Toggle (for video calls) */}
              {callType === 'video' && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleVideo}
                  className={`p-4 rounded-full transition-colors ${
                    !isVideoOn 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-black/30 hover:bg-black/50'
                  } text-white backdrop-blur-sm`}
                >
                  {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                </motion.button>
              )}

              {/* Speaker Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleSpeaker}
                className={`p-4 rounded-full transition-colors ${
                  isSpeakerOn 
                    ? 'bg-primary-500 hover:bg-primary-600' 
                    : 'bg-black/30 hover:bg-black/50'
                } text-white backdrop-blur-sm`}
              >
                {isSpeakerOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
              </motion.button>

              {/* End Call Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleEndCall}
                className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                <PhoneOff size={24} />
              </motion.button>
            </div>
          )}
        </div>

        {/* Connection Status */}
        {callStatus === 'calling' && (
          <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Connecting...</span>
            </div>
          </div>
        )}

        {callStatus === 'connected' && (
          <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Connected</span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CallModal;