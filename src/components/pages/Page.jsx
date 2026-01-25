import React, { useState, useMemo } from 'react';
import { PlusCircle, Search, Users, Grid, List, Filter, Star, Eye, Crown, MapPin, X, Award, Sparkles, Edit3, Trash2, Heart } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useGetAllPagesQuery, useDeletePageMutation } from '../../features/pageApiSlice';
import { useGetUserFollowedPagesQuery} from '../../features/page.flowwingSlice';
import Swal from 'sweetalert2';

const Pages = () => {
  const navigate = useNavigate();
  
  // Fetch all pages from API
  const { data: pagesData, isLoading, error } = useGetAllPagesQuery();
  const [deletePage, { isLoading: deleting }] = useDeletePageMutation();
  
  // Fetch user's followed pages - the backend will use the JWT cookie to identify the user
  const { data: followedPagesData, isLoading: followedLoading } = useGetUserFollowedPagesQuery(
    { page: 1, limit: 100 }
  );
  
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPageType, setSelectedPageType] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('');
  const [premiumOnly, setPremiumOnly] = useState(false);

  const createNewPage = () => {
    navigate("/pages/create");
  };

  const viewPageDetail = (pageId) => {
    navigate(`/page/${pageId}`)
  };

  // ✅ Delete handler function with SweetAlert2
  const handleDeletePage = async (e, page) => {
    e.stopPropagation();
    
    const result = await Swal.fire({
      title: '<strong>Delete Page?</strong>',
      html: `
        <div class="text-left space-y-3 p-4">
          <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p class="text-sm text-gray-600 mb-1">Page Title:</p>
            <p class="font-bold text-gray-900 text-lg">${page.title}</p>
          </div>
          ${page.category?.name ? `
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">Category:</span>
              <span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">
                ${page.category.name}
              </span>
            </div>
          ` : ''}
          ${page.followersCount ? `
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">Followers:</span>
              <span class="font-semibold text-gray-900">${page.followersCount}</span>
            </div>
          ` : ''}
          <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <p class="text-sm text-red-700 font-semibold flex items-center gap-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              Warning: This action cannot be undone!
            </p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<i class="fas fa-trash-alt"></i> Yes, Delete',
      cancelButtonText: '<i class="fas fa-times"></i> Cancel',
      reverseButtons: true,
      focusCancel: true,
      width: '500px',
      padding: '2em',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-2xl font-black text-gray-900',
        htmlContainer: 'text-left',
        confirmButton: 'font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all',
        cancelButton: 'font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all'
      },
      buttonsStyling: true
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Deleting Page...',
        html: '<div class="flex flex-col items-center gap-3"><div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div><p class="text-gray-600">Please wait...</p></div>',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-2xl'
        }
      });

      try {
        await deletePage(page._id).unwrap();
        
        Swal.fire({
          title: '<strong>Deleted!</strong>',
          html: `
            <div class="text-center">
              <div class="mb-3">
                <svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p class="text-gray-700 font-medium">Your page has been deleted successfully.</p>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'OK',
          timer: 2500,
          timerProgressBar: true,
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'font-bold px-6 py-3 rounded-xl'
          }
        });
      } catch (error) {
        console.error('Delete error:', error);
        
        Swal.fire({
          title: '<strong>Error!</strong>',
          html: `
            <div class="text-center">
              <div class="mb-3">
                <svg class="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p class="text-gray-700 font-medium">${error.data?.message || error.message || 'Failed to delete page.'}</p>
              <p class="text-sm text-gray-500 mt-2">Please try again later.</p>
            </div>
          `,
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'font-bold px-6 py-3 rounded-xl'
          }
        });
      }
    }
  };

  // Process pages data
  const allPages = useMemo(() => {
    if (!pagesData?.data) return [];
    return pagesData.data;
  }, [pagesData]);

  // Get followed page IDs as a Set for quick lookup
  const followedPageIds = useMemo(() => {
    if (!followedPagesData?.pages) return new Set();
    return new Set(followedPagesData.pages.map(page => page._id));
  }, [followedPagesData]);

  // Get current user's pages (backend should include isOwner flag or similar)
  const myPages = useMemo(() => {
    return allPages.filter(page => page.isOwner === true);
  }, [allPages]);

  // Get unique categories for filtering
  const categories = useMemo(() => {
    const cats = new Set();
    allPages.forEach(page => {
      if (page.category?.name) cats.add(page.category.name);
    });
    return Array.from(cats);
  }, [allPages]);

  // Get unique page types for filtering
  const pageTypes = useMemo(() => {
    const types = new Set();
    allPages.forEach(page => {
      if (page.pagetype?.name) types.add(page.pagetype.name);
    });
    return Array.from(types);
  }, [allPages]);

  // Filter and sort pages
  const filteredPages = useMemo(() => {
    let pages = [...allPages];

    // Tab filtering
    if (activeTab === 'following') {
      // Filter to only show pages that user is following
      pages = pages.filter(page => followedPageIds.has(page._id));
    } else if (activeTab === 'my') {
      // Show only pages owned by the current user
      pages = myPages;
    }

    // Search filtering
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      pages = pages.filter(page => 
        page.title?.toLowerCase().includes(search) ||
        page.description?.toLowerCase().includes(search) ||
        page.category?.name?.toLowerCase().includes(search)
      );
    }

    // Category filtering
    if (selectedCategory) {
      pages = pages.filter(page => page.category?.name === selectedCategory);
    }

    // Page type filtering
    if (selectedPageType) {
      pages = pages.filter(page => page.pagetype?.name === selectedPageType);
    }

    // Rating filtering
    if (minRating > 0) {
      pages = pages.filter(page => (page.averageRating || 0) >= minRating);
    }

    // Premium filtering
    if (premiumOnly) {
      pages = pages.filter(page => 
        page.pagetype?.name === 'Premium Page' || 
        page.pagetype?.name === 'VIP Page'
      );
    }

    // Sorting
    if (sortBy === 'views') {
      pages.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === 'rating') {
      pages.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortBy === 'followers') {
      pages.sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0));
    } else if (sortBy === 'recent') {
      pages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return pages;
  }, [allPages, activeTab, searchTerm, selectedCategory, selectedPageType, minRating, sortBy, premiumOnly, myPages, followedPageIds]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedPageType('');
    setMinRating(0);
    setSortBy('');
    setPremiumOnly(false);
    setSearchTerm('');
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedPageType,
    minRating > 0,
    sortBy,
    premiumOnly,
    searchTerm
  ].filter(Boolean).length;

  // Get page type badge color
  const getPageTypeBadge = (pageType) => {
    const badges = {
      'Basic Page': { color: 'bg-gray-100 text-gray-700', icon: Award },
      'Standard Page': { color: 'bg-blue-100 text-blue-700', icon: Award },
      'Premium Page': { color: 'bg-purple-100 text-purple-700', icon: Crown },
      'VIP Page': { color: 'bg-yellow-100 text-yellow-700', icon: Sparkles }
    };
    return badges[pageType?.name] || badges['Basic Page'];
  };

  // Get location display
  const getLocationDisplay = (location) => {
    if (!location) return null;
    const parts = [
      location.townName,
      location.districtName,
      location.countryName
    ].filter(Boolean);
    return parts.slice(0, 2).join(', ');
  };

  // Loading state
  if (isLoading || (activeTab === 'following' && followedLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading pages...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-gray-900 font-semibold mb-2">Failed to load pages</p>
              <p className="text-gray-600 text-sm">{error.message || 'Please try again later'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get count for each tab
  const myPagesCount = myPages.length;
  const followingCount = followedPageIds.size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
              Discover Pages
            </h1>
            <p className="text-gray-600 font-medium">
              Browse and manage your pages
            </p>
          </div>
          <button 
            className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold"
            onClick={createNewPage}
          >
            <PlusCircle className="mr-2" size={20} />
            Create New Page
          </button>
        </div>

        {/* Tabs and Controls */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === 'all' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Pages
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'all' ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {allPages.length}
                </span>
              </button>
              
              <button 
                onClick={() => setActiveTab('following')}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center ${
                  activeTab === 'following' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className="w-4 h-4 mr-2" />
                Following
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'following' ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {followingCount}
                </span>
              </button>
             
              <button 
                onClick={() => setActiveTab('my')}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === 'my' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                My Pages
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'my' ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {myPagesCount}
                </span>
              </button>
            </div>

            {/* Search and View Mode */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-grow lg:flex-grow-0">
                <input 
                  type="text" 
                  placeholder="Search pages..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl w-full lg:w-64 focus:border-blue-500 focus:outline-none font-medium"
                />
                <Search className="absolute left-3.5 top-3 text-gray-400" size={20} />
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2.5 bg-gray-100 border-2 border-gray-200 rounded-xl hover:bg-gray-200 font-semibold transition-all relative"
              >
                <Filter className="mr-2" size={20} />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-xl transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-xl transition-all ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Filters</h3>
              <button 
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Category
                </label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Page Type Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Page Type
                </label>
                <select 
                  value={selectedPageType}
                  onChange={(e) => setSelectedPageType(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                >
                  <option value="">All Types</option>
                  {pageTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Sort By Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Sort By
                </label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                >
                  <option value="">Default</option>
                  <option value="recent">Most Recent</option>
                  <option value="views">Most Viewed</option>
                  <option value="rating">Highest Rating</option>
                  <option value="followers">Most Followers</option>
                </select>
              </div>

              {/* Minimum Rating Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Minimum Rating: {minRating} ★
                </label>
                <input 
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            {/* Premium Filter */}
            <div className="flex items-center pt-4">
              <input 
                type="checkbox"
                id="premiumOnly"
                checked={premiumOnly}
                onChange={(e) => setPremiumOnly(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="premiumOnly" className="ml-3 text-sm font-bold text-gray-700 flex items-center cursor-pointer">
                <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                Premium Pages Only
              </label>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-600">
            Showing <span className="text-gray-900">{filteredPages.length}</span> page{filteredPages.length !== 1 ? 's' : ''}
          </p>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Pages Grid/List */}
        {filteredPages.length > 0 ? (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          }`}>
            {filteredPages.map((page) => {
              const badge = getPageTypeBadge(page.pagetype);
              const BadgeIcon = badge.icon;
              const isPremium = page.pagetype?.name === 'Premium Page' || page.pagetype?.name === 'VIP Page';
              const isMyPage = page.isOwner === true;
              
              return (
                <div 
                  key={page._id}
                  onClick={() => viewPageDetail(page._id)}
                  className={`bg-white rounded-2xl shadow-md hover:shadow-2xl overflow-hidden 
                    transform transition-all duration-300 hover:-translate-y-1 cursor-pointer 
                    border-2 border-transparent hover:border-blue-300 relative
                    ${viewMode === 'list' ? 'flex items-stretch' : ''}`}
                >
                  {/* Page Image */}
                  <div className={`relative group ${viewMode === 'grid' ? '' : 'w-80 flex-shrink-0'}`}>
                    <div
                      className={`
                        relative overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100
                        ${viewMode === 'grid' ? 'h-[220px]' : 'h-[180px] w-[320px]'}
                      `}
                    >
                      {page.cover_image ? (
                        <img 
                          src={page.cover_image} 
                          alt={page.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Grid className="w-16 h-16 text-blue-300" />
                        </div>
                      )}
                    </div>
                    
                    {/* Edit/Delete Buttons Overlay for My Pages */}
                    {isMyPage && (
                      <>
                        {/* My Page Badge */}
                        <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-black flex items-center shadow-lg z-10">
                          <Award className="w-3 h-3 mr-1" />
                          MY PAGE
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="absolute top-3 right-3 flex gap-2 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/pages/${page._id}/edit`);
                            }}
                            className="bg-blue-600 text-white p-2.5 rounded-lg shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110"
                            title="Edit Page"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          {/* ✅ Updated Delete Button with SweetAlert2 */}
                          <button
                            onClick={(e) => handleDeletePage(e, page)}
                            disabled={deleting}
                            className="bg-red-600 text-white p-2.5 rounded-lg shadow-lg hover:bg-red-700 transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Page"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                    
                    {/* Premium Badge */}
                    {isPremium && !isMyPage && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1.5 rounded-full text-xs font-black flex items-center shadow-lg z-10">
                        <Crown className="w-4 h-4 mr-1" />
                        Premium
                      </div>
                    )}

                    {/* Following Badge */}
                    {!isMyPage && followedPageIds.has(page._id) && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-black flex items-center shadow-lg z-10">
                        <Heart className="w-3 h-3 mr-1 fill-current" />
                        Following
                      </div>
                    )}

                    {/* Logo overlay */}
                    {page.logo_image && viewMode === 'grid' && (
                      <div className="absolute -bottom-8 left-6">
                        <div className="w-16 h-16 rounded-full border-4 border-white bg-white overflow-hidden shadow-xl">
                          <img 
                            src={page.logo_image} 
                            alt={page.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Page Details */}
                  <div className={`p-6 ${viewMode === 'list' ? 'flex-grow flex flex-col justify-between' : 'pt-10'}`}>
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-grow">
                          <h2 className={`font-black text-gray-900 mb-2 ${viewMode === 'list' ? 'text-2xl' : 'text-xl'} line-clamp-1`}>
                            {page.title}
                          </h2>
                          
                          {/* Page Type Badge */}
                          <span className={`inline-flex items-center ${badge.color} text-xs px-3 py-1 rounded-full font-bold`}>
                            <BadgeIcon className="w-3 h-3 mr-1" />
                            {page.pagetype?.name || 'Basic'}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      {page.description && (
                        <p className={`text-gray-600 text-sm mb-4 font-medium ${viewMode === 'list' ? 'line-clamp-3' : 'line-clamp-2'}`}>
                          {page.description}
                        </p>
                      )}
                      
                      {/* Stats Row */}
                      <div className="flex items-center gap-4 text-gray-600 text-sm mb-4 font-semibold">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-blue-500" />
                          <span>{page.followersCount || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1 text-purple-500" />
                          <span>{page.views || 0}</span>
                        </div>
                        <div className="flex items-center text-yellow-600">
                          <Star className="w-4 h-4 mr-1 fill-current" />
                          <span>{(page.averageRating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Category & Location */}
                    <div className="flex flex-wrap gap-2">
                      {page.category?.name && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-bold">
                          {page.category.name}
                        </span>
                      )}
                      {page.childCategory?.name && (
                        <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-bold">
                          {page.childCategory.name}
                        </span>
                      )}
                      {getLocationDisplay(page.location) && (
                        <span className="flex items-center bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-bold">
                          <MapPin className="w-3 h-3 mr-1" />
                          {getLocationDisplay(page.location)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {activeTab === 'following' ? (
                <Heart className="w-10 h-10 text-gray-400" />
              ) : (
                <Search className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <p className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === 'following' ? 'No followed pages yet' : 'No pages found'}
            </p>
            <p className="text-gray-600 mb-6 font-medium">
              {activeTab === 'following' 
                ? 'Start following pages to see them here' 
                : 'Try adjusting your filters or search term'}
            </p>
            {activeFiltersCount > 0 && (
              <button 
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pages;