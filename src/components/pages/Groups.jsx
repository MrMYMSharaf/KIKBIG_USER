import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaPaperPlane, FaUsers, FaPlus, FaTimes } from 'react-icons/fa';
import { FiLogOut, FiSettings } from 'react-icons/fi';
import { HiPlus } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetCurrentUserQuery } from '../../features/authSlice';
import { 
  useGetMessagesQuery, 
  useSendMessageMutation, 
  useGetChatListQuery
} from '../../features/chatSlice';
import {
  useGetUserGroupsQuery,
  useGetGroupMessagesQuery,
  useSendGroupMessageMutation,
  useCreateGroupMutation,
  useLeaveGroupMutation,
  useGetGroupDetailsQuery,
  useAddMembersMutation,
} from '../../features/groupSlice';


// Create Group Modal Component
const CreateGroupModal = ({ isOpen, onClose, userId, allContacts }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [createGroup, { isLoading }] = useCreateGroupMutation();

  const filteredContacts = allContacts?.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const toggleMember = (contactId) => {
    if (selectedMembers.includes(contactId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== contactId));
    } else {
      setSelectedMembers([...selectedMembers, contactId]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    if (selectedMembers.length === 0) {
      alert('Please select at least one member');
      return;
    }

    try {
      await createGroup({
        name: groupName,
        description: groupDescription,
        admin: userId,
        members: selectedMembers,
      }).unwrap();

      // Reset and close
      setGroupName('');
      setGroupDescription('');
      setSelectedMembers([]);
      onClose();
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create group');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-green-500 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Create New Group</h2>
          <button onClick={onClose} className="text-white hover:bg-green-600 rounded-full p-1">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Group Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Group Name *</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Group Description */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Description (Optional)</label>
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="Enter group description"
              rows={3}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Search Members */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Add Members *</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contacts"
                className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Selected Members Count */}
          <div className="mb-2 text-sm text-gray-600">
            {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
          </div>

          {/* Members List */}
          <div className="border rounded-lg max-h-60 overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No contacts found</div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact._id}
                  onClick={() => toggleMember(contact._id)}
                  className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b ${
                    selectedMembers.includes(contact._id) ? 'bg-green-50' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    selectedMembers.includes(contact._id) ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    {contact.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-semibold text-gray-800">{contact.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{contact.email || contact.phone}</p>
                  </div>
                  {selectedMembers.includes(contact._id) && (
                    <div className="text-green-500">✓</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={isLoading || !groupName.trim() || selectedMembers.length === 0}
            className={`px-4 py-2 rounded-lg text-white ${
              isLoading || !groupName.trim() || selectedMembers.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isLoading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Group Info Modal Component
const GroupInfoModal = ({ isOpen, onClose, group, userId, onLeave }) => {
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [leaveGroup] = useLeaveGroupMutation();

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        await leaveGroup({ groupId: group._id, userId }).unwrap();
        onLeave();
        onClose();
      } catch (error) {
        console.error('Failed to leave group:', error);
        alert('Failed to leave group');
      }
    }
  };

  if (!isOpen || !group) return null;

  const isAdmin = group.admin?._id === userId || group.admin === userId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-green-500 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Group Info</h2>
          <button onClick={onClose} className="text-white hover:bg-green-600 rounded-full p-1">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Group Icon */}
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-white text-4xl font-bold mb-2">
              {group.name?.charAt(0).toUpperCase() || 'G'}
            </div>
            <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
            {group.description && (
              <p className="text-sm text-gray-600 text-center mt-1">{group.description}</p>
            )}
          </div>

          {/* Admin Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Group Admin</p>
            <p className="font-semibold text-gray-800">
              {group.admin?.name || 'Unknown'} {isAdmin && '(You)'}
            </p>
          </div>

          {/* Members */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-800">
                Members ({group.members?.length || 0})
              </h4>
              {isAdmin && (
                <button className="text-green-500 hover:text-green-600 text-sm">
                  + Add
                </button>
              )}
            </div>
            <div className="border rounded-lg max-h-60 overflow-y-auto">
              {group.members?.map((member) => (
                <div key={member._id} className="flex items-center p-3 border-b hover:bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                    {member.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-semibold text-gray-800">
                      {member.name || 'Unknown'}
                      {member._id === userId && ' (You)'}
                      {member._id === group.admin?._id && ' (Admin)'}
                    </p>
                    <p className="text-sm text-gray-600">{member.email || member.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={handleLeaveGroup}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
          >
            <FiLogOut className="mr-2" />
            Leave Group
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Groups Component
const Groups = () => {
  const navigate = useNavigate();
  
  // Get authentication status from Redux
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  
  // Get userId from API call - backend decodes JWT cookie and returns user info
  const { data: currentUserData, isLoading: isLoadingUser, error: userError } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated, // Only call if authenticated
  });

  // Extract userId from the API response
  const userId = currentUserData?.user?._id || currentUserData?.user?.id || currentUserData?._id || currentUserData?.id;

  const [selectedChat, setSelectedChat] = useState(null);
  const [chatType, setChatType] = useState(null); // 'individual' or 'group'
  const [isMobileChatVisible, setIsMobileChatVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const messagesEndRef = useRef(null);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Queries
  const { data: chatListData } = useGetChatListQuery(userId, { skip: !userId });
  const { data: groupsData } = useGetUserGroupsQuery(userId, { skip: !userId });

  // Individual chat messages
  const { data: individualMessagesData } = useGetMessagesQuery(
    {
      senderId: userId,
      receiverId: selectedChat?._id,
    },
    {
      skip: !userId || !selectedChat || chatType !== 'individual',
      pollingInterval: 3000,
    }
  );

  // Group messages
  const { data: groupMessagesData } = useGetGroupMessagesQuery(
    selectedChat?._id,
    {
      skip: !selectedChat || chatType !== 'group',
      pollingInterval: 3000,
    }
  );

  const [sendMessageMutation] = useSendMessageMutation();
  const [sendGroupMessageMutation] = useSendGroupMessageMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [individualMessagesData, groupMessagesData]);

  const handleContactSelect = (contact, type) => {
    setSelectedChat(contact);
    setChatType(type);
    setIsMobileChatVisible(true);
  };

  const handleBackToContacts = () => {
    setIsMobileChatVisible(false);
    setSelectedChat(null);
    setChatType(null);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !userId) return;

    try {
      if (chatType === 'group') {
        await sendGroupMessageMutation({
          senderId: userId,
          groupId: selectedChat._id,
          message: message.trim(),
        }).unwrap();
      } else {
        await sendMessageMutation({
          senderId: userId,
          receiverId: selectedChat._id,
          message: message.trim(),
          typeofmessage: 'Individual',
        }).unwrap();
      }
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

  // Combine and filter contacts
  const allContacts = [
    ...(chatListData?.data || []).map(c => ({ ...c, type: 'individual' })),
    ...(groupsData?.data || []).map(g => ({ ...g, type: 'group' })),
  ];

  const filteredContacts = allContacts.filter((contact) => {
    const matchesSearch = contact.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'groups') return contact.type === 'group' && matchesSearch;
    if (filterType === 'user') return contact.type === 'individual' && matchesSearch;
    
    return matchesSearch;
  });

  const currentMessages = chatType === 'group' ? groupMessagesData?.data : individualMessagesData?.data;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
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
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="bg-green-600 hover:bg-green-700 p-2 rounded-full"
              title="Create Group"
            >
              <FaUsers size={20} />
            </button>
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

        <div className="flex justify-center space-x-4 p-4 bg-white border-b">
          <button
            onClick={() => setFilterType('all')}
            className={`${filterType === 'all' ? 'bg-green-500 text-white' : 'bg-transparent text-gray-400'} hover:bg-green-400 hover:text-white font-semibold py-2 px-6 border rounded transition-colors`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('user')}
            className={`${filterType === 'user' ? 'bg-green-500 text-white' : 'bg-transparent text-gray-400'} hover:bg-green-400 hover:text-white font-semibold py-2 px-6 border rounded transition-colors`}
          >
            Users
          </button>
          <button
            onClick={() => setFilterType('groups')}
            className={`${filterType === 'groups' ? 'bg-green-500 text-white' : 'bg-transparent text-gray-400'} hover:bg-green-400 hover:text-white font-semibold py-2 px-6 border rounded transition-colors`}
          >
            Groups
          </button>
        </div>

        <div className="overflow-y-auto" style={{ height: 'calc(100% - 200px)' }}>
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
                onClick={() => handleContactSelect(contact, contact.type)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  contact.type === 'group' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {contact.type === 'group' ? <FaUsers size={18} /> : contact.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-bold text-gray-800">{contact.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600 truncate">
                    {contact.type === 'group' 
                      ? `${contact.members?.length || 0} members` 
                      : contact.email || contact.phone}
                  </p>
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
            <div className='flex justify-between items-center p-4 bg-green-500 text-white shadow-md'>
              <div className="flex items-center">
                <button className="md:hidden mr-4 text-2xl" onClick={handleBackToContacts}>←</button>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  chatType === 'group' ? 'bg-blue-500' : 'bg-green-700'
                }`}>
                  {chatType === 'group' ? <FaUsers size={18} /> : selectedChat.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="ml-4">
                  <h1 className="text-xl font-bold">{selectedChat.name || 'Unknown'}</h1>
                  <p className="text-sm text-green-100">
                    {chatType === 'group' 
                      ? `${selectedChat.members?.length || 0} members` 
                      : selectedChat.email || 'Online'}
                  </p>
                </div>
              </div>
              {chatType === 'group' && (
                <button
                  onClick={() => setShowGroupInfo(true)}
                  className="bg-green-600 hover:bg-green-700 p-2 rounded-full"
                >
                  <FiSettings size={20} />
                </button>
              )}
            </div>

            <div className="flex-1 p-4 bg-gray-50 overflow-y-auto" style={{ paddingBottom: '80px' }}>
              {!currentMessages || currentMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No messages yet. Start the conversation!
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
                              {chatType === 'group' && !isCurrentUser && (
                                <p className="text-xs font-semibold mb-1 text-green-600">
                                  {msg.senderId.name || 'Unknown'}
                                </p>
                              )}
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
                  placeholder="Type a message"
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

      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        userId={userId}
        allContacts={chatListData?.data || []}
      />

      <GroupInfoModal
        isOpen={showGroupInfo}
        onClose={() => setShowGroupInfo(false)}
        group={selectedChat}
        userId={userId}
        onLeave={() => {
          setSelectedChat(null);
          setChatType(null);
        }}
      />
    </div>
  );
};

export default Groups;

