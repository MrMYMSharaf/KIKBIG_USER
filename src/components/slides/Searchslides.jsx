import React, { useState } from 'react';
import Modal from 'react-modal';
import { HiOutlineSearch, HiOutlineBell, HiMenu } from 'react-icons/hi';
import { Menu } from '@headlessui/react';
import Logo from '../../assets/logo/Pedlar_logo.png';
import Filter from './Filter';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PostAdsModal from '../PostAdsModalFlow/PostAdsModal';
import { useSignOut } from "../../functions/handleSignOut";

const Searchslides = ({ toggleSidebar }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [postAdsModalOpen, setPostAdsModalOpen] = useState(false);

  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);
  const signOut = useSignOut();
  const openPostAdsModal = () => {
    if (!token) {
      alert("You must be logged in to post an ad.");
      navigate("/auth");
      return;
    }
    setPostAdsModalOpen(true);
    setModalIsOpen(false);
  };
  const closePostAdsModal = () => setPostAdsModalOpen(false);

  return (
    <div className="bg-white border-b-2 border-gray-200 shadow-md">

      {/* Mobile view */}
      <div className="bg-gradient-to-r from-primary via-blue-800 to-primary px-3 py-4 flex flex-col md:hidden shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle */}
            <button
              type="button"
              className="text-primary bg-white hover:bg-blue-50 p-2.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white shadow-md hover:shadow-lg transform hover:scale-105"
              onClick={toggleSidebar}
              aria-label="Toggle Menu"
            >
              <HiMenu fontSize={24} />
            </button>
            <img src={Logo} alt="Pedlar logo" className="h-14 w-auto drop-shadow-lg" />
          </div>

          <div className="flex items-center gap-2">
            {token ? (
              <>
                {/* Notification */}
                <Menu as="div" className="relative">
                  {({ open }) => (
                    <>
                      <Menu.Button 
                        className="relative p-2.5 bg-white hover:bg-blue-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                        aria-label="Notifications"
                      >
                        <HiOutlineBell fontSize={22} className="text-primary" />
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-400 rounded-full ring-2 ring-white animate-pulse"></span>
                      </Menu.Button>
                      <Menu.Items className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b bg-primary text-white font-bold text-sm">
                          Notifications
                        </div>
                        <Menu.Item>
                          {({ active }) => (
                            <button className={`${active ? 'bg-blue-50' : ''} block px-4 py-3 w-full text-left text-sm border-b transition-colors`}>
                              <p className="font-semibold text-gray-900">New message received</p>
                              <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button className={`${active ? 'bg-blue-50' : ''} block px-4 py-3 w-full text-left text-sm transition-colors`}>
                              <p className="font-semibold text-gray-900">Your ad was approved</p>
                              <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </>
                  )}
                </Menu>

                {/* Profile Menu */}
                <Menu as="div" className="relative">
                  {({ open }) => (
                    <>
                      <Menu.Button className="focus:outline-none focus:ring-2 focus:ring-white rounded-full">
                        <img 
                          className="w-10 h-10 rounded-full border-3 border-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ring-2 ring-blue-300" 
                          src="https://picsum.photos/id/237/200/300" 
                          alt="User Profile" 
                        />
                      </Menu.Button>
                      <Menu.Items className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b bg-primary text-white">
                          <p className="font-bold text-sm">John Doe</p>
                          <p className="text-xs text-blue-100">john@example.com</p>
                        </div>
                        <Menu.Item>
                          {({ active }) => (
                            <Link 
                              to="/UserSettingsPage"
                              className={`${active ? 'bg-blue-50' : ''} block px-4 py-2.5 font-semibold text-sm border-b transition-colors text-gray-700`}
                            >
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button className={`${active ? 'bg-blue-50' : ''} block px-4 py-2.5 w-full text-left font-semibold text-sm border-b transition-colors text-gray-700`}>
                              Settings
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
 onClick={signOut}
  className={`${active ? 'bg-gray-100' : ''} block px-4 py-2.5 w-full text-left font-semibold text-sm transition-colors text-gray-700`}
>
  Sign out
</button>

                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </>
                  )}
                </Menu>
              </>
            ) : (
              <button
                type="button"
                className="text-primary bg-white hover:bg-blue-50 font-bold rounded-xl text-sm px-4 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-2 border-white"
                onClick={() => navigate("/auth")}
              >
                Sign Up
              </button>
            )}

            {/* Post Ads */}
            <button
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 font-bold rounded-xl text-sm px-4 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-2 border-blue-500"
              onClick={openPostAdsModal}
            >
              POST
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 border-2 border-blue-500 rounded-xl px-4 py-2.5 font-bold transition-all duration-200 text-sm shadow-md hover:shadow-lg transform hover:scale-105"
            onClick={openModal}
          >
            Filters
          </button>
          <div className="relative flex flex-1">
            <HiOutlineSearch className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search..."
              className="h-10 w-full border-2 border-white rounded-xl pl-10 pr-3 focus:border-blue-200 focus:ring-2 focus:ring-white outline-none transition-all duration-200 text-sm shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:flex h-16 px-6 justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-primary bg-white border-2 border-primary rounded-lg px-5 py-2.5 font-semibold hover:bg-blue-50 transition-all duration-200 text-sm"
            onClick={openModal}
          >
            Filters
          </button>
          <div className="relative flex">
            <HiOutlineSearch className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search for anything..."
              className="h-10 w-[28rem] border-2 border-gray-300 rounded-lg pl-11 pr-4 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {token ? (
            <>
              {/* Notifications */}
              <Menu as="div" className="relative">
                {({ open }) => (
                  <>
                    <Menu.Button className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200">
                      <HiOutlineBell fontSize={24} className="text-gray-700" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b bg-primary text-white font-bold">
                        Notifications
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <button className={`${active ? 'bg-blue-50' : ''} block px-4 py-3 w-full text-left text-sm border-b transition-colors`}>
                            <p className="font-semibold text-gray-900">New message received</p>
                            <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button className={`${active ? 'bg-blue-50' : ''} block px-4 py-3 w-full text-left text-sm transition-colors`}>
                            <p className="font-semibold text-gray-900">Your ad was approved</p>
                            <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </>
                )}
              </Menu>

              {/* Profile Menu */}
              <Menu as="div" className="relative">
                {({ open }) => (
                  <>
                    <Menu.Button className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
                      <img 
                        className="w-10 h-10 rounded-full border-2 border-primary shadow-md hover:shadow-lg transition-all duration-200" 
                        src="https://picsum.photos/id/237/200/300" 
                        alt="User Profile" 
                      />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b bg-primary text-white">
                        <p className="font-bold">John Doe</p>
                        <p className="text-xs text-blue-100">john@example.com</p>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <Link 
                            to="/UserSettingsPage" 
                            className={`${active ? 'bg-blue-50' : ''} block px-4 py-3 font-semibold text-sm border-b transition-colors text-gray-700`}
                          >
                            Your Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button className={`${active ? 'bg-blue-50' : ''} block px-4 py-3 w-full text-left font-semibold text-sm border-b transition-colors text-gray-700`}>
                            Settings
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
  onClick={signOut}
  className={`${active ? 'bg-gray-100' : ''} block px-4 py-2.5 w-full text-left font-semibold text-sm transition-colors text-gray-700`}
>
  Sign out
</button>

                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </>
                )}
              </Menu>
            </>
          ) : (
            <button
              type="button"
              className="text-white bg-primary hover:bg-blue-900 font-semibold rounded-lg text-sm px-5 py-2.5 shadow-md hover:shadow-lg transition-all duration-200"
              onClick={() => navigate("/auth")}
            >
              Sign Up
            </button>
          )}

          {/* Post Ads */}
          <button
            type="button"
            className="text-primary bg-white hover:bg-blue-50 font-bold rounded-lg text-sm px-5 py-2.5 border-2 border-primary shadow-md hover:shadow-lg transition-all duration-200"
            onClick={openPostAdsModal}
          >
            POST ADS
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9998]"
        overlayClassName="fixed inset-0"
      >
        <Filter closeModal={closeModal} />
      </Modal>

      {/* Post Ads Modal */}
      <PostAdsModal
        isOpen={postAdsModalOpen}
        onClose={closePostAdsModal}
      />
    </div>
  );
};

export default Searchslides;