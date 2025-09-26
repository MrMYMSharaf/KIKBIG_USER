import React, { useState } from 'react';
import Modal from 'react-modal';
import { HiOutlineSearch, HiOutlineBell, HiMenu } from 'react-icons/hi';
import { Menu } from '@headlessui/react';
import Logo from '../../assets/logo/Pedlar_logo.png';
import Filter from './Filter';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PostAdsModal from '../PostAdsModalFlow/PostAdsModal';

const Searchslides = ({ toggleSidebar }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [postAdsModalOpen, setPostAdsModalOpen] = useState(false);

  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  // Filter modal handlers
  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  // Post Ads modal handlers
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
    <div className="bg-white border-b border-gray-200">

      {/* Mobile view */}
      <div className="h-32 px-4 flex flex-col md:hidden">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {/* Sidebar Toggle */}
            <button
              type="button"
              className="text-gray-900 mr-2 focus:outline-none"
              onClick={toggleSidebar}
            >
              <HiMenu fontSize={30} />
            </button>
            <img src={Logo} alt="Pedlar logo" className="h-20 w-[5.5rem]" />
          </div>

          <div className="flex items-center space-x-2">
            {token ? (
              <>
                {/* Notification */}
                <Menu as="div" className="relative">
                  {({ open }) => (
                    <>
                      <Menu.Button aria-label="Notifications">
                        <HiOutlineBell fontSize={30} />
                      </Menu.Button>
                      <Menu.Items className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-lg z-50"
                        style={{ display: open ? 'block' : 'none' }}
                      >
                        <Menu.Item>
                          {({ active }) => (
                            <button className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 w-full text-left`}>
                              Notification 1
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 w-full text-left`}>
                              Notification 2
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
                      <Menu.Button>
                        <img className="w-10 h-10 rounded-full" src="https://picsum.photos/id/237/200/300" alt="User Profile" />
                      </Menu.Button>
                      <Menu.Items className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-lg z-50">
                        <Menu.Item>
                          {({ active }) => (
                            <Link to="/UserSettingsPage"
                              className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 w-full text-left`}
                            >
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 w-full text-left`}>
                              Settings
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 w-full text-left`}>
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
                className="text-white bg-blue-500 hover:bg-blue-600 font-medium rounded-lg text-sm px-5 py-2.5"
                onClick={() => navigate("/auth")}
              >
                Sign Up
              </button>
            )}

            {/* Post Ads */}
            <button
              type="button"
              className="text-gray-900 bg-gradient-to-r from-green-200 via-green-300 to-blue-200 hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-5 py-2.5"
              onClick={openPostAdsModal}
            >
              POST ADS
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex items-center mt-2">
          <button
            type="button"
            className="text-gray-900 bg-white border border-gray-300 rounded-lg px-5 py-2.5 mr-2"
            onClick={openModal}
          >
            Filters
          </button>
          <div className="relative flex flex-1">
            <HiOutlineSearch className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="I am looking for"
              className="h-10 w-full border border-gray-300 rounded-sm pl-11 pr-4"
            />
          </div>
        </div>
      </div>

      {/* Larger screen view */}
      <div className="hidden md:flex h-16 px-4 justify-between items-center">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="text-gray-900 bg-white border border-gray-300 rounded-lg px-5 py-2.5"
            onClick={openModal}
          >
            Filters
          </button>
          <div className="relative flex">
            <HiOutlineSearch className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="I am looking for"
              className="h-10 w-[24rem] border border-gray-300 rounded-sm pl-11 pr-4"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {token ? (
            <>
              {/* Notifications */}
              <Menu as="div" className="relative">
                {({ open }) => (
                  <>
                    <Menu.Button>
                      <HiOutlineBell fontSize={30} />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-lg z-50"
                      style={{ display: open ? 'block' : 'none' }}
                    >
                      <Menu.Item>
                        {({ active }) => (
                          <button className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 w-full text-left`}>
                            Notification 1
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 w-full text-left`}>
                            Notification 2
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
                    <Menu.Button>
                      <img className="w-10 h-10 rounded-full" src="https://picsum.photos/id/237/200/300" alt="User Profile" />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-lg z-50">
                      <Menu.Item>
                        {({ active }) => (
                          <Link to="/UserSettingsPage" className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 w-full text-left`}>
                            Your Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 w-full text-left`}>
                            Settings
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 w-full text-left`}>
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
              className="text-white bg-blue-500 hover:bg-blue-600 font-medium rounded-lg text-sm px-5 py-2.5"
              onClick={() => navigate("/auth")}
            >
              Sign Up
            </button>
          )}

          {/* Post Ads */}
          <button
            type="button"
            className="text-gray-900 bg-gradient-to-r from-green-200 via-green-300 to-blue-200 hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-5 py-2.5"
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
        className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-[9998]"
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
