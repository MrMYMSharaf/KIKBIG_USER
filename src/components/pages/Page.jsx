import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Users, 
  Grid, 
  List,
  Filter,
  Star,
  Eye,
  Crown
} from 'lucide-react';

const dummyPagesData = [
  {
    id: 1,
    name: 'Tech Innovations',
    followers: 5432,
    category: 'Technology',
    subcategory: 'Software',
    image: 'https://picsum.photos/200/300?1',
    isOwn: true,
    isFollowing: true,
    rating: 4.5,
    views: 12500,
    isSuperMember: true
  },
  {
    id: 2,
    name: 'Foodie Adventures',
    followers: 2345,
    category: 'Food & Dining',
    subcategory: 'Restaurants',
    image: 'https://picsum.photos/200/300?2',
    isOwn: false,
    isFollowing: false,
    rating: 4.2,
    views: 8900,
    isSuperMember: false
  },
  {
    id: 3,
    name: 'Travel Explorers',
    followers: 7890,
    category: 'Travel',
    subcategory: 'Adventure',
    image: 'https://picsum.photos/200/300?3',
    isOwn: false,
    isFollowing: true,
    rating: 4.8,
    views: 15600,
    isSuperMember: true
  },
  {
    id: 4,
    name: 'AI Research Hub',
    followers: 6543,
    category: 'Technology',
    subcategory: 'AI & ML',
    image: 'https://picsum.photos/200/300?4',
    isOwn: false,
    isFollowing: true,
    rating: 4.7,
    views: 11200,
    isSuperMember: true
  },
  {
    id: 5,
    name: 'Home Cooking',
    followers: 3210,
    category: 'Food & Dining',
    subcategory: 'Recipes',
    image: 'https://picsum.photos/200/300?5',
    isOwn: false,
    isFollowing: false,
    rating: 4.0,
    views: 6700,
    isSuperMember: false
  },
  {
    id: 6,
    name: 'Beach Destinations',
    followers: 9876,
    category: 'Travel',
    subcategory: 'Beach',
    image: 'https://picsum.photos/200/300?6',
    isOwn: true,
    isFollowing: true,
    rating: 4.6,
    views: 18900,
    isSuperMember: true
  }
];

const categories = {
  'Technology': ['Software', 'Hardware', 'AI & ML', 'Cybersecurity'],
  'Food & Dining': ['Restaurants', 'Recipes', 'Cafes', 'Street Food'],
  'Travel': ['Adventure', 'Beach', 'Cultural', 'Budget Travel']
};

const Page = () => {
  const [activeTab, setActiveTab] = useState('following');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('');
  const [superMemberOnly, setSuperMemberOnly] = useState(false);

  const filteredPages = dummyPagesData.filter(page => {
    const matchesSearch = page.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTab = true;
    switch (activeTab) {
      case 'following':
        matchesTab = page.isFollowing;
        break;
      case 'my':
        matchesTab = page.isOwn;
        break;
      default:
        matchesTab = true;
    }

    const matchesCategory = !selectedCategory || page.category === selectedCategory;
    const matchesSubcategory = !selectedSubcategory || page.subcategory === selectedSubcategory;
    const matchesRating = page.rating >= minRating;
    const matchesSuperMember = !superMemberOnly || page.isSuperMember;

    return matchesSearch && matchesTab && matchesCategory && matchesSubcategory && matchesRating && matchesSuperMember;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'views':
        return b.views - a.views;
      case 'rating':
        return b.rating - a.rating;
      case 'followers':
        return b.followers - a.followers;
      default:
        return 0;
    }
  });

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setMinRating(0);
    setSortBy('');
    setSuperMemberOnly(false);
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedSubcategory,
    minRating > 0,
    sortBy,
    superMemberOnly
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Pages</h1>
          <button className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
            <PlusCircle className="mr-2" size={20} />
            Create New Page
          </button>
        </div>

        {/* Tabs and View Options */}
        <div className="flex flex-wrap justify-between gap-4 mb-6">
          {/* Tabs */}
          <div className="flex space-x-4">
            <button 
              onClick={() => setActiveTab('following')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'following' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Following Pages
            </button>
            
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Pages
            </button>
           
            <button 
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'my' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              My Pages
            </button>
          </div>

          {/* Search and View Mode */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search pages..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64"
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 relative"
            >
              <Filter className="mr-2" size={20} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <div className="flex space-x-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Grid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button 
                onClick={clearFilters}
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory('');
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {Object.keys(categories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Subcategory Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <select 
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={!selectedCategory}
                >
                  <option value="">All Subcategories</option>
                  {selectedCategory && categories[selectedCategory].map(subcat => (
                    <option key={subcat} value={subcat}>{subcat}</option>
                  ))}
                </select>
              </div>

              {/* Sort By Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Default</option>
                  <option value="views">Most Viewed</option>
                  <option value="rating">Highest Rating</option>
                  <option value="followers">Most Followers</option>
                </select>
              </div>

              {/* Minimum Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating: {minRating} ★
                </label>
                <input 
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Super Member Filter */}
              <div className="flex items-center pt-6">
                <input 
                  type="checkbox"
                  id="superMember"
                  checked={superMemberOnly}
                  onChange={(e) => setSuperMemberOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="superMember" className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                  <Crown className="w-4 h-4 mr-1 text-yellow-500" />
                  Super Members Only
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredPages.length} page{filteredPages.length !== 1 ? 's' : ''}
        </div>

        {/* Pages Grid/List */}
        <div className={`${viewMode === 'grid' ? 'grid md:grid-cols-3 gap-6' : 'space-y-4'}`}>
          {filteredPages.length > 0 ? (
            filteredPages.map((page) => (
              <div 
                key={page.id} 
                className={`bg-white rounded-xl shadow-lg overflow-hidden 
                  transform transition hover:scale-105 hover:shadow-xl cursor-pointer relative
                  ${viewMode === 'list' ? 'flex items-center' : ''}`}
              >
                {/* Super Member Badge */}
                {page.isSuperMember && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center z-10">
                    <Crown className="w-3 h-3 mr-1" />
                    Super
                  </div>
                )}

                {/* Page Image */}
                <div className={viewMode === 'grid' ? '' : 'w-48 flex-shrink-0'}>
                  <img 
                    src={page.image} 
                    alt={page.name} 
                    className={`w-full ${viewMode === 'grid' ? 'h-48' : 'h-full'} object-cover`}
                  />
                </div>

                {/* Page Details */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-grow' : ''}`}>
                  <div>
                    <h2 className="text-xl font-bold mb-2">{page.name}</h2>
                    
                    {/* Stats Row */}
                    <div className="flex items-center space-x-4 text-gray-500 text-sm mb-2">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{page.followers}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{page.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        <span>{page.rating}</span>
                      </div>
                    </div>
                    
                    {/* Category */}
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                        {page.category}
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {page.subcategory}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No pages found</p>
              <button 
                onClick={clearFilters}
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                Clear filters to see more results
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;