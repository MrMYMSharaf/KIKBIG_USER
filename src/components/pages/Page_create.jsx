import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  FileText,
  MapPin,
  Image as ImageIcon,
  Phone,
  Share2,
  CheckCircle,
  AlertCircle,
  X,
  Upload,
  Globe,
  Edit3,
  Camera,
  Save,
  ChevronDown,
  Tag,
  Users,
  Star,
  MessageCircle,
  Heart,
  Send,
  Bookmark,
  MoreHorizontal,
} from 'lucide-react';

// Redux
import {
  setPageType,
  updateFormData,
  updateNestedFormData,
  setErrors,
  clearErrors,
  resetPageCreate,
  addTag,
  removeTag,
  addImage,
  removeImage,
} from '../../features/redux/pagecreationSlice';

// RTK Query
import { useGetPageTypesQuery } from '../../features/pagetypeApi';
import { useCategoryQuery } from '../../features/categorySlice';
import { useLanguageQuery } from '../../features/languageSlice';
import { useLocationQuery } from '../../features/locationSlice';
import { useCreatePageMutation } from '../../features/pageApiSlice';

// Skeleton Components
const SkeletonBox = ({ className = '', onClick }) => (
  <div 
    className={`bg-gray-200 animate-pulse rounded cursor-pointer hover:bg-gray-300 transition-colors ${className}`}
    onClick={onClick}
  ></div>
);

const SkeletonText = ({ className = '', onClick }) => (
  <div 
    className={`h-3 bg-gray-200 animate-pulse rounded cursor-pointer hover:bg-gray-300 transition-colors ${className}`}
    onClick={onClick}
  ></div>
);

const SkeletonCircle = ({ className = '', onClick }) => (
  <div 
    className={`bg-gray-200 animate-pulse rounded-full cursor-pointer hover:bg-gray-300 transition-colors ${className}`}
    onClick={onClick}
  ></div>
);

// Edit Modal Component
const EditModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

const Page_create = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { pageType, formData, errors } = useSelector((state) => state.pageCreate);
  const { user } = useSelector((state) => state.auth);
  const { country } = useSelector((state) => state.country);

  // RTK Queries
  const { data: pageTypesData, isLoading: loadingPageTypes } = useGetPageTypesQuery();
  const { data: categoriesData, isLoading: loadingCategories } = useCategoryQuery();
  const { data: languagesData } = useLanguageQuery();
  const { data: locationsData } = useLocationQuery(country);

  // Mutation
  const [createPage, { isLoading: creating }] = useCreatePageMutation();

  // Local state for modals
  const [editingSection, setEditingSection] = useState(null);
  const [currentTag, setCurrentTag] = useState('');
  const [activeTab, setActiveTab] = useState('About');
  const [imagePreview, setImagePreview] = useState({
    cover: null,
    logo: null,
    gallery: [],
  });

  // Convert base64 to preview URL
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle image upload
  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await convertToBase64(file);
      
      if (type === 'cover') {
        dispatch(updateFormData({ cover_image: base64 }));
        setImagePreview({ ...imagePreview, cover: base64 });
      } else if (type === 'logo') {
        dispatch(updateFormData({ logo_image: base64 }));
        setImagePreview({ ...imagePreview, logo: base64 });
      } else if (type === 'gallery') {
        dispatch(addImage(base64));
        setImagePreview({ 
          ...imagePreview, 
          gallery: [...imagePreview.gallery, base64] 
        });
      }
    } catch (error) {
      console.error('Error converting image:', error);
    }
  };

  // Handle tag input
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      dispatch(addTag(currentTag.trim()));
      setCurrentTag('');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate required fields
    if (!pageType) {
      alert('Please select a page type');
      setEditingSection('pageType');
      return;
    }
    if (!formData.title?.trim()) {
      alert('Please add a page title');
      setEditingSection('basic');
      return;
    }
    if (!formData.description?.trim()) {
      alert('Please add a description');
      setEditingSection('basic');
      return;
    }
    if (!formData.category) {
      alert('Please select a category');
      setEditingSection('basic');
      return;
    }

    try {
      const result = await createPage(formData).unwrap();
      alert('Page created successfully!');
      dispatch(resetPageCreate());
      navigate('/pages');
    } catch (error) {
      console.error('Failed to create page:', error);
      alert('Failed to create page. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Page</h1>
          <p className="text-gray-600">Click on any section to edit and customize</p>
        </div>

        {/* Page Preview/Editor */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          
          {/* Cover Image Section */}
          <div className="relative">
            {imagePreview.cover ? (
              <div className="relative h-64 group">
                <img 
                  src={imagePreview.cover} 
                  alt="Cover" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors">
                    <Camera className="w-5 h-5" />
                    Change Cover
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'cover')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="relative h-64 bg-gradient-to-br from-[#00008F]/10 to-blue-100 group cursor-pointer">
                <SkeletonBox className="w-full h-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <label className="cursor-pointer bg-[#00008F] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#00006F] transition-colors shadow-lg">
                    <Camera className="w-5 h-5" />
                    Add Cover Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'cover')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Edit Button */}
            <button
              onClick={() => setEditingSection('cover')}
              className="absolute top-4 right-4 bg-white text-gray-900 p-3 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>

          {/* Logo and Title Section */}
          <div className="px-6 pb-6">
            <div className="flex items-start gap-4 -mt-16 relative z-10">
              {/* Logo */}
              <div className="relative group">
                {imagePreview.logo ? (
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                      <img 
                        src={imagePreview.logo} 
                        alt="Logo" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <label className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Camera className="w-8 h-8 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 shadow-lg">
                      <SkeletonCircle className="w-full h-full" />
                    </div>
                    <label className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/30 transition-colors">
                      <Camera className="w-8 h-8 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Title and Stats */}
              <div className="flex-1 pt-16">
                {formData.title ? (
                  <h1 
                    className="text-3xl font-bold text-gray-900 mb-3 cursor-pointer hover:text-[#00008F] transition-colors"
                    onClick={() => setEditingSection('basic')}
                  >
                    {formData.title}
                  </h1>
                ) : (
                  <div 
                    onClick={() => setEditingSection('basic')}
                    className="space-y-2 mb-3"
                  >
                    <SkeletonText className="w-2/3 h-8" />
                  </div>
                )}

                {/* Page Type Badge */}
                {pageType ? (
                  <div className="inline-flex items-center gap-2 bg-[#00008F]/10 text-[#00008F] px-4 py-2 rounded-lg text-sm font-semibold mb-3">
                    {pageType.name}
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingSection('pageType')}
                    className="bg-[#00008F] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#00006F] transition-colors mb-3"
                  >
                    Select Page Type
                  </button>
                )}

                {/* Location */}
                <div 
                  className="flex items-center gap-2 text-gray-600 mb-4 cursor-pointer hover:text-[#00008F] transition-colors"
                  onClick={() => setEditingSection('location')}
                >
                  <MapPin className="w-4 h-4" />
                  {formData.location.town || formData.location.district ? (
                    <span className="text-sm">
                      {[
                        formData.location.town && locationsData?.data?.towns?.find(t => t._id === formData.location.town)?.name,
                        formData.location.district && locationsData?.data?.districts?.find(d => d._id === formData.location.district)?.name,
                      ].filter(Boolean).join(', ')}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Add location</span>
                  )}
                </div>

                {/* Stats Row - Followers, Rating, Share */}
                <div className="flex items-center gap-6 mb-4">
                  {/* Followers */}
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                    onClick={() => setEditingSection('basic')}
                  >
                    <Users className="w-5 h-5 text-[#00008F]" />
                    <div>
                      <div className="text-lg font-bold text-gray-900">0</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                    onClick={() => setActiveTab('Reviews')}
                  >
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <div>
                      <div className="text-lg font-bold text-gray-900">0.0</div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                  </div>

                  {/* Share Button */}
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#00008F]/10 text-[#00008F] rounded-lg hover:bg-[#00008F]/20 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm font-semibold">Share</span>
                  </button>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setEditingSection('basic')}
                className="bg-[#00008F] text-white p-3 rounded-lg hover:bg-[#00006F] transition-colors mt-16 shadow-lg"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="border-t border-b border-gray-200 -mx-6 px-6 mt-6">
              <div className="flex gap-1 overflow-x-auto py-2">
                {['About', 'Contact', 'Gallery', 'Advertisement', 'Need', 'Offer', 'Reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? 'bg-[#00008F] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* About Section */}
            {activeTab === 'About' && (
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
                  {formData.description ? (
                    <p 
                      className="text-gray-700 leading-relaxed cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                      onClick={() => setEditingSection('basic')}
                    >
                      {formData.description}
                    </p>
                  ) : (
                    <div 
                      onClick={() => setEditingSection('basic')}
                      className="space-y-2 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <SkeletonText className="w-full" />
                      <SkeletonText className="w-full" />
                      <SkeletonText className="w-4/5" />
                      <SkeletonText className="w-3/5" />
                    </div>
                  )}
                </div>

                {/* Tags */}
                {formData.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-[#00008F]/10 text-[#00008F] px-3 py-1 rounded-full text-sm font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category & Language Info */}
                <div 
                  onClick={() => setEditingSection('basic')}
                  className="bg-white border border-gray-200 p-4 rounded-lg cursor-pointer hover:border-[#00008F]/50 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#00008F]" />
                    Page Information
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    {formData.category ? (
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">Category:</span> 
                        {categoriesData?.data?.find(c => c._id === formData.category)?.name || 'Selected'}
                      </p>
                    ) : (
                      <p className="text-gray-400">Click to add category</p>
                    )}
                    {formData.language && (
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">Language:</span> 
                        {languagesData?.data?.find(l => l._id === formData.language)?.name || 'Selected'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Section */}
            {activeTab === 'Contact' && (
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                  
                  <div className="space-y-3">
                    {/* Phone */}
                    <div 
                      onClick={() => setEditingSection('contact')}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00008F]/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-[#00008F] rounded-full flex items-center justify-center">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Phone</p>
                        {formData.contact.phone ? (
                          <p className="text-gray-700">{formData.contact.phone}</p>
                        ) : (
                          <p className="text-gray-400 text-sm">Click to add phone number</p>
                        )}
                      </div>
                      <Edit3 className="w-5 h-5 text-gray-400" />
                    </div>

                    {/* WhatsApp */}
                    <div 
                      onClick={() => setEditingSection('contact')}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00008F]/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">WhatsApp</p>
                        {formData.contact.whatsapp ? (
                          <p className="text-gray-700">{formData.contact.whatsapp}</p>
                        ) : (
                          <p className="text-gray-400 text-sm">Click to add WhatsApp number</p>
                        )}
                      </div>
                      <Edit3 className="w-5 h-5 text-gray-400" />
                    </div>

                    {/* Email */}
                    <div 
                      onClick={() => setEditingSection('contact')}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00008F]/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Email</p>
                        {formData.contact.email ? (
                          <p className="text-gray-700">{formData.contact.email}</p>
                        ) : (
                          <p className="text-gray-400 text-sm">Click to add email address</p>
                        )}
                      </div>
                      <Edit3 className="w-5 h-5 text-gray-400" />
                    </div>

                    {/* Telegram */}
                    <div 
                      onClick={() => setEditingSection('contact')}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00008F]/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                        <Send className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Telegram</p>
                        {formData.contact.telegram ? (
                          <p className="text-gray-700">{formData.contact.telegram}</p>
                        ) : (
                          <p className="text-gray-400 text-sm">Click to add Telegram username</p>
                        )}
                      </div>
                      <Edit3 className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Social Media</h3>
                  
                  <div className="space-y-3">
                    {/* Website */}
                    <div 
                      onClick={() => setEditingSection('contact')}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00008F]/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Website</p>
                        {formData.social.website ? (
                          <p className="text-gray-700 text-sm truncate">{formData.social.website}</p>
                        ) : (
                          <p className="text-gray-400 text-sm">Click to add website URL</p>
                        )}
                      </div>
                      <Edit3 className="w-5 h-5 text-gray-400" />
                    </div>

                    {/* Facebook */}
                    <div 
                      onClick={() => setEditingSection('contact')}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00008F]/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <Share2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Facebook</p>
                        {formData.social.facebook ? (
                          <p className="text-gray-700 text-sm truncate">{formData.social.facebook}</p>
                        ) : (
                          <p className="text-gray-400 text-sm">Click to add Facebook page</p>
                        )}
                      </div>
                      <Edit3 className="w-5 h-5 text-gray-400" />
                    </div>

                    {/* Instagram */}
                    <div 
                      onClick={() => setEditingSection('contact')}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00008F]/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Instagram</p>
                        {formData.social.instagram ? (
                          <p className="text-gray-700 text-sm truncate">{formData.social.instagram}</p>
                        ) : (
                          <p className="text-gray-400 text-sm">Click to add Instagram profile</p>
                        )}
                      </div>
                      <Edit3 className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Location Info */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Location</h3>
                  <div 
                    onClick={() => setEditingSection('location')}
                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00008F]/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Address</p>
                      {formData.location.town || formData.location.district ? (
                        <p className="text-gray-700 text-sm">
                          {[
                            formData.location.town && locationsData?.data?.towns?.find(t => t._id === formData.location.town)?.name,
                            formData.location.district && locationsData?.data?.districts?.find(d => d._id === formData.location.district)?.name,
                            formData.location.state && locationsData?.data?.states?.find(s => s._id === formData.location.state)?.name,
                            formData.location.country && locationsData?.data?.countries?.find(c => c._id === formData.location.country)?.name,
                          ].filter(Boolean).join(', ')}
                        </p>
                      ) : (
                        <p className="text-gray-400 text-sm">Click to add location</p>
                      )}
                    </div>
                    <Edit3 className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Gallery Section */}
            {activeTab === 'Gallery' && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Photo Gallery</h3>
                  <label className="cursor-pointer bg-[#00008F] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#00006F] transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Add Photos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        Array.from(e.target.files).forEach(file => {
                          convertToBase64(file).then(base64 => {
                            dispatch(addImage(base64));
                            setImagePreview({ 
                              ...imagePreview, 
                              gallery: [...imagePreview.gallery, base64] 
                            });
                          });
                        });
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                
                {imagePreview.gallery.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {imagePreview.gallery.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200">
                        <img 
                          src={img} 
                          alt={`Gallery ${index + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => {
                              dispatch(removeImage(index));
                              setImagePreview({
                                ...imagePreview,
                                gallery: imagePreview.gallery.filter((_, i) => i !== index),
                              });
                            }}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-semibold mb-2">No photos yet</p>
                    <p className="text-gray-400 text-sm mb-4">Upload photos to showcase your page</p>
                    <label className="inline-flex cursor-pointer bg-[#00008F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#00006F] transition-colors">
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Photos
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          Array.from(e.target.files).forEach(file => {
                            convertToBase64(file).then(base64 => {
                              dispatch(addImage(base64));
                              setImagePreview({ 
                                ...imagePreview, 
                                gallery: [...imagePreview.gallery, base64] 
                              });
                            });
                          });
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Advertisement Section */}
            {activeTab === 'Advertisement' && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Advertisements</h3>
                  <button className="bg-[#00008F] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#00006F] transition-colors">
                    Create Ad
                  </button>
                </div>

                <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">No advertisements yet</p>
                  <p className="text-gray-400 text-sm mb-4">Promote your products or services</p>
                  <button className="bg-[#00008F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#00006F] transition-colors">
                    Create Advertisement
                  </button>
                </div>
              </div>
            )}

            {/* Need Section */}
            {activeTab === 'Need' && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Needs</h3>
                  <button className="bg-[#00008F] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#00006F] transition-colors">
                    Add Need
                  </button>
                </div>

                <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">No needs posted yet</p>
                  <p className="text-gray-400 text-sm mb-4">Share what you're looking for</p>
                  <button className="bg-[#00008F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#00006F] transition-colors">
                    Post a Need
                  </button>
                </div>
              </div>
            )}

            {/* Offer Section */}
            {activeTab === 'Offer' && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Offers</h3>
                  <button className="bg-[#00008F] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#00006F] transition-colors">
                    Create Offer
                  </button>
                </div>

                <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                  <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">No offers available</p>
                  <p className="text-gray-400 text-sm mb-4">Share special deals with your followers</p>
                  <button className="bg-[#00008F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#00006F] transition-colors">
                    Create Special Offer
                  </button>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            {activeTab === 'Reviews' && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Ratings & Reviews</h3>
                  <button className="text-[#00008F] text-sm font-semibold hover:underline">
                    See All
                  </button>
                </div>

                {/* Overall Rating */}
                <div className="bg-gradient-to-br from-[#00008F]/5 to-blue-50 rounded-xl p-6 border border-[#00008F]/10">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-black text-[#00008F] mb-2">0.0</div>
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-5 h-5 text-gray-300 fill-gray-300"
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">0 reviews</p>
                    </div>

                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-3 mb-2">
                          <span className="text-xs text-gray-600 w-8">{rating} ★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-yellow-400 h-full rounded-full transition-all"
                              style={{ width: '0%' }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 w-8">0</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* No Reviews Yet */}
                <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">No reviews yet</p>
                  <p className="text-gray-400 text-sm">Be the first to leave a review!</p>
                </div>

                {/* Review Skeleton Placeholders */}
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <SkeletonCircle className="w-12 h-12 flex-shrink-0" />
                        <div className="flex-1 space-y-3">
                          <div>
                            <SkeletonText className="w-32 h-4 mb-2" />
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <div key={star} className="w-4 h-4 bg-gray-200 rounded"></div>
                                ))}
                              </div>
                              <SkeletonText className="w-16 h-3" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <SkeletonText className="w-full h-3" />
                            <SkeletonText className="w-4/5 h-3" />
                            <SkeletonText className="w-3/5 h-3" />
                          </div>
                          <div className="flex items-center gap-4">
                            <SkeletonText className="w-12 h-4" />
                            <SkeletonText className="w-12 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                <button className="w-full mt-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                  Load More Reviews
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={creating}
            className="flex items-center gap-2 px-8 py-3 bg-[#00008F] text-white rounded-lg font-semibold hover:bg-[#00006F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {creating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Create Page
              </>
            )}
          </button>
        </div>

        {/* Edit Modals */}
        
        {/* Page Type Modal */}
        <EditModal
          isOpen={editingSection === 'pageType'}
          onClose={() => setEditingSection(null)}
          title="Select Page Type"
        >
          {loadingPageTypes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 border-2 border-gray-200 rounded-xl space-y-4">
                  <SkeletonBox className="h-6 w-3/4" />
                  <div className="space-y-2">
                    <SkeletonText className="w-full" />
                    <SkeletonText className="w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pageTypesData?.data?.map((type) => {
                const price = type.prices?.[country] || type.prices?.['LK'];
                const isFree = !price || price.price === 0;
                const isSelected = pageType?._id === type._id;

                return (
                  <div
                    key={type._id}
                    onClick={() => {
                      dispatch(setPageType(type));
                      setEditingSection(null);
                    }}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#00008F] bg-[#00008F]/5'
                        : 'border-gray-200 hover:border-[#00008F]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{type.name}</h3>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-[#00008F]" />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{type.description}</p>
                    <div className="space-y-2 text-sm">
                      {price && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-bold text-[#00008F]">
                            {price.price === 0 ? 'Free' : `${price.price} ${country === 'LK' ? 'LKR' : 'USD'}`}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valid Days:</span>
                        <span className="font-bold text-gray-900">{type.validdays || 'Unlimited'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </EditModal>

        {/* Basic Info Modal */}
        <EditModal
          isOpen={editingSection === 'basic'}
          onClose={() => setEditingSection(null)}
          title="Edit Basic Information"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Page Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => dispatch(updateFormData({ title: e.target.value }))}
                placeholder="Enter your page title"
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => dispatch(updateFormData({ description: e.target.value }))}
                placeholder="Describe your page..."
                rows={5}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => dispatch(updateFormData({ category: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                >
                  <option value="">Select Category</option>
                  {categoriesData?.data?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => dispatch(updateFormData({ language: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                >
                  <option value="">Select Language</option>
                  {languagesData?.data?.map((lang) => (
                    <option key={lang._id} value={lang._id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-900 font-semibold mb-2">Tags</label>
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type a tag and press Enter"
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-[#00008F]/10 border border-[#00008F] text-[#00008F] px-3 py-1 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                    <button
                      onClick={() => dispatch(removeTag(tag))}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setEditingSection(null)}
              className="w-full bg-[#00008F] text-white py-3 rounded-xl font-semibold hover:bg-[#00006F] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </EditModal>

        {/* Location Modal */}
        <EditModal
          isOpen={editingSection === 'location'}
          onClose={() => setEditingSection(null)}
          title="Edit Location"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 font-semibold mb-2">Country</label>
                <select
                  value={formData.location.country}
                  onChange={(e) =>
                    dispatch(updateNestedFormData({ field: 'location', data: { country: e.target.value } }))
                  }
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                >
                  <option value="">Select Country</option>
                  {locationsData?.data?.countries?.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">Region/State</label>
                <select
                  value={formData.location.state}
                  onChange={(e) =>
                    dispatch(updateNestedFormData({ field: 'location', data: { state: e.target.value } }))
                  }
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                >
                  <option value="">Select State</option>
                  {locationsData?.data?.states?.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">District</label>
                <select
                  value={formData.location.district}
                  onChange={(e) =>
                    dispatch(updateNestedFormData({ field: 'location', data: { district: e.target.value } }))
                  }
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                >
                  <option value="">Select District</option>
                  {locationsData?.data?.districts?.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">City/Town</label>
                <select
                  value={formData.location.town}
                  onChange={(e) =>
                    dispatch(updateNestedFormData({ field: 'location', data: { town: e.target.value } }))
                  }
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                >
                  <option value="">Select City/Town</option>
                  {locationsData?.data?.towns?.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setEditingSection(null)}
              className="w-full bg-[#00008F] text-white py-3 rounded-xl font-semibold hover:bg-[#00006F] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </EditModal>

        {/* Contact Modal */}
        <EditModal
          isOpen={editingSection === 'contact'}
          onClose={() => setEditingSection(null)}
          title="Edit Contact Information"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 font-semibold mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(e) =>
                    dispatch(updateNestedFormData({ field: 'contact', data: { phone: e.target.value } }))
                  }
                  placeholder="+94 77 123 4567"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">WhatsApp</label>
                <input
                  type="tel"
                  value={formData.contact.whatsapp}
                  onChange={(e) =>
                    dispatch(updateNestedFormData({ field: 'contact', data: { whatsapp: e.target.value } }))
                  }
                  placeholder="+94 77 123 4567"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) =>
                    dispatch(updateNestedFormData({ field: 'contact', data: { email: e.target.value } }))
                  }
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">Telegram</label>
                <input
                  type="text"
                  value={formData.contact.telegram}
                  onChange={(e) =>
                    dispatch(updateNestedFormData({ field: 'contact', data: { telegram: e.target.value } }))
                  }
                  placeholder="@username"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Social Media</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.social.website}
                    onChange={(e) =>
                      dispatch(updateNestedFormData({ field: 'social', data: { website: e.target.value } }))
                    }
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Facebook</label>
                  <input
                    type="url"
                    value={formData.social.facebook}
                    onChange={(e) =>
                      dispatch(updateNestedFormData({ field: 'social', data: { facebook: e.target.value } }))
                    }
                    placeholder="https://facebook.com/yourpage"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Instagram</label>
                  <input
                    type="url"
                    value={formData.social.instagram}
                    onChange={(e) =>
                      dispatch(updateNestedFormData({ field: 'social', data: { instagram: e.target.value } }))
                    }
                    placeholder="https://instagram.com/yourprofile"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setEditingSection(null)}
              className="w-full bg-[#00008F] text-white py-3 rounded-xl font-semibold hover:bg-[#00006F] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </EditModal>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Page_create;