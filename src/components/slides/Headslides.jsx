import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { DASHBOARD_SIDEBAR_LINKS, DASHBOARD_SIDEBAR_BOTTOM_LINKS } from '../../lib/consts/navigation';
import Logo from '../../assets/logo/Pedlar_logo_white.png';

const Headslides = ({ isOpen, toggleSidebar }) => {
  const token = useSelector((state) => state.auth.token);

  return (
    <div
      className={`bg-neutral-900 w-60 p-3 flex flex-col text-white h-full fixed top-0 left-0 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-20 md:z-auto`}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-2 px-1 py-3">
        <img src={Logo} alt="Pedlar logo" width="172" height="132" />
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 mt-4" aria-label="Main Navigation">
        {DASHBOARD_SIDEBAR_LINKS.map(({ key, path, icon, label }) => {
          // Hide private links if user is not logged in
          if (!token && (key === 'myAds' || key === 'groups' || key === 'page')) return null;

          return (
            <NavLink
              to={path}
              key={key}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-2 px-2 py-2 bg-neutral-700 rounded cursor-pointer my-1'
                  : 'flex items-center gap-2 px-2 py-2 hover:bg-neutral-700 rounded cursor-pointer my-1'
              }
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
              onClick={toggleSidebar} // Close sidebar on click
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Horizontal Rule */}
      <hr className="my-2 border-neutral-700" />

      {/* Bottom Links */}
      <nav className="mt-auto" aria-label="Secondary Navigation">
        {DASHBOARD_SIDEBAR_BOTTOM_LINKS.map(({ key, path, icon, label }) => {
          // Hide settings if user is not logged in
          if (!token && key === 'settings') return null;

          return (
            <NavLink
              to={path}
              key={key}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-2 px-2 py-2 bg-neutral-700 rounded cursor-pointer my-1'
                  : 'flex items-center gap-2 px-2 py-2 hover:bg-neutral-700 rounded cursor-pointer my-1'
              }
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
              onClick={toggleSidebar} // Close sidebar on click
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Headslides;
