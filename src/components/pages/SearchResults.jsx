import React, { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineBell, HiMenu } from 'react-icons/hi';
import { ShoppingCart } from 'lucide-react';
import { Menu } from '@headlessui/react';
import Logo from '../../assets/logo/Pedlar_logo.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSignOut } from "../../functions/handleSignOut";
import { useGetCurrentUserQuery } from "../../features/authSlice";
import { useGetMyCartQuery } from "../../features/AddTocartSlice";

const Searchslides = ({ toggleSidebar, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  
  // ✅ FIX: Match your Redux structure exactly
  const countrySlug = useSelector((state) => state.country?.country);
  
  const navigate = useNavigate();
  const location = useLocation();
 
  // ✅ DEBUG: Log country on every render
  useEffect(() => {
    console.log('🌍 Current country slug:', countrySlug);
    console.log('📍 Full country state:', useSelector.getState?.()?.country);
  }, [countrySlug]);

  const { data } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated
  });

  const { data: cartData } = useGetMyCartQuery(undefined, {
    skip: !isAuthenticated
  });
  
  const cartItemCount = cartData?.data?.length || 0;
  const signOut = useSignOut();

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      console.warn('⚠️ Empty search query');
      return;
    }

    // ✅ Check country before navigating
    if (!countrySlug || countrySlug === 'undefined' || countrySlug === 'null') {
      console.error('❌ No country set! Current value:', countrySlug);
      alert('Please wait while we detect your location...');
      return;
    }

    const searchUrl = `/${countrySlug}/search?q=${encodeURIComponent(searchQuery.trim())}`;
    console.log('🔍 Navigating to:', searchUrl);
    
    navigate(searchUrl);
    
    // If onSearch callback exists, also call it
    if (onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <div className="bg-white border-b-2 border-gray-200 shadow-md">

      {/* Mobile view */}
      <div className="bg-gradient-to-r from-primary via-blue-800 to-primary px-3 py-4 flex flex-col md:hidden shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-primary bg-white hover:bg-blue-50 p-2.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white shadow-md hover:shadow-lg transform hover:scale-105"
              onClick={toggleSidebar}
              aria-label="Toggle Menu"
            >
              <HiMenu fontSize={24} />
            </button>
            <Link to={countrySlug ? `/${countrySlug}` : '/'}>
              <img src={Logo} alt="Pedlar logo" className="h-14 w-auto drop-shadow-lg cursor-pointer" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    // Check if cart route exists, otherwise show message
                    try {
                      navigate('/cart');
                    } catch (error) {
                      alert('Cart feature coming soon!');
                    }
                  }}
                  className="relative p-2.5 bg-white hover:bg-blue-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart size={22} className="text-primary" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </button>

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
                      </Menu.Items>
                    </>
                  )}
                </Menu>

                <Menu as="div" className="relative">
                  {({ open }) => (
                    <>
                      <Menu.Button className="focus:outline-none focus:ring-2 focus:ring-white rounded-full">
                        <img 
                          className="w-10 h-10 rounded-full border-3 border-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ring-2 ring-blue-300" 
                          src={data?.user?.photo ? data.user.photo : "https://picsum.photos/id/237/200/300"}
                          alt="User Profile" 
                        />
                      </Menu.Button>
                      <Menu.Items className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b bg-primary text-white">
                          <p className="font-bold text-sm">{data?.user?.name || "Guest User"}</p>
                          <p className="text-xs text-blue-100">{data?.user?.email || ""}</p>
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
                            <Link 
                              to="/cart"
                              className={`${active ? 'bg-blue-50' : ''} flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b transition-colors text-gray-700`}
                            >
                              <ShoppingCart size={16} />
                              My Cart
                              {cartItemCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                  {cartItemCount}
                                </span>
                              )}
                            </Link>
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

            <button
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 font-bold rounded-xl text-sm px-4 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-2 border-blue-500"
              onClick={() => navigate("/post-ads")}
            >
              POST
            </button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex flex-1">
            <HiOutlineSearch className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 text-lg" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ads, pages, needs, offers..."
              className="h-10 w-full border-2 border-white rounded-xl pl-10 pr-3 focus:border-blue-200 focus:ring-2 focus:ring-white outline-none transition-all duration-200 text-sm shadow-md"
            />
          </div>
        </form>
      </div>

      {/* Desktop view */}
      <div className="hidden md:flex h-16 px-6 justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to={countrySlug ? `/${countrySlug}` : '/'}>
            <img src={Logo} alt="Pedlar logo" className="h-12 w-auto cursor-pointer" />
          </Link>
          
          <form onSubmit={handleSearch} className="relative flex">
            <HiOutlineSearch className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 text-lg" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ads, pages, needs, offers..."
              className="h-10 w-[32rem] border-2 border-gray-300 rounded-lg pl-11 pr-4 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 text-sm"
            />
          </form>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => {
                  try {
                    navigate('/cart');
                  } catch (error) {
                    alert('Cart feature coming soon!');
                  }
                }}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                aria-label="Shopping Cart"
              >
                <ShoppingCart size={24} className="text-gray-700" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>

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
                    </Menu.Items>
                  </>
                )}
              </Menu>

              <Menu as="div" className="relative">
                {({ open }) => (
                  <>
                    <Menu.Button className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
                      <img 
                        className="w-10 h-10 rounded-full border-2 border-primary shadow-md hover:shadow-lg transition-all duration-200" 
                        src={data?.user?.photo ? data.user.photo : "https://picsum.photos/id/237/200/300"}
                        alt="User Profile" 
                      />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b bg-primary text-white">
                        <p className="font-bold text-sm">{data?.user?.name || "Guest User"}</p>
                        <p className="text-xs text-blue-100">{data?.user?.email || ""}</p>
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
                          <Link 
                            to="/cart"
                            className={`${active ? 'bg-blue-50' : ''} flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b transition-colors text-gray-700`}
                          >
                            <ShoppingCart size={16} />
                            My Cart
                            {cartItemCount > 0 && (
                              <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                {cartItemCount}
                              </span>
                            )}
                          </Link>
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

          <button
            type="button"
            className="text-primary bg-white hover:bg-blue-50 font-bold rounded-lg text-sm px-5 py-2.5 border-2 border-primary shadow-md hover:shadow-lg transition-all duration-200"
            onClick={() => navigate("/post-ads")}
          >
            POST ADS
          </button>
        </div>
      </div>
    </div>
  );
};

export default Searchslides;