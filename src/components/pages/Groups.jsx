import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaPaperPlane, FaSmile, FaPaperclip } from 'react-icons/fa';
import { HiPlus, HiDotsVertical } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Store, ChevronDown, Phone, Video } from 'lucide-react';
import { useGetCurrentUserQuery } from '../../features/authSlice';
import { useGetMyPagesQuery } from '../../features/pageApiSlice';
import { 
  useGetMessagesQuery, 
  useSendMessageMutation,
  useSendMessageAsPageMutation,
  useGetChatListQuery
} from '../../features/chatSlice';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

const Groups = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  
  const { data: currentUserData, isLoading: isLoadingUser } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  const { data: myPagesData } = useGetMyPagesQuery({}, {
    skip: !isAuthenticated,
  });

  const userId = currentUserData?.user?._id || currentUserData?.user?.id || currentUserData?._id || currentUserData?.id;
  const userPages = myPagesData?.pages || [];

  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedType, setSelectedType] = useState('user');
  const [isMobileChatVisible, setIsMobileChatVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPageFilter, setSelectedPageFilter] = useState('all');
  const [showPageDropdown, setShowPageDropdown] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  
  // ✅ NEW: Track if we've already processed the navigation state
  const hasProcessedNavigation = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const { data: chatListData, refetch: refetchChatList, isLoading: chatListLoading } = useGetChatListQuery(
    selectedPageFilter,
    { 
      skip: !userId,
      pollingInterval: 5000
    }
  );

  // Socket initialization
  useEffect(() => {
    if (!userId) return;

    // Don't reconnect if already connected
    if (socketRef.current?.connected) {
      console.log('✅ Socket already connected, skipping reconnection');
      return;
    }

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsSocketConnected(true);
      socket.emit('join', userId);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsSocketConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsSocketConnected(false);
    });

    return () => {
      if (socketRef.current) {
        console.log('🔌 Disconnecting socket...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId]);

  // ✅ IMPROVED: Handle navigation from PageDetail/AdDetail - ONLY RUN ONCE
  useEffect(() => {
    // Skip if already processed or no navigation state
    if (hasProcessedNavigation.current || !location.state?.selectedUser) {
      return;
    }

    const user = location.state.selectedUser;
    const chatType = location.state.type || (user.accountType === "page" ? "page" : "user");
    
    console.log("📍 Opening chat from PageDetail/AdDetail:", {
      userId: user._id,
      userName: user.name,
      chatType: chatType,
      hasProcessedBefore: hasProcessedNavigation.current
    });
    
    // ✅ Mark as processed IMMEDIATELY to prevent re-runs
    hasProcessedNavigation.current = true;
    
    // ✅ Create a temporary chat object
    const chatObject = {
      _id: user._id,
      partnerId: user._id,
      partnerName: user.name || user.pageTitle || 'Unknown',
      partnerType: chatType,
      accountType: user.accountType,
      isNewChat: true,
      lastMessage: 'Start a conversation...',
      unreadCount: 0
    };
    
    console.log("✅ Setting selectedChat:", chatObject);
    
    // Set all states together
    setSelectedChat(chatObject);
    setSelectedType(chatType);
    setIsMobileChatVisible(true);
    
    // Clear navigation state after a delay
    setTimeout(() => {
      console.log("🧹 Clearing navigation state");
      window.history.replaceState({}, document.title);
    }, 500);
    
  }, [location.state]); // Only depend on location.state

  // ✅ Reset the processed flag when leaving the page
  useEffect(() => {
    return () => {
      hasProcessedNavigation.current = false;
    };
  }, []);

  // Reset chat when page filter changes
  useEffect(() => {
    if (selectedPageFilter !== 'all') {
      console.log("🔄 Page filter changed, resetting chat");
      setSelectedChat(null);
      setSelectedType('user');
      setIsMobileChatVisible(false);
    }
  }, [selectedPageFilter]);

  const { data: individualMessagesData, refetch: refetchMessages, isLoading: messagesLoading } = useGetMessagesQuery(
    {
      receiverId: selectedPageFilter !== 'all' && selectedChat 
        ? selectedPageFilter
        : (selectedChat?._id || selectedChat?.partnerId),
      receiverType: selectedPageFilter !== 'all' && selectedChat
        ? 'page'
        : selectedType,
    },
    {
      skip: !userId || !selectedChat || !(selectedChat?._id || selectedChat?.partnerId),
      pollingInterval: 3000,
    }
  );

  useEffect(() => {
    if (selectedChat && (selectedChat._id || selectedChat.partnerId)) {
      refetchMessages();
    }
  }, [selectedChat, refetchMessages, selectedPageFilter]);

  const [sendMessageMutation] = useSendMessageMutation();
  const [sendMessageAsPageMutation] = useSendMessageAsPageMutation();

  // Socket event handlers
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !userId) return;

    const handleNewMessage = (newMessage) => {
      console.log("📨 New message received:", newMessage);
      if (selectedChat && (
        (newMessage.senderId === selectedChat._id || newMessage.senderId === selectedChat.partnerId) ||
        (newMessage.receiverId === userId && newMessage.senderId === (selectedChat._id || selectedChat.partnerId))
      )) {
        refetchMessages();
      }
      refetchChatList();
    };

    const handleUpdateChatList = () => {
      console.log("🔄 Chat list update received");
      refetchChatList();
    };

    const handleUserTyping = (data) => {
      if (selectedChat && data.userId === (selectedChat._id || selectedChat.partnerId)) {
        setIsTyping(data.isTyping);
      }
    };

    const handleMessagesRead = () => {
      refetchChatList();
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('updateChatList', handleUpdateChatList);
    socket.on('userTyping', handleUserTyping);
    socket.on('messagesRead', handleMessagesRead);

    return () => {
      if (socket) {
        socket.off('newMessage', handleNewMessage);
        socket.off('updateChatList', handleUpdateChatList);
        socket.off('userTyping', handleUserTyping);
        socket.off('messagesRead', handleMessagesRead);
      }
    };
  }, [userId, selectedChat, refetchMessages, refetchChatList]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [individualMessagesData]);

  const handleContactSelect = (contact) => {
    console.log("👤 Contact selected:", contact);
    if (selectedPageFilter !== 'all') {
      setSelectedChat(contact);
      setSelectedType('page');
    } else {
      setSelectedChat(contact);
      setSelectedType(contact.partnerType || 'user');
    }
    setIsMobileChatVisible(true);
  };

  const handleBackToContacts = () => {
    setIsMobileChatVisible(false);
    // Don't clear selectedChat on mobile, just hide the chat view
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !userId) {
      return;
    }

    try {
      let shouldSendAsPage = false;
      let pageToSendFrom = null;
      let actualReceiverId = selectedChat._id || selectedChat.partnerId;
      let actualReceiverType = selectedType;

      const chatPartnerId = selectedChat._id || selectedChat.partnerId;
      const ownedPage = userPages.find(p => p._id === chatPartnerId);

      if (selectedPageFilter !== 'all') {
        shouldSendAsPage = true;
        pageToSendFrom = selectedPageFilter;
      } else if (ownedPage && selectedType === 'page') {
        shouldSendAsPage = true;
        pageToSendFrom = ownedPage._id;
        
        const currentMessages = individualMessagesData?.data || [];
        if (currentMessages.length > 0) {
          const lastMsg = currentMessages[currentMessages.length - 1];
          
          const extractId = (id) => {
            if (!id) return null;
            if (typeof id === 'string') return id;
            if (id._id) return id._id.toString();
            return id.toString();
          };
          
          const lastMsgSenderId = extractId(lastMsg.senderId);
          const lastMsgReceiverId = extractId(lastMsg.receiverId);
          
          if (lastMsg.senderType === 'page' && lastMsgSenderId === pageToSendFrom) {
            actualReceiverId = lastMsgReceiverId;
            actualReceiverType = lastMsg.receiverType;
          } else {
            actualReceiverId = lastMsgSenderId;
            actualReceiverType = lastMsg.senderType;
          }
        }
      }

      if (shouldSendAsPage && pageToSendFrom) {
        const messageData = {
          pageId: pageToSendFrom,
          receiverId: actualReceiverId,
          receiverType: actualReceiverType,
          message: message.trim(),
        };

        console.log('📤 Sending as page:', messageData);
        await sendMessageAsPageMutation(messageData).unwrap();
      } else {
        const messageData = {
          receiverId: selectedChat._id || selectedChat.partnerId,
          receiverType: selectedType,
          message: message.trim(),
        };

        console.log('📤 Sending as user:', messageData);
        await sendMessageMutation(messageData).unwrap();
      }

      setMessage('');
      
      // ✅ Clear the "isNewChat" flag after first message is sent
      if (selectedChat?.isNewChat) {
        console.log("✅ Clearing isNewChat flag");
        setSelectedChat(prev => ({ ...prev, isNewChat: false }));
      }
      
      if (socketRef.current && isSocketConnected) {
        const receiverId = shouldSendAsPage && pageToSendFrom
          ? pageToSendFrom 
          : (selectedChat._id || selectedChat.partnerId);
        const receiverType = shouldSendAsPage ? 'page' : selectedType;
        
        socketRef.current.emit('typing', {
          userId,
          receiverId,
          receiverType,
          isTyping: false
        });
      }

      await refetchMessages();
      await refetchChatList();
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      alert('Failed to send message: ' + (error.data?.message || error.message));
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (socketRef.current && isSocketConnected && selectedChat) {
      const receiverId = selectedPageFilter !== 'all' 
        ? selectedPageFilter 
        : (selectedChat._id || selectedChat.partnerId);
      const receiverType = selectedPageFilter !== 'all' ? 'page' : selectedType;
      
      socketRef.current.emit('typing', {
        userId,
        receiverId,
        receiverType,
        isTyping: e.target.value.length > 0
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const allContacts = chatListData?.data || [];
  const filteredContacts = allContacts.filter((contact) => {
    const matchesSearch = contact.partnerName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const userChats = filteredContacts.filter((chat) => chat.partnerType === "user");
  const pageChats = filteredContacts.filter((chat) => chat.partnerType === "page");
  const currentMessages = individualMessagesData?.data || [];

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  const formatLastMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const diffInDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }
  };

  const getChatTitle = () => {
    if (!selectedChat) return 'Unknown';
    
    if (selectedPageFilter !== 'all') {
      const selectedPageInfo = userPages.find(p => p._id === selectedPageFilter);
      return selectedPageInfo?.title || 'Page Chat';
    }
    
    return selectedChat.name || selectedChat.partnerName || selectedChat.pageTitle || 'Unknown';
  };

  // ✅ Add debug logging
  console.log("🔍 Render state:", {
    selectedChat: selectedChat?.partnerName,
    isNewChat: selectedChat?.isNewChat,
    isMobileChatVisible,
    selectedType,
    chatListLength: filteredContacts.length
  });

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Loading your chats...</h2>
          <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center bg-white p-10 rounded-2xl shadow-2xl border border-blue-100">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access your chats</p>
        </div>
      </div>
    );
  }

  const selectedPageInfo = userPages.find(p => p._id === selectedPageFilter);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Sidebar */}
      <div className={`w-full md:w-[420px] bg-white border-r border-blue-100 ${isMobileChatVisible ? 'hidden md:flex' : 'flex'} flex-col shadow-xl`}>
        {/* Sidebar Header - keeping all the existing UI code */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="relative flex flex-col p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Messages</h1>
                  <p className="text-xs text-blue-100">{filteredContacts.length} conversations</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md ${isSocketConnected ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                  <div className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-green-300' : 'bg-red-300'} animate-pulse`}></div>
                  <span className="text-xs font-semibold text-white">{isSocketConnected ? 'Online' : 'Offline'}</span>
                </div>
                <button className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200">
                  <HiPlus className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Page Filter Dropdown */}
            {userPages.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowPageDropdown(!showPageDropdown)}
                  className="w-full flex items-center justify-between bg-white/15 hover:bg-white/25 backdrop-blur-md px-4 py-3 rounded-xl transition-all duration-200 border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Store className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {selectedPageFilter === 'all' ? 'All Chats' : selectedPageInfo?.title || 'Select Page'}
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 ${showPageDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showPageDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl z-20 overflow-hidden border border-blue-100 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedPageFilter('all');
                        setShowPageDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors text-sm font-medium ${
                        selectedPageFilter === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      All Chats
                    </button>
                    {userPages.map((page) => (
                      <button
                        key={page._id}
                        onClick={() => {
                          setSelectedPageFilter(page._id);
                          setShowPageDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3 text-sm font-medium ${
                          selectedPageFilter === page._id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <Store className="w-4 h-4" />
                        {page.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/15 backdrop-blur-md border border-white/20 text-white placeholder-blue-100 rounded-xl focus:outline-none focus:bg-white/25 focus:border-white/40 transition-all duration-200 text-sm"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-100 text-sm" />
            </div>
          </div>
        </div>

        {/* Chat List - Rest of the UI remains the same as before */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-50/30 to-white">
          {chatListLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-4">
                  <div className="absolute inset-0 border-3 border-blue-200 rounded-full"></div>
                  <div className="absolute inset-0 border-3 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-sm font-medium text-gray-600">Loading chats...</p>
              </div>
            </div>
          ) : filteredContacts.length === 0 && !selectedChat?.isNewChat ? (
            <div className="text-center p-12">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPaperPlane className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No conversations yet</h3>
              <p className="text-sm text-gray-500">
                {searchTerm ? 'No chats match your search' : 'Start a new conversation to get started'}
              </p>
            </div>
          ) : (
            /* Chat list rendering code - same as before */
            <div className="space-y-1 p-2">
              {userChats.length > 0 && (
                <div>
                  {selectedPageFilter === 'all' && (
                    <div className="px-3 py-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Personal Messages</span>
                    </div>
                  )}
                  {userChats.map((contact) => (
                    <div
                      key={`user-${contact.partnerId}`}
                      className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-blue-50 group ${
                        selectedChat?.partnerId === contact.partnerId ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg' : ''
                      }`}
                      onClick={() => handleContactSelect(contact)}
                    >
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold shadow-md ${
                          selectedChat?.partnerId === contact.partnerId 
                            ? 'bg-white text-blue-600' 
                            : 'bg-gradient-to-br from-blue-500 to-blue-600'
                        }`}>
                          {contact.partnerName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        {isSocketConnected && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`font-bold text-sm truncate ${
                            selectedChat?.partnerId === contact.partnerId ? 'text-white' : 'text-gray-900'
                          }`}>
                            {contact.partnerName || 'Unknown'}
                          </p>
                          {contact.lastMessageTime && (
                            <span className={`text-xs ml-2 ${
                              selectedChat?.partnerId === contact.partnerId ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatLastMessageTime(contact.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs truncate ${
                            selectedChat?.partnerId === contact.partnerId ? 'text-blue-100' : 'text-gray-600'
                          }`}>
                            {contact.lastMessage || 'No messages yet'}
                          </p>
                          {contact.unreadCount > 0 && (
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                              selectedChat?.partnerId === contact.partnerId 
                                ? 'bg-white text-blue-600' 
                                : 'bg-blue-600 text-white'
                            }`}>
                              {contact.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {pageChats.length > 0 && (
                <div className="mt-2">
                  {selectedPageFilter === 'all' && (
                    <div className="px-3 py-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Page Conversations</span>
                    </div>
                  )}
                  {pageChats.map((contact) => (
                    <div
                      key={`page-${contact.partnerId}`}
                      className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-purple-50 group ${
                        selectedChat?.partnerId === contact.partnerId && selectedType === 'page' ? 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg' : ''
                      }`}
                      onClick={() => handleContactSelect(contact)}
                    >
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold shadow-md ${
                          selectedChat?.partnerId === contact.partnerId && selectedType === 'page'
                            ? 'bg-white text-purple-600' 
                            : 'bg-gradient-to-br from-purple-500 to-purple-600'
                        }`}>
                          {contact.partnerName?.charAt(0).toUpperCase() || '?'}
                        </div>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`font-bold text-sm truncate ${
                            selectedChat?.partnerId === contact.partnerId && selectedType === 'page' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {contact.partnerName || 'Unknown'}
                          </p>
                          {contact.lastMessageTime && (
                            <span className={`text-xs ml-2 ${
                              selectedChat?.partnerId === contact.partnerId && selectedType === 'page' ? 'text-purple-100' : 'text-gray-500'
                            }`}>
                              {formatLastMessageTime(contact.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs truncate ${
                            selectedChat?.partnerId === contact.partnerId && selectedType === 'page' ? 'text-purple-100' : 'text-gray-600'
                          }`}>
                            {contact.lastMessage || 'No messages yet'}
                          </p>
                          {contact.unreadCount > 0 && (
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                              selectedChat?.partnerId === contact.partnerId && selectedType === 'page'
                                ? 'bg-white text-purple-600' 
                                : 'bg-purple-600 text-white'
                            }`}>
                              {contact.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area - Keep the full implementation from the previous fix */}
      <div className={`${isMobileChatVisible ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700"></div>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative flex items-center justify-between px-5 py-4">
                <div className="flex items-center flex-1 min-w-0">
                  <button 
                    className="md:hidden mr-3 p-2 hover:bg-white/20 rounded-xl transition-colors" 
                    onClick={handleBackToContacts}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold bg-white/20 backdrop-blur-sm shadow-lg">
                      {getChatTitle().charAt(0).toUpperCase()}
                    </div>
                    {isSocketConnected && !isTyping && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-blue-600 rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <h2 className="font-bold text-white text-lg truncate">{getChatTitle()}</h2>
                    <p className="text-sm text-blue-100">
                      {isTyping ? (
                        <span className="flex items-center gap-1">
                          <span className="inline-flex gap-1">
                            <span className="w-2 h-2 bg-blue-200 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-blue-200 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                            <span className="w-2 h-2 bg-blue-200 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          </span>
                          <span className="ml-1">typing...</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          {isSocketConnected && <span className="w-2 h-2 bg-green-300 rounded-full"></span>}
                          {isSocketConnected ? 'Active now' : 'Offline'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200">
                    <Phone className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200">
                    <Video className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200">
                    <HiDotsVertical className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-6 py-6"
              style={{
                background: 'linear-gradient(to bottom, #f0f9ff, #ffffff)',
                backgroundImage: `
                  radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(147, 197, 253, 0.03) 0%, transparent 50%)
                `
              }}
            >
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-sm font-medium text-gray-600">Loading messages...</p>
                  </div>
                </div>
              ) : !currentMessages || currentMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                      <FaPaperPlane className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Start the conversation</h3>
                    <p className="text-gray-600">Send a message to {getChatTitle()}</p>
                  </div>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto">
                  {currentMessages.map((msg, index) => {
                    let isCurrentUser = false;
                    
                    const getSenderId = (id) => {
                      if (!id) return null;
                      if (typeof id === 'string') return id;
                      if (id._id) return id._id.toString();
                      return id.toString();
                    };
                    
                    const senderIdStr = getSenderId(msg.senderId);
                    
                    if (msg.senderType === 'user') {
                      isCurrentUser = senderIdStr === userId;
                    } else if (msg.senderType === 'page') {
                      const ownedPage = userPages.find(p => p._id === senderIdStr);
                      isCurrentUser = !!ownedPage;
                    }
                    
                    const showDateHeader = index === 0 || 
                      formatMessageDate(currentMessages[index - 1].createdAt) !== formatMessageDate(msg.createdAt);

                    return (
                      <div key={msg._id || index}>
                        {showDateHeader && (
                          <div className="flex justify-center my-6">
                            <span className="bg-blue-500/10 backdrop-blur-sm px-4 py-2 rounded-full text-xs text-blue-700 font-semibold border border-blue-200 shadow-sm">
                              {formatMessageDate(msg.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={`mb-3 flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}>
                          <div className={`max-w-[70%] ${isCurrentUser ? '' : 'flex items-end gap-2'}`}>
                            {!isCurrentUser && (
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-gray-400 to-gray-500 flex-shrink-0 shadow-md">
                                {msg.senderName?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                            <div className="flex flex-col">
                              {!isCurrentUser && (
                                <p className="text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                                  {msg.senderName}
                                  {msg.senderType === 'page' && (
                                    <span className="ml-1 text-purple-600 font-normal">(Page)</span>
                                  )}
                                </p>
                              )}
                              <div className={`relative px-4 py-3 shadow-lg ${
                                isCurrentUser 
                                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-md' 
                                  : 'bg-white text-gray-800 rounded-2xl rounded-bl-md border border-blue-100'
                              }`}>
                                <p className="text-[15px] leading-relaxed break-words">{msg.message}</p>
                                <div className="flex items-center justify-end gap-1 mt-2">
                                  <p className={`text-[11px] ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {formatTime(msg.createdAt)}
                                  </p>
                                  {isCurrentUser && (
                                    <svg className="w-4 h-4 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-blue-100 px-6 py-4">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-end gap-3">
                  <div className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-3xl p-1 shadow-inner border border-blue-200">
                    <div className="flex items-end gap-2 bg-white rounded-3xl p-3">
                      <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                        <FaSmile className="w-5 h-5 text-blue-500" />
                      </button>
                      <textarea
                        placeholder={`Message ${getChatTitle()}...`}
                        value={message}
                        onChange={handleTyping}
                        onKeyPress={handleKeyPress}
                        rows="1"
                        className="flex-1 px-2 py-2 resize-none focus:outline-none text-gray-800 placeholder-gray-400 text-[15px] max-h-32 overflow-y-auto"
                        style={{ 
                          minHeight: '24px',
                          scrollbarWidth: 'thin'
                        }}
                      />
                      <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                        <FaPaperclip className="w-5 h-5 text-blue-500" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className={`p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 ${
                      message.trim() 
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-300' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <FaPaperPlane className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-40 h-40 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-20 blur-2xl animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                  <FaPaperPlane className="w-16 h-16 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Welcome to Messages</h2>
              <p className="text-gray-600 text-lg">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;