import React, { useState } from "react";
import { Navigate } from "react-router-dom"; // ✅ Added import
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  PlusCircle,
  Filter,
  Search,
} from "lucide-react";
import {
  useGetMyAdvertisementsQuery,
  useDeleteAdvertisementMutation,
} from "../../features/postadsSlice";
import { useAuth } from "../../hooks/useAuth";
import PostAdsModal from '../PostAdsModalFlow/PostAdsModal';

const Myads = () => {
  // 🔥 Use the auth hook to get user ID
  const { userId, isAuthenticated, isLoading: authLoading } = useAuth();
  const [postAdsModalOpen, setPostAdsModalOpen] = useState(false);

  const openPostAdsModal = () => setPostAdsModalOpen(true);
  const closePostAdsModal = () => setPostAdsModalOpen(false);


  // ✅ Redirect if not authenticated
  if (!isAuthenticated && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  // ✅ Fetch only current user's ads
  const { data, isLoading, isError, refetch } = useGetMyAdvertisementsQuery({
    page: 1,
    limit: 100, // Increased to show more ads
  });
  

  const [deleteAd, { isLoading: isDeleting }] = useDeleteAdvertisementMutation();
  const [selectedAd, setSelectedAd] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Helper for status color
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

  // ✅ Handle ad delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this ad?")) {
      try {
        await deleteAd(id).unwrap();
        alert("Advertisement deleted successfully!");
        refetch();
        setSelectedAd(null);
      } catch (error) {
        console.error("Failed to delete ad:", error);
        alert(error?.data?.message || "Failed to delete advertisement.");
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

  // ✅ Adjust data mapping for your backend structure
  const ads = data?.data || [];

  // ✅ Simple search filter (client-side)
  const filteredAds = ads.filter((ad) =>
    ad.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              My Advertisements
            </h1>
            <p className="text-gray-600 mt-1">
              Total: {ads.length} advertisement{ads.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button 
            onClick={openPostAdsModal}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            <PlusCircle className="mr-2" />
            Create New Ad
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="flex space-x-4">
            <button className="flex items-center bg-white border rounded-lg px-4 py-2 hover:bg-gray-100">
              <Filter className="mr-2" size={18} />
              Filters
            </button>
            <select className="bg-white border rounded-lg px-4 py-2">
              <option>All Status</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Sold</option>
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search ads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
        </div>

        {/* Ads Grid - FIXED */}
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
                      className="bg-white/70 p-2 rounded-full hover:bg-white/90"
                    >
                      <MoreVertical className="text-gray-700" size={20} />
                    </button>
                  </div>
                  {/* Type Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {ad.typeofads || 'Advertisement'}
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
              <p className="text-xl font-semibold mb-2">No advertisements found</p>
              <p className="text-gray-400 mb-4">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Start by creating your first advertisement"}
              </p>
              {!searchTerm && (
                <button
                  onClick={openPostAdsModal}
                  className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Create Your First Ad
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 max-w-[90%]">
              <h3 className="text-xl font-bold mb-4 line-clamp-2">{selectedAd.title}</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    // Navigate to edit page
                    window.location.href = `/edit-ad/${selectedAd._id}`;
                  }}
                  className="w-full flex items-center justify-center py-3 hover:bg-gray-100 rounded transition"
                >
                  <Edit className="mr-2" size={18} /> Edit Ad
                </button>
                <button
                  onClick={() => handleDelete(selectedAd._id)}
                  disabled={isDeleting}
                  className="w-full flex items-center justify-center py-3 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="mr-2" size={18} /> 
                  {isDeleting ? 'Deleting...' : 'Delete Ad'}
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