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
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  DollarSign,
  Calendar,
  X,
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
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  const { data: currentUserData, isLoading: authLoading } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  const openPostAdsModal = () => setPostAdsModalOpen(true);
  const closePostAdsModal = () => setPostAdsModalOpen(false);

  if (!isAuthenticated && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  const { data, isLoading, isError, refetch } = useGetMyAdvertisementsQuery(
    {
      page: 1,
      limit: 100,
    },
    {
      skip: !isAuthenticated,
    }
  );

  const [deleteAd, { isLoading: isDeleting }] = useDeleteAdvertisementMutation();

  const normalizeType = (type) => {
    if (!type) return 'advertisement';
    return type.toString().toLowerCase().trim();
  };

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

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("newest");
    setPriceRange({ min: "", max: "" });
    setDateRange({ start: "", end: "" });
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return searchTerm || statusFilter !== "all" || sortBy !== "newest" || 
           priceRange.min || priceRange.max || dateRange.start || dateRange.end;
  };

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

  const ads = data?.data || [];

  // Tab filtering
  const tabFilteredAds = activeTab === "all" 
    ? ads 
    : ads.filter((ad) => {
        const adType = normalizeType(ad.typeofads);
        const filterType = activeTab.toLowerCase();
        
        if (filterType === 'need') {
          return adType === 'need' || adType === 'needs';
        }
        if (filterType === 'offer') {
          return adType === 'offer' || adType === 'offers';
        }
        
        return adType === filterType;
      });

  // Status filtering
  const statusFilteredAds = statusFilter === "all"
    ? tabFilteredAds
    : tabFilteredAds.filter((ad) => ad.status?.toLowerCase() === statusFilter.toLowerCase());

  // Search filtering
  const searchFilteredAds = statusFilteredAds.filter((ad) =>
    ad.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Price range filtering
  const priceFilteredAds = searchFilteredAds.filter((ad) => {
    const price = ad.price || 0;
    const min = priceRange.min ? parseFloat(priceRange.min) : 0;
    const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
    return price >= min && price <= max;
  });

  // Date range filtering
  const dateFilteredAds = priceFilteredAds.filter((ad) => {
    if (!dateRange.start && !dateRange.end) return true;
    const adDate = new Date(ad.createdAt);
    const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0);
    const endDate = dateRange.end ? new Date(dateRange.end) : new Date();
    return adDate >= startDate && adDate <= endDate;
  });

  // Sorting
  const sortedAds = [...dateFilteredAds].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "most-viewed":
        return (b.views || 0) - (a.views || 0);
      case "least-viewed":
        return (a.views || 0) - (b.views || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "title-az":
        return (a.title || "").localeCompare(b.title || "");
      case "title-za":
        return (b.title || "").localeCompare(a.title || "");
      default:
        return 0;
    }
  });

  const filteredAds = sortedAds;

  // Pagination calculations
  const totalItems = filteredAds.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAds = filteredAds.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, statusFilter, searchTerm, sortBy, priceRange, dateRange]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // First page button
    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="dots1" className="px-2 py-2 text-gray-500">
            ...
          </span>
        );
      }
    }

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 rounded-lg border transition ${
            currentPage === i
              ? 'bg-blue-500 text-white border-blue-500'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page button
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="dots2" className="px-2 py-2 text-gray-500">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
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

        {/* Filters & Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            {/* Left side filters */}
            <div className="flex flex-wrap gap-3">
              {/* Sort By */}
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">🕐 Newest First</option>
                <option value="oldest">🕐 Oldest First</option>
                <option value="most-viewed">👁️ Most Viewed</option>
                <option value="least-viewed">👁️ Least Viewed</option>
                <option value="price-high">💰 Price: High to Low</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="title-az">🔤 Title: A to Z</option>
                <option value="title-za">🔤 Title: Z to A</option>
              </select>

              {/* Status Filter */}
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">✅ Active</option>
                <option value="pending">⏳ Pending</option>
                <option value="sold">🚫 Blocked</option>
              </select>

              {/* Items per page */}
              <select 
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="8">8 per page</option>
                <option value="12">12 per page</option>
                <option value="16">16 per page</option>
                <option value="24">24 per page</option>
              </select>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center px-4 py-2 rounded-lg border transition ${
                  showAdvancedFilters 
                    ? 'bg-blue-50 border-blue-500 text-blue-600' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="mr-2" size={18} />
                Advanced
              </button>

              {/* Clear Filters */}
              {hasActiveFilters() && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition"
                >
                  <X className="mr-2" size={18} />
                  Clear Filters
                </button>
              )}
            </div>

            {/* Search */}
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

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline mr-1" size={16} />
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline mr-1" size={16} />
                  Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <div className="mb-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                Search: "{searchTerm}"
                <X 
                  className="ml-2 cursor-pointer" 
                  size={14} 
                  onClick={() => setSearchTerm("")}
                />
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                Status: {statusFilter}
                <X 
                  className="ml-2 cursor-pointer" 
                  size={14} 
                  onClick={() => setStatusFilter("all")}
                />
              </span>
            )}
            {sortBy !== "newest" && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                Sort: {sortBy.replace("-", " ")}
                <X 
                  className="ml-2 cursor-pointer" 
                  size={14} 
                  onClick={() => setSortBy("newest")}
                />
              </span>
            )}
            {(priceRange.min || priceRange.max) && (
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center">
                Price: Rs.{priceRange.min || '0'} - Rs.{priceRange.max || '∞'}
                <X 
                  className="ml-2 cursor-pointer" 
                  size={14} 
                  onClick={() => setPriceRange({ min: "", max: "" })}
                />
              </span>
            )}
            {(dateRange.start || dateRange.end) && (
              <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm flex items-center">
                Date: {dateRange.start || 'Start'} to {dateRange.end || 'End'}
                <X 
                  className="ml-2 cursor-pointer" 
                  size={14} 
                  onClick={() => setDateRange({ start: "", end: "" })}
                />
              </span>
            )}
          </div>
        )}

        {/* Results Info */}
        {filteredAds.length > 0 && (
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} posts
            </div>
            {sortBy === "most-viewed" && (
              <div className="text-sm text-blue-600 flex items-center">
                <TrendingUp size={16} className="mr-1" />
                Sorted by popularity
              </div>
            )}
            {sortBy === "newest" && (
              <div className="text-sm text-green-600 flex items-center">
                <Clock size={16} className="mr-1" />
                Latest posts first
              </div>
            )}
          </div>
        )}

        {/* Ads Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {currentAds.length > 0 ? (
            currentAds.map((ad) => (
              <div
                key={ad._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:scale-105 hover:shadow-xl"
              >
                {/* Ad Image */}
                <div className="relative">
                  <img
                    src={ad.images?.[0] || "https://via.placeholder.com/300x200"}
                    alt={ad.title}
                    className="w-full h-48 object-cover"
                  />

                  {/* More Options Button */}
                  <button
                    onClick={() => setSelectedAd(ad)}
                    className="absolute top-4 left-4 bg-white/70 p-2 rounded-full hover:bg-white/90 transition"
                  >
                    <MoreVertical className="text-gray-700" size={20} />
                  </button>

                  {/* Type Badge */}
                  <div className="absolute bottom-4 left-4">
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
                      className={`px-3 py-1 rounded-full text-xs ${getStatusColor(ad.status)}`}
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
                {hasActiveFilters()
                  ? "No posts found matching your filters" 
                  : activeTab === "all" 
                    ? "No posts yet" 
                    : `No ${activeTab}s yet`}
              </p>
              <p className="text-gray-400 mb-4">
                {hasActiveFilters()
                  ? "Try adjusting your filters or search terms"
                  : "Start by creating your first post"}
              </p>
              {hasActiveFilters() ? (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Clear All Filters
                </button>
              ) : (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8 mb-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex space-x-2">
              {renderPaginationButtons()}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

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