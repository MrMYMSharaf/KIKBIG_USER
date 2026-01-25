import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  LogOut, 
  ChevronRight,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Camera,
  Upload
} from 'lucide-react';
import { 
  useGetCurrentUserQuery, 
  useLogoutUserMutation,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useDeleteUserAccountMutation,
  useUpdateProfileImageMutation
} from '../../features/authSlice';

const UserSettingsPage = () => {
  // RTK Query Hooks
  const { data: currentUserData, isLoading: userLoading } = useGetCurrentUserQuery({});
  const [logoutUser] = useLogoutUserMutation();
  const [updateUserProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [deleteUserAccount, { isLoading: isDeleting }] = useDeleteUserAccountMutation();
  const [updateProfileImage, { isLoading: isUploadingImage }] = useUpdateProfileImageMutation();

  // File input ref
  const fileInputRef = useRef(null);

  // User Profile State
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    photo: '',
    authType: 'manual'
  });

  // Settings State
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    promotionalEmails: true,
    profileVisibility: 'public',
    dataSharing: false,
    theme: 'light',
    language: 'en',
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // UI State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // Load user data when available
  useEffect(() => {
    if (currentUserData?.user) {
      setUserProfile({
        name: currentUserData.user.name || '',
        email: currentUserData.user.email || '',
        phone: currentUserData.user.phone || '',
        photo: currentUserData.user.photo || '/api/placeholder/200/200',
        authType: currentUserData.user.authType || 'manual'
      });
      setImagePreview(currentUserData.user.photo || '/api/placeholder/200/200');
    }
  }, [currentUserData]);

  // Handle image file selection
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 5MB');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    // Convert to base64 and preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle profile image upload
  const handleImageUpload = async () => {
    if (!imagePreview || imagePreview === userProfile.photo) {
      setErrorMessage('Please select a new image first');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      console.log('📤 Uploading image...');
      const result = await updateProfileImage({ image: imagePreview }).unwrap();
      
      console.log('✅ Upload result:', result);
      
      // Update local state with new photo URL from backend response
      setUserProfile(prev => ({ 
        ...prev, 
        photo: result.photo || result.user?.photo 
      }));
      
      // Also update the preview to match
      setImagePreview(result.photo || result.user?.photo);
      
      setSuccessMessage('Profile image updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('❌ Upload error:', error);
      setErrorMessage(error?.data?.message || 'Failed to upload profile image');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Trigger file input click
  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  // Handle Profile Update using RTK Query
  const handleProfileUpdate = async () => {
    try {
      const updateData = {
        name: userProfile.name,
        email: userProfile.email,
      };

      if (userProfile.phone && userProfile.phone.trim() !== '') {
        updateData.phone = userProfile.phone;
      }

      await updateUserProfile({
        id: currentUserData.user.id,
        data: updateData
      }).unwrap();

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(error?.data?.message || 'Failed to update profile');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Handle Password Change using RTK Query
  const handlePasswordChange = async () => {
    if (userProfile.authType !== 'manual') {
      setErrorMessage('Password change is only available for manual accounts');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('New passwords do not match');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      await changePassword({
        id: currentUserData.user.id,
        password: passwordData.newPassword
      }).unwrap();

      setSuccessMessage('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(error?.data?.message || 'Failed to change password');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Handle Logout using RTK Query
  const handleLogout = async () => {
    try {
      await logoutUser({}).unwrap();
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle Account Deletion using RTK Query
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setErrorMessage('Please type DELETE to confirm');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      await deleteUserAccount(currentUserData.user.id).unwrap();
      await logoutUser({}).unwrap();
      window.location.href = '/auth/login';
    } catch (error) {
      setErrorMessage(error?.data?.message || 'Failed to delete account');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          Account Settings
        </h1>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-6 text-center mb-6">
              {/* Profile Image with Upload */}
              <div className="relative inline-block mb-4">
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-200"
                />
                <button
                  onClick={handleChangePhotoClick}
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                  title="Change photo"
                >
                  <Camera size={20} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* Upload button (shows if image changed) */}
              {imagePreview !== userProfile.photo && (
                <button
                  onClick={handleImageUpload}
                  disabled={isUploadingImage}
                  className="mb-4 flex items-center justify-center gap-2 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  <Upload size={16} />
                  {isUploadingImage ? 'Uploading...' : 'Upload New Photo'}
                </button>
              )}

              <h2 className="text-2xl font-semibold text-gray-800">{userProfile.name}</h2>
              <p className="text-gray-500">{userProfile.email}</p>
              <div className="mt-2">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {userProfile.authType === 'google' ? 'Google Account' : 
                   userProfile.authType === 'linkedin' ? 'LinkedIn Account' : 'Manual Account'}
                </span>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 space-y-3">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center">
                  <LogOut className="mr-3 text-red-500" size={20} />
                  <span>Logout</span>
                </div>
                <ChevronRight size={20} />
              </button>

              <button 
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-between bg-red-50 p-3 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center">
                  <Trash2 className="mr-3 text-red-600" size={20} />
                  <span className="text-red-600">Delete Account</span>
                </div>
                <ChevronRight size={20} className="text-red-600" />
              </button>
            </div>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center text-gray-800">
                <User className="mr-3 text-blue-500" size={24} />
                Profile Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-gray-700 font-medium">Full Name</label>
                  <input 
                    type="text" 
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700 font-medium">Email Address</label>
                  <input 
                    type="email" 
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700 font-medium">Phone Number (Optional)</label>
                  <input 
                    type="tel" 
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                  <p className="text-sm text-gray-500 mt-1">Enter your phone number in international format</p>
                </div>
                <button 
                  onClick={handleProfileUpdate}
                  disabled={isUpdating}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </div>

            {/* Password Change - Only for manual accounts */}
            {userProfile.authType === 'manual' && (
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center text-gray-800">
                  <Lock className="mr-3 text-green-500" size={24} />
                  Change Password
                </h2>
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block mb-2 text-gray-700 font-medium">Current Password</label>
                    <input 
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                      className="absolute right-3 top-11 text-gray-500"
                    >
                      {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="block mb-2 text-gray-700 font-medium">New Password</label>
                    <input 
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      className="absolute right-3 top-11 text-gray-500"
                    >
                      {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="block mb-2 text-gray-700 font-medium">Confirm New Password</label>
                    <input 
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="absolute right-3 top-11 text-gray-500"
                    >
                      {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <button 
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            )}

            {/* Notification Settings
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center text-gray-800">
                <Bell className="mr-3 text-yellow-500" size={24} />
                Notification Preferences
              </h2>
              <div className="space-y-4">
                {Object.entries({
                  emailNotifications: 'Email Notifications',
                  pushNotifications: 'Push Notifications',
                  promotionalEmails: 'Promotional Emails'
                }).map(([key, label]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings[key]}
                        onChange={() => setSettings({...settings, [key]: !settings[key]})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="flex items-center mb-4 text-red-600">
                <AlertTriangle className="mr-3" size={32} />
                <h2 className="text-2xl font-bold">Delete Account</h2>
              </div>
              <p className="text-gray-700 mb-4">
                This action cannot be undone. All your data, including advertisements and personal information, will be permanently deleted.
              </p>
              <p className="text-gray-700 mb-4 font-medium">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm:
              </p>
              <input 
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Type DELETE"
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                  }}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSettingsPage;