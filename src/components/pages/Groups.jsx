import React, { useState } from 'react';
import 'tailwindcss/tailwind.css';
import { FaSearch, FaPaperPlane } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi'; 
import { HiPlus } from "react-icons/hi";

const Groups = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobileChatVisible, setIsMobileChatVisible] = useState(false);
  const [message, setMessage] = useState('');

  const contacts = [
    {
      id: 1,
      name: "Swati - THN",
      status: "typing...",
      time: "02:01",
      image: "https://picsum.photos/600/400"
    },
    {
      id: 2,
      name: "Chintu Voda",
      status: "Inbox top in center",
      time: "Yesterday",
      image: "https://picsum.photos/600/400"
    }
  ];

  const handleContactSelect = (contact) => {
    setSelectedChat(contact);
    setIsMobileChatVisible(true);
  };

  const handleBackToContacts = () => {
    setIsMobileChatVisible(false);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // Logic to send message would go here
      setMessage('');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Visible on Mobile and Desktop */}
      <div className={`w-full md:w-1/3 bg-white border-r border-gray-300 ${isMobileChatVisible ? 'hidden md:block' : 'block'}`}>
        {/* Sidebar Header with Search */}
        <div className="flex flex-col p-4 bg-green-500 text-white">
          <div className="flex items-center mb-4 p-1 bg-green-100 w-32 rounded-full hover:bg-green-300">
            <HiPlus className="w-8 h-8 rounded-full text-green-500" />
            <h1 className="text-lg font-bold ml-2 text-green-500">Groups</h1>
          </div>

          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search or start new chat"
              className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Centered Buttons */}
        <div className="flex justify-center space-x-4 p-4 bg-white">
          <button className="bg-transparent hover:bg-gray-300 text-gray-400 font-semibold hover:text-white py-2 px-6 border border-gray-500 hover:border-transparent rounded">
            Unread
          </button>
          <button className="bg-transparent hover:bg-gray-300 text-gray-400 font-semibold hover:text-white py-2 px-6 border border-gray-500 hover:border-transparent rounded">
            User
          </button>
          <button className="bg-transparent hover:bg-gray-300 text-gray-400 font-semibold hover:text-white py-2 px-6 border border-gray-500 hover:border-transparent rounded">
            Groups
          </button>
        </div>

        {/* Contacts/Groups List */}
        <div className="overflow-y-auto" style={{ height: 'calc(100% - 160px)' }}>
          {contacts.map((contact) => (
            <div 
              key={contact.id} 
              className="flex items-center p-4 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleContactSelect(contact)}
            >
              <img
                src={contact.image}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
              <div className="ml-4 flex-1">
                <p className="font-bold">{contact.name}</p>
                <p className="text-sm text-gray-600">{contact.status}</p>
              </div>
              <div className="text-xs text-gray-500">{contact.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area - Responsive for Mobile */}
      <div className={`
        ${isMobileChatVisible ? 'fixed inset-0 z-50 block' : 'hidden md:flex'}
        flex-1 flex-col relative bg-white
      `}>
        {selectedChat && (
          <>
            {/* Chat Header */}
            <div className='flex justify-between items-center p-4 bg-green-500 text-white'>
              <div className="flex items-center">
                {/* Back button for mobile */}
                <button 
                  className="md:hidden mr-4 text-2xl"
                  onClick={handleBackToContacts}
                >
                  ← 
                </button>
                <img
                  src={selectedChat.image}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <div className="ml-4">
                  <h1 className="text-xl font-bold">{selectedChat.name}</h1>
                  <p className="text-sm">{selectedChat.status}</p>
                </div>
              </div>

              <div className="flex p-2 bg-red-500 rounded-lg hover:bg-red-400 items-center">
                <span className="text-white">Leave</span>
                <FiLogOut className="text-white cursor-pointer ml-2" />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 bg-gray-50 overflow-y-auto" style={{ paddingBottom: '80px' }}>
              <div className="text-center text-xs text-gray-500 mb-2">22 January 2015</div>
              <div className="mb-4">
                <div className="flex items-start">
                  <img
                    src={selectedChat.image}
                    alt="Profile"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div className="bg-green-100 p-2 rounded-lg shadow">
                    <p className="text-sm">Hey! Have you seen WhatsApp Web feature?</p>
                  </div>
                </div>
                <div className="flex items-start justify-end mt-2">
                  <div className="bg-green-500 text-white p-2 rounded-lg shadow">
                    <p className="text-sm">Yeah...Awsummmmm 😁😁😁</p>
                  </div>
                  <img
                    src={selectedChat.image}
                    alt="Profile"
                    className="w-8 h-8 rounded-full ml-2"
                  />
                </div>
                <div className="flex items-start">
                  <img
                    src={selectedChat.image}
                    alt="Profile"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div className="bg-green-100 p-2 rounded-lg shadow mt-2">
                    <p className="text-sm">
                      Find more details on <a href="http://thehackernews.com/">The Hacker News</a>. I have just published an article about it.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Field - Improved for Better Visibility */}
            <div className="absolute bottom-16 left-0 w-full bg-white p-4 border-t border-gray-300">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type a message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 p-2 pl-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button 
                  onClick={handleSendMessage}
                  className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                >
                  <FaPaperPlane className="w-6 h-6" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Groups;