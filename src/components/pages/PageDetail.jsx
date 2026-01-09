import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {ArrowLeft,MapPin,Phone,Globe,Share2,Heart,Flag,Users,Star,Edit3,Trash2,Camera,Send,Tag,Store,FileText,Award,Crown,Gem,Image as ImageIcon,AlertCircle} from 'lucide-react';
import { useGetPageByIdQuery,useDeletePageMutation } from '../../features/pageApiSlice';
import {useIsFollowingPageQuery,useFollowPageMutation,useUnfollowPageMutation} from '../../features/page.flowwingSlice';



// Icon mapping for page types (same as Page_create)
const PAGE_TYPE_ICONS = {
  'Basic Page': { icon: FileText, color: 'bg-gray-500', gradient: 'from-gray-400 to-gray-600' },
  'Standard Page': { icon: Award, color: 'bg-blue-500', gradient: 'from-blue-400 to-blue-600' },
  'Premium Page': { icon: Crown, color: 'bg-purple-500', gradient: 'from-purple-400 to-purple-600' },
  'VIP Page': { icon: Gem, color: 'bg-yellow-500', gradient: 'from-yellow-400 to-yellow-600' },
};

// Helper function to get icon for page type
const getPageTypeIcon = (pageTypeName) => {
  const iconData = PAGE_TYPE_ICONS[pageTypeName] || PAGE_TYPE_ICONS['Basic Page'];
  return iconData;
};

const PageDetail = () => {
  
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch page data
  const { data: pageData, isLoading, error, refetch } = useGetPageByIdQuery(id);
  const [deletePage] = useDeletePageMutation();
  
  // Follow/Unfollow functionality
  const { data: followingStatus, isLoading: followStatusLoading } = useIsFollowingPageQuery(
    { pageId: id }
  );
  
  const [followPage, { isLoading: following }] = useFollowPageMutation();
  const [unfollowPage, { isLoading: unfollowing }] = useUnfollowPageMutation();
  
  const [activeTab, setActiveTab] = useState('About');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const page = pageData?.data;
  const isFollowing = followingStatus?.isFollowing || false;
  const isFollowActionLoading = following || unfollowing;
  
  // Check if current user is owner (from backend)
  const isOwner = page?.isOwner || false;

  const handleFollow = async () => {
    try {
      // If already following, unfollow
      if (isFollowing) {
        const result = await unfollowPage({ pageId: id }).unwrap();
        console.log('Unfollow successful:', result);
      } else {
        const result = await followPage({ pageId: id }).unwrap();
        console.log('Follow successful:', result);
      }

      // Refetch page to update followers count
      refetch();
    } catch (error) {
      console.error('Follow/Unfollow error:', error);
      
      // Check if it's an authentication error
      if (error?.status === 401 || error?.status === 403) {
        alert('Your session has expired. Please login again.');
        navigate('/login');
      } else {
        alert(error?.data?.message || 'Failed to update follow status');
      }
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleEdit = () => {
    navigate(`/pages/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await deletePage(id).unwrap();
      navigate('/pages');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete page');
    }
  };

  // Get location display
  const getLocationDisplay = () => {
    if (!page?.location) return null;
    const parts = [
      page.location.villageName,
      page.location.townName,
      page.location.municipalityName,
      page.location.districtName,
      page.location.provinceName,
      page.location.stateName,
      page.location.countryName
    ].filter(Boolean);
    return parts.slice(0, 2).join(', ');
  };

  // Get icon data for current page type
  const currentPageTypeIcon = page?.pagetype ? getPageTypeIcon(page.pagetype.name) : null;
  const PageTypeIconComponent = currentPageTypeIcon?.icon;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#00008F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading page...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <button
            onClick={() => navigate('/pages')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 font-semibold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Pages
          </button>
          
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flag className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-gray-900 font-semibold mb-2">Page not found</p>
              <p className="text-gray-600 text-sm">This page may have been deleted or doesn't exist</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/pages')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Pages
          </button>
        </div>

        {/* Page Preview - Same structure as Page_create */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          
          {/* Cover Image Section */}
          <div className="relative">
            {page.cover_image ? (
              <div className="relative h-64 group">
                <img 
                  src={page.cover_image} 
                  alt="Cover" 
                  className="w-full h-full object-cover" 
                />
                {/* Owner Controls Overlay */}
                {isOwner && (
                  <div className="absolute top-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={handleEdit}
                      className="bg-white text-gray-900 p-3 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-red-500 text-white p-3 rounded-lg shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative h-64 bg-gradient-to-br from-[#00008F]/10 to-blue-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-16 h-16 text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {/* Logo and Title Section */}
          <div className="px-6 pb-6">
            <div className="flex items-start gap-4 -mt-16 relative z-10">
              {/* Logo */}
              <div className="relative">
                {page.logo_image ? (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                    <img 
                      src={page.logo_image} 
                      alt="Logo" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 shadow-lg flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Title and Stats */}
              <div className="flex-1 pt-16">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {page.title}
                </h1>

                {/* Page Type Badge with Icon */}
                {PageTypeIconComponent && (
                  <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${currentPageTypeIcon?.gradient} text-white px-4 py-2 rounded-lg text-sm font-semibold mb-3 shadow-md`}>
                    <PageTypeIconComponent className="w-5 h-5" />
                    {page.pagetype?.name}
                  </div>
                )}

                {/* Location */}
                {getLocationDisplay() && (
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{getLocationDisplay()}</span>
                  </div>
                )}

                {/* Stats Row - Followers, Rating, Share */}
                <div className="flex items-center gap-6 mb-4">
                  {/* Followers */}
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#00008F]" />
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {page.followersCount || 0}
                      </div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <div>
                      <div className="text-lg font-bold text-gray-900">{(page.averageRating || 0).toFixed(1)}</div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-auto">
                    {!isOwner && (
                      <button
                        onClick={handleFollow}
                        disabled={isFollowActionLoading || followStatusLoading}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                          isFollowing
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-[#00008F] text-white hover:bg-[#00006F]'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isFollowing ? 'fill-current text-red-500' : ''}`} />
                        {isFollowActionLoading 
                          ? 'Loading...' 
                          : isFollowing 
                            ? 'Following' 
                            : 'Follow'}
                      </button>
                    )}
                    
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#00008F]/10 text-[#00008F] rounded-lg hover:bg-[#00008F]/20 transition-colors shadow-sm"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm font-semibold">Share</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Edit Button (for owners) */}
              {isOwner && (
                <button
                  onClick={handleEdit}
                  className="bg-[#00008F] text-white p-3 rounded-lg hover:bg-[#00006F] transition-colors mt-16 shadow-lg"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              )}
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
                  <p className="text-gray-700 leading-relaxed">
                    {page.description || 'No description available.'}
                  </p>
                </div>

                {/* Tags */}
                {page.tags?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {page.tags.map((tag, i) => (
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

                {/* Category & Subcategory & Language Info */}
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#00008F]" />
                    Page Information
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    {page.category?.name && (
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">Category:</span> 
                        {page.category.name}
                      </p>
                    )}
                    {page.childCategory?.name && (
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">Subcategory:</span> 
                        {page.childCategory.name}
                      </p>
                    )}
                    {page.language?.name && (
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">Language:</span> 
                        {page.language.name}
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
                    {page.contact?.phone && (
                      <a
                        href={`tel:${page.contact.phone}`}
                        className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#00008F]/50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-[#00008F] rounded-full flex items-center justify-center">
                          <Phone className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Phone</p>
                          <p className="text-gray-700">{page.contact.phone}</p>
                        </div>
                      </a>
                    )}

                    {/* WhatsApp */}
                    {page.contact?.whatsapp && (
                      <a
                        href={`https://wa.me/${page.contact.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#00008F]/50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <Phone className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">WhatsApp</p>
                          <p className="text-gray-700">{page.contact.whatsapp}</p>
                        </div>
                      </a>
                    )}

                    {/* Email */}
                    {page.contact?.email && (
                      <a
                        href={`mailto:${page.contact.email}`}
                        className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#00008F]/50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Email</p>
                          <p className="text-gray-700">{page.contact.email}</p>
                        </div>
                      </a>
                    )}

                    {/* Telegram */}
                    {page.contact?.telegram && (
                      <a
                        href={`https://t.me/${page.contact.telegram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#00008F]/50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                          <Send className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Telegram</p>
                          <p className="text-gray-700">{page.contact.telegram}</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Social Media</h3>
                  
                  <div className="space-y-3">
                    {/* Website */}
                    {page.social?.website && (
                      <a
                        href={page.social.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#00008F]/50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                          <Globe className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Website</p>
                          <p className="text-gray-700 text-sm truncate">{page.social.website}</p>
                        </div>
                      </a>
                    )}

                    {/* Facebook */}
                    {page.social?.facebook && (
                      <a
                        href={page.social.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#00008F]/50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <Share2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Facebook</p>
                          <p className="text-gray-700 text-sm truncate">{page.social.facebook}</p>
                        </div>
                      </a>
                    )}

                    {/* Instagram */}
                    {page.social?.instagram && (
                      <a
                        href={page.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#00008F]/50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Instagram</p>
                          <p className="text-gray-700 text-sm truncate">{page.social.instagram}</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>

                {/* Location Info */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Location</h3>
                  <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Address</p>
                      {getLocationDisplay() ? (
                        <p className="text-gray-700 text-sm">{getLocationDisplay()}</p>
                      ) : (
                        <p className="text-gray-400 text-sm">No location specified</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gallery Section */}
            {activeTab === 'Gallery' && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Gallery</h3>
                {page.images?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {page.images.map((img, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={img} 
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-semibold mb-2">No images yet</p>
                    <p className="text-gray-400 text-sm">Gallery is empty</p>
                  </div>
                )}
              </div>
            )}

            {/* Advertisement Section */}
            {activeTab === 'Advertisement' && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Advertisements</h3>
                </div>

                <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">No advertisements yet</p>
                  <p className="text-gray-400 text-sm">This page has no active advertisements</p>
                </div>
              </div>
            )}

            {/* Need Section */}
            {activeTab === 'Need' && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Needs</h3>
                </div>

                <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">No needs posted yet</p>
                  <p className="text-gray-400 text-sm">This page has no active needs</p>
                </div>
              </div>
            )}

            {/* Offer Section */}
            {activeTab === 'Offer' && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Offers</h3>
                </div>

                <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                  <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">No offers available</p>
                  <p className="text-gray-400 text-sm">This page has no active offers</p>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            {activeTab === 'Reviews' && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Ratings & Reviews</h3>
                  {!isOwner && (
                    <button className="text-[#00008F] text-sm font-semibold hover:underline">
                      Write Review
                    </button>
                  )}
                </div>

                {/* Overall Rating */}
                <div className="bg-gradient-to-br from-[#00008F]/5 to-blue-50 rounded-xl p-6 border border-[#00008F]/10">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-black text-[#00008F] mb-2">{(page.averageRating || 0).toFixed(1)}</div>
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(page.averageRating || 0)
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300 fill-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{page.reviews?.length || 0} reviews</p>
                    </div>

                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = page.reviews?.filter(r => r.rating === rating).length || 0;
                        const percentage = page.reviews?.length ? (count / page.reviews.length) * 100 : 0;
                        
                        return (
                          <div key={rating} className="flex items-center gap-3 mb-2">
                            <span className="text-xs text-gray-600 w-8">{rating} ★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-yellow-400 h-full rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                {page.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {page.reviews.map((review, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-[#00008F] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {review.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-gray-900">{review.user?.name || 'Anonymous'}</h4>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {review.comment}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
                    <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-semibold mb-2">No reviews yet</p>
                    <p className="text-gray-400 text-sm">Be the first to leave a review!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
            

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Share this page</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-4 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold">
                <Share2 className="w-5 h-5" />
                Share on Facebook
              </button>
              <button className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-semibold">
                <ImageIcon className="w-5 h-5" />
                Share on Instagram
              </button>
              <button className="w-full flex items-center gap-4 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold">
                <Send className="w-5 h-5" />
                Share on WhatsApp
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Page?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this page? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageDetail;

