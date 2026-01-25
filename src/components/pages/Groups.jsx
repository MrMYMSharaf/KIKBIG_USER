import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaPaperPlane } from 'react-icons/fa';
import { HiPlus } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetCurrentUserQuery } from '../../features/authSlice';
import { 
  useGetMessagesQuery, 
  useSendMessageMutation, 
  useGetChatListQuery
} from '../../features/chatSlice';

// Main Chat Component
const Groups = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get authentication status from Redux
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  
  // Get userId from API call - backend decodes JWT cookie and returns user info
  const { data: currentUserData, isLoading: isLoadingUser, error: userError } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Extract userId from the API response
  const userId = currentUserData?.user?._id || currentUserData?.user?.id || currentUserData?._id || currentUserData?.id;

  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobileChatVisible, setIsMobileChatVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // ✅ Handle incoming navigation from page details
  useEffect(() => {
    console.log('Location state:', location.state);
    
    if (location.state?.selectedUser) {
      console.log('Setting chat from navigation:', location.state.selectedUser);
      
      // Store the selected user with all its properties including pageTitle
      setSelectedChat(location.state.selectedUser);
      setIsMobileChatVisible(true);
      
      // Clear the location state to prevent re-selection on refresh
      setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 100);
    }
  }, [location.state, navigate, location.pathname]);

  // Queries
  const { data: chatListData } = useGetChatListQuery(userId, { skip: !userId });

  // Individual chat messages
  const { data: individualMessagesData } = useGetMessagesQuery(
  {
    receiverId: selectedChat?._id,
    receiverType: selectedChat?.type || 'user', // ✅ Added receiverType
  },
  {
    skip: !userId || !selectedChat,
    pollingInterval: 3000,
  }
);

  const [sendMessageMutation] = useSendMessageMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [individualMessagesData]);

  const handleContactSelect = (contact) => {
    setSelectedChat(contact);
    setIsMobileChatVisible(true);
  };

  const handleBackToContacts = () => {
    setIsMobileChatVisible(false);
    setSelectedChat(null);
  };

 const handleSendMessage = async () => {
  if (!message.trim() || !selectedChat || !userId) return;

  try {
    await sendMessageMutation({
      receiverId: selectedChat._id,
      receiverType: selectedChat.type || 'user', // ✅ Added receiverType
      message: message.trim(),
    }).unwrap();
    setMessage('');
  } catch (error) {
    console.error('Failed to send message:', error);
    alert('Failed to send message');
  }
};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter contacts based on search
  const filteredContacts = (chatListData?.data || []).filter((contact) => {
    return contact.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const currentMessages = individualMessagesData?.data;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // ✅ Get display title - page title if available, otherwise user name
  const getChatTitle = () => {
    if (!selectedChat) return 'Unknown';
    // Check if this chat has a page title (came from page details)
    if (selectedChat.pageTitle) {
      return selectedChat.pageTitle;
    }
    // Otherwise use the user's name
    return selectedChat.name || 'Unknown';
  };

  // ✅ Get subtitle - shows "via Owner Name" if from page, nothing for regular users
  const getChatSubtitle = () => {
    if (!selectedChat) return '';
    // If there's a page title, show who you're messaging
    if (selectedChat.pageTitle) {
      return `via ${selectedChat.name || 'Page Owner'}`;
    }
    // For regular user chats, show nothing (no email)
    return '';
  };

  // Show loading while fetching user
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <h2 className="text-2xl font-bold text-gray-700">Loading...</h2>
      </div>
    );
  }

  // Show login message if not authenticated or no userId
  if (!isAuthenticated || !userId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <h2 className="text-2xl font-bold text-gray-700">Please log in to access chat</h2>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`w-full md:w-1/3 bg-white border-r border-gray-300 ${isMobileChatVisible ? 'hidden md:block' : 'block'}`}>
        <div className="flex flex-col p-4 bg-green-500 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center p-1 bg-green-100 rounded-full hover:bg-green-300 cursor-pointer">
              <HiPlus className="w-8 h-8 text-green-500" />
              <h1 className="text-lg font-bold ml-2 text-green-500">Chats</h1>
            </div>
          </div>

          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search chats"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 text-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
          {filteredContacts.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              {searchTerm ? 'No chats found' : 'No chats yet'}
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact._id}
                className={`flex items-center p-4 hover:bg-gray-100 cursor-pointer ${
                  selectedChat?._id === contact._id ? 'bg-gray-100' : ''
                }`}
                onClick={() => handleContactSelect(contact)}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-green-500">
                  {contact.pageTitle 
                    ? contact.pageTitle.charAt(0).toUpperCase() 
                    : contact.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="ml-4 flex-1">
                  {/* Show page title if available, otherwise show user name */}
                  <p className="font-bold text-gray-800">
                    {contact.pageTitle || contact.name || 'Unknown'}
                  </p>
                  {/* Only show subtitle if it's from a page */}
                  {contact.pageTitle && (
                    <p className="text-sm text-gray-600 truncate">
                      via {contact.name || 'Page Owner'}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${isMobileChatVisible ? 'fixed inset-0 z-50 block' : 'hidden md:flex'} flex-1 flex-col relative bg-white`}>
        {selectedChat ? (
          <>
            {/* ✅ Updated Chat Header with dynamic title */}
            <div className='flex justify-between items-center p-4 bg-green-500 text-white shadow-md'>
              <div className="flex items-center flex-1">
                <button className="md:hidden mr-4 text-2xl" onClick={handleBackToContacts}>←</button>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-green-700">
                  {selectedChat.pageTitle 
                    ? selectedChat.pageTitle.charAt(0).toUpperCase() 
                    : selectedChat.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  {/* ✅ Show page title or user name */}
                  <h1 className="text-xl font-bold truncate">{getChatTitle()}</h1>
                  {/* ✅ Show subtitle only if it exists */}
                  {getChatSubtitle() && (
                    <p className="text-sm text-green-100 truncate">
                      {getChatSubtitle()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 bg-gray-50 overflow-y-auto" style={{ paddingBottom: '80px' }}>
              {!currentMessages || currentMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <p className="text-lg mb-2">No messages yet</p>
                    {selectedChat.pageTitle && (
                      <p className="text-sm text-gray-400">
                        Start a conversation about "{selectedChat.pageTitle}"
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {currentMessages.map((msg, index) => {
                    const isCurrentUser = msg.senderId._id === userId || msg.senderId === userId;
                    const showDateHeader = index === 0 || 
                      formatMessageDate(currentMessages[index - 1].createdAt) !== formatMessageDate(msg.createdAt);

                    return (
                      <div key={msg._id || index}>
                        {showDateHeader && (
                          <div className="text-center text-xs text-gray-500 my-4">
                            {formatMessageDate(msg.createdAt)}
                          </div>
                        )}
                        <div className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex items-end max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isCurrentUser && (
                              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold mr-2 flex-shrink-0">
                                {msg.senderId.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                            <div className={`${isCurrentUser ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'} p-3 rounded-lg shadow`}>
                              <p className="text-sm break-words">{msg.message}</p>
                              <p className={`text-xs mt-1 ${isCurrentUser ? 'text-green-100' : 'text-gray-500'}`}>
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="absolute bottom-0 left-0 w-full bg-white p-4 border-t shadow-lg">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder={selectedChat.pageTitle 
                    ? `Message about ${selectedChat.pageTitle}...` 
                    : "Type a message"}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 p-3 pl-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className={`${message.trim() ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300'} text-white p-3 rounded-full`}
                >
                  <FaPaperPlane className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <FaPaperPlane className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold mb-2">Welcome to Chat</h2>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;