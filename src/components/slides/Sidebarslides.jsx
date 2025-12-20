import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { DASHBOARD_SIDEBAR_LINKS, DASHBOARD_SIDEBAR_BOTTOM_LINKS } from '../../lib/consts/navigation';
import Logo from '../../assets/logo/Pedlar_logo_white.png';

const Sidebarslides = ({ isOpen, toggleSidebar }) => {
  // ✅ Check isAuthenticated instead of token
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const activeCountry = useSelector((state) => state.country.country || "india");

  if (!activeCountry) return null;

  // Get sidebar links with active country
  const sidebarLinks = DASHBOARD_SIDEBAR_LINKS(activeCountry);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-10 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`bg-gradient-to-br from-primary via-blue-900 to-black w-50 flex flex-col text-white h-screen fixed top-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-20 md:z-auto shadow-2xl overflow-hidden`}
      >
        {/* Logo */}
        <div className="flex-shrink-0 px-6 py-0 border-b-2 border-blue-700 border-opacity-50 bg-black bg-opacity-20">
          <div className="flex items-center justify-center">
            <img src={Logo} alt="Pedlar logo" className="w-36 h-auto drop-shadow-2xl" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-transparent hover:scrollbar-thumb-blue-500">
          {/* MAIN LINKS */}
          <nav className="px-4 py-6 space-y-3">
            {sidebarLinks.map(({ key, path, icon, label }) => {
              // ✅ Hide protected links if user is not logged in
              if (!isAuthenticated && (key === 'myAds' || key === 'groups' || key === 'page')) return null;

              return (
                <NavLink
                  to={path}
                  key={key}
                  end={key === 'categories'} // exact match for Categories
                  className={({ isActive }) =>
                    isActive
                      ? 'flex items-center gap-4 px-5 py-4 bg-white text-primary rounded-2xl cursor-pointer font-bold shadow-2xl transform scale-105 transition-all duration-300 border-2 border-blue-300'
                      : 'flex items-center gap-4 px-5 py-4 hover:bg-blue-800 hover:bg-opacity-60 rounded-2xl cursor-pointer transition-all duration-300 hover:translate-x-2 hover:shadow-xl font-semibold hover:border-2 hover:border-blue-400 hover:border-opacity-30 border-2 border-transparent'
                  }
                  onClick={toggleSidebar}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-base tracking-wide">{label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* SEPARATOR */}
          <div className="px-8 py-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-blue-400 opacity-30"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-gradient-to-r from-transparent via-blue-900 to-transparent text-blue-300 text-xs font-semibold uppercase tracking-widest">
                  Settings
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM LINKS */}
          <nav className="px-4 pb-6">
            {DASHBOARD_SIDEBAR_BOTTOM_LINKS.map(({ key, path, icon, label }) => {
              // ✅ Hide settings if user is not logged in
              if (!isAuthenticated && key === 'settings') return null;

              return (
                <NavLink
                  to={path}
                  key={key}
                  className={({ isActive }) =>
                    isActive
                      ? 'flex items-center gap-4 px-5 py-4 bg-white text-primary rounded-2xl cursor-pointer font-bold shadow-2xl transform scale-105 transition-all duration-300 border-2 border-blue-300'
                      : 'flex items-center gap-4 px-5 py-4 hover:bg-blue-800 hover:bg-opacity-60 rounded-2xl cursor-pointer transition-all duration-300 hover:translate-x-2 hover:shadow-xl font-semibold hover:border-2 hover:border-blue-400 hover:border-opacity-30 border-2 border-transparent'
                  }
                  onClick={toggleSidebar}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-base tracking-wide">{label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebarslides;