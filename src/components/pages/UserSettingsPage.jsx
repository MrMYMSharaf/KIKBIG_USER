import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  CreditCard, 
  Shield, 
  Globe, 
  Palette, 
  Bookmark, 
  LogOut, 
  ChevronRight 
} from 'lucide-react';

const UserSettingsPage = () => {
  // User Profile State
  const [userProfile, setUserProfile] = useState({
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    phone: '+1 (555) 123-4567',
    profilePicture: '/api/placeholder/200/200'
  });

  // Settings State
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    promotionalEmails: true,

    // Privacy Settings
    profileVisibility: 'public',
    dataSharing: false,

    // Display Settings
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York'
  });

  // Languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' }
  ];

  // Themes
  const themes = [
    { value: 'light', label: 'Light Mode' },
    { value: 'dark', label: 'Dark Mode' },
    { value: 'system', label: 'System Default' }
  ];

  // Handle Profile Update
  const handleProfileUpdate = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Settings Toggle
  const handleSettingToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Handle Dropdown Settings
  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div
          className={"grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pb-32"}
          style={{ maxHeight: 'calc(100vh - 150px)' }}
        >

       
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Account Settings
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="md:col-span-1 bg-white shadow-md rounded-lg p-6 text-center">
          <div className="mb-6">
            <img 
              src={userProfile.profilePicture} 
              alt="Profile" 
              className="w-32 h-32 rounded-full mx-auto object-cover mb-4"
            />
            <h2 className="text-2xl font-semibold">{userProfile.name}</h2>
            <p className="text-gray-500">{userProfile.email}</p>
          </div>

          <div className="space-y-4">
            <button className="w-full flex items-center justify-between bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors">
              <div className="flex items-center">
                <Shield className="mr-3 text-blue-500" />
                Account Security
              </div>
              <ChevronRight />
            </button>
            <button className="w-full flex items-center justify-between bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors">
              <div className="flex items-center">
                <CreditCard className="mr-3 text-green-500" />
                Payment Methods
              </div>
              <ChevronRight />
            </button>
            <button 
              className="w-full flex items-center justify-between bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => {/* Logout functionality */}}
            >
              <div className="flex items-center">
                <LogOut className="mr-3 text-red-500" />
                Logout
              </div>
              <ChevronRight />
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Information */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <User className="mr-3 text-blue-500" />
              Profile Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={userProfile.name}
                  onChange={handleProfileUpdate}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block mb-2">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={userProfile.email}
                  onChange={handleProfileUpdate}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={userProfile.phone}
                  onChange={handleProfileUpdate}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Bell className="mr-3 text-yellow-500" />
              Notification Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Email Notifications</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.emailNotifications}
                    onChange={() => handleSettingToggle('notifications', 'emailNotifications')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="flex justify-between items-center">
                <span>Push Notifications</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.pushNotifications}
                    onChange={() => handleSettingToggle('notifications', 'pushNotifications')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="flex justify-between items-center">
                <span>Promotional Emails</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.promotionalEmails}
                    onChange={() => handleSettingToggle('notifications', 'promotionalEmails')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Display & Language Settings */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Palette className="mr-3 text-purple-500" />
              Display & Language
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Theme</label>
                <select 
                  name="theme"
                  value={settings.theme}
                  onChange={handleDropdownChange}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  {themes.map(theme => (
                    <option key={theme.value} value={theme.value}>
                      {theme.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2">Language</label>
                <select 
                  name="language"
                  value={settings.language}
                  onChange={handleDropdownChange}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Shield className="mr-3 text-green-500" />
              Privacy & Security
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Profile Visibility</label>
                <select 
                  name="profileVisibility"
                  value={settings.profileVisibility}
                  onChange={handleDropdownChange}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="friends">Friends Only</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span>Allow Data Sharing</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.dataSharing}
                    onChange={() => handleSettingToggle('privacy', 'dataSharing')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Changes Button */}
      <div className="text-center mt-8">
        <button 
          className="bg-blue-500 text-white px-12 py-3 rounded-full hover:bg-blue-600 transition-colors"
          onClick={() => {/* Save settings logic */}}
        >
          Save Changes
        </button>
      </div>
    </div>
    </div>
  );
};

export default UserSettingsPage;