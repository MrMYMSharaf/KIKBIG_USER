import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  PlusCircle,
  Filter,
  Search,
  ShoppingBag,
  Heart,
  Gift,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  useGetMyAdvertisementsQuery,
  useDeleteAdvertisementMutation,
} from "../../features/postadsSlice";
import { useGetCurrentUserQuery } from "../../features/authSlice";
import PostAdsModal from '../PostAdsModalFlow/PostAdsModal';

const Myads = () => {
  const [postAdsModalOpen, setPostAdsModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, advertisement, need, offer
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, pending, sold

  // Get authentication status from Redux
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  // Get current user data from API
  const { data: currentUserData, isLoading: authLoading } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  const openPostAdsModal = () => setPostAdsModalOpen(true);
  const closePostAdsModal = () => setPostAdsModalOpen(false);

  // Redirect if not authenticated
  if (!isAuthenticated && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  // Fetch only current user's ads
  const { data, isLoading, isError, refetch } = useGetMyAdvertisementsQuery(
    {
      page: 1,
      limit: 100,
    },
    {
      skip: !isAuthenticated, // Skip if not authenticated
    }
  );

  const [deleteAd, { isLoading: isDeleting }] = useDeleteAdvertisementMutation();

  // Helper to normalize type string for comparison
  const normalizeType = (type) => {
    if (!type) return 'advertisement';
    return type.toString().toLowerCase().trim();
  };

  // Helper for status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "sold":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper for type badge color
  const getTypeBadgeColor = (type) => {
    const normalized = normalizeType(type);
    switch (normalized) {
      case "advertisement":
        return "bg-blue-500";
      case "need":
      case "needs":
        return "bg-purple-500";
      case "offer":
      case "offers":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // Helper for type icon
  const getTypeIcon = (type) => {
    const normalized = normalizeType(type);
    switch (normalized) {
      case "advertisement":
        return <ShoppingBag size={16} />;
      case "need":
      case "needs":
        return <Heart size={16} />;
      case "offer":
      case "offers":
        return <Gift size={16} />;
      default:
        return <ShoppingBag size={16} />;
    }
  };

  // Helper for display text
  const getTypeDisplayText = (type) => {
    const normalized = normalizeType(type);
    switch (normalized) {
      case "advertisement":
        return "Advertisement";
      case "need":
      case "needs":
        return "Need";
      case "offer":
      case "offers":
        return "Offer";
      default:
        return type || "Advertisement";
    }
  };

  // Handle ad delete with SweetAlert
  const handleDelete = async (id, title) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `You are about to delete:<br/><strong>${title}</strong>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await deleteAd(id).unwrap();
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Your advertisement has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#3B82F6',
          timer: 2000,
          showConfirmButton: false,
        });
        
        refetch();
        setSelectedAd(null);
      } catch (error) {
        console.error("Failed to delete ad:", error);
        
        Swal.fire({
          title: 'Error!',
          text: error?.data?.message || 'Failed to delete advertisement.',
          icon: 'error',
          confirmButtonColor: '#3B82F6',
        });
      }
    }
  };

  // Loading states
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your advertisements...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-2">Failed to load advertisements</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Adjust data mapping for your backend structure
  const ads = data?.data || [];

  // Filter by tab (type) - FIXED: Case-insensitive comparison
  const tabFilteredAds = activeTab === "all" 
    ? ads 
    : ads.filter((ad) => {
        const adType = normalizeType(ad.typeofads);
        const filterType = activeTab.toLowerCase();
        
        // Handle plural forms
        if (filterType === 'need') {
          return adType === 'need' || adType === 'needs';
        }
        if (filterType === 'offer') {
          return adType === 'offer' || adType === 'offers';
        }
        
        return adType === filterType;
      });

  // Filter by status
  const statusFilteredAds = statusFilter === "all"
    ? tabFilteredAds
    : tabFilteredAds.filter((ad) => ad.status?.toLowerCase() === statusFilter.toLowerCase());

  // Search filter
  const filteredAds = statusFilteredAds.filter((ad) =>
    ad.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Count by type - FIXED: Case-insensitive counting
  const counts = {
    all: ads.length,
    advertisement: ads.filter(ad => normalizeType(ad.typeofads) === 'advertisement').length,
    need: ads.filter(ad => {
      const type = normalizeType(ad.typeofads);
      return type === 'need' || type === 'needs';
    }).length,
    offer: ads.filter(ad => {
      const type = normalizeType(ad.typeofads);
      return type === 'offer' || type === 'offers';
    }).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              My Posts
            </h1>
            <p className="text-gray-600 mt-1">
              Total: {ads.length} post{ads.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button 
            onClick={openPostAdsModal}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition shadow-md hover:shadow-lg"
          >
            <PlusCircle className="mr-2" />
            Create New Post
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center px-6 py-3 font-semibold transition-all ${
                activeTab === "all"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Filter className="mr-2" size={18} />
              All ({counts.all})
            </button>
            <button
              onClick={() => setActiveTab("advertisement")}
              className={`flex items-center px-6 py-3 font-semibold transition-all ${
                activeTab === "advertisement"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <ShoppingBag className="mr-2" size={18} />
              Advertisements ({counts.advertisement})
            </button>
            <button
              onClick={() => setActiveTab("need")}
              className={`flex items-center px-6 py-3 font-semibold transition-all ${
                activeTab === "need"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Heart className="mr-2" size={18} />
              Needs ({counts.need})
            </button>
            <button
              onClick={() => setActiveTab("offer")}
              className={`flex items-center px-6 py-3 font-semibold transition-all ${
                activeTab === "offer"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Gift className="mr-2" size={18} />
              Offers ({counts.offer})
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="flex space-x-4">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Blocked</option>
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
        </div>

        {/* Ads Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAds.length > 0 ? (
            filteredAds.map((ad) => (
              <div
                key={ad._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:scale-105 hover:shadow-xl"
              >
                {/* Ad Image */}
                <div className="relative">
                  <img
                    src={
                      ad.images?.[0] || "https://via.placeholder.com/300x200"
                    }
                    alt={ad.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setSelectedAd(ad)}
                      className="bg-white/70 p-2 rounded-full hover:bg-white/90 transition"
                    >
                      <MoreVertical className="text-gray-700" size={20} />
                    </button>
                  </div>
                  {/* Type Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`${getTypeBadgeColor(ad.typeofads)} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                      {getTypeIcon(ad.typeofads)}
                      {getTypeDisplayText(ad.typeofads)}
                    </span>
                  </div>
                </div>

                {/* Ad Details */}
                <div className="p-4">
                  <h2 className="text-lg font-bold mb-2 line-clamp-2">{ad.title}</h2>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl font-semibold text-blue-600">
                      {ad.price ? `Rs. ${ad.price.toLocaleString()}` : "N/A"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${getStatusColor(
                        ad.status
                      )}`}
                    >
                      {ad.status || "Unknown"}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-between text-gray-500 text-xs">
                    <span>
                      {ad.createdAt
                        ? new Date(ad.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" /> {ad.views || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-20">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl font-semibold mb-2">
                {searchTerm 
                  ? "No posts found matching your search" 
                  : activeTab === "all" 
                    ? "No posts yet" 
                    : `No ${activeTab}s yet`}
              </p>
              <p className="text-gray-400 mb-4">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Start by creating your first post"}
              </p>
              {!searchTerm && (
                <button
                  onClick={openPostAdsModal}
                  className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Create Your First Post
                </button>
              )}
            </div>
          )}
        </div>

        {/* Post Ads Modal */}
        <PostAdsModal
          isOpen={postAdsModalOpen}
          onClose={closePostAdsModal}
        />

        {/* Action Modal */}
        {selectedAd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-96 max-w-full">
              <h3 className="text-xl font-bold mb-4 line-clamp-2">{selectedAd.title}</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    // Navigate to edit page
                    window.location.href = `/edit-ad/${selectedAd._id}`;
                  }}
                  className="w-full flex items-center justify-center py-3 hover:bg-gray-100 rounded transition"
                >
                  <Edit className="mr-2" size={18} /> Edit Post
                </button>
                <button
                  onClick={() => handleDelete(selectedAd._id, selectedAd.title)}
                  disabled={isDeleting}
                  className="w-full flex items-center justify-center py-3 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="mr-2" size={18} /> 
                  {isDeleting ? 'Deleting...' : 'Delete Post'}
                </button>
                <button
                  onClick={() => setSelectedAd(null)}
                  className="w-full py-3 border mt-4 rounded hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Myads;