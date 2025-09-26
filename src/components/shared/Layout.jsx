import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Headslides from '../slides/Headslides';
import Searchslides from '../slides/Searchslides';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const openModal = () => {
    setIsModalOpen(true);
    setIsSidebarOpen(false);
  };
  const closeModal = () => setIsModalOpen(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <div className='flex flex-row overflow-hidden bg-neutral-100 w-screen h-screen relative'>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-20 transform bg-white shadow-lg transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex`}
      >
        <Headslides isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Sidebar overlay (mobile only) - Only show when sidebar is open AND modal is closed */}
      {isSidebarOpen && !isModalOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden'
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className='flex flex-col flex-1 relative z-0'>
        <Searchslides 
          toggleSidebar={toggleSidebar} 
          openModal={openModal}
          isModalOpen={isModalOpen} // Pass modal state to prevent conflicts
        />
        <div className='flex-grow overflow-auto'>
          <Outlet />
        </div>
      </div>

      {/* Post Ads Modal - Ensure highest z-index */}
      {/* <PostAdsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} /> */}
        {/* <PostAdsModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} /> */}
    </div>
  );
};

export default Layout;