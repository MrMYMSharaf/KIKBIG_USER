// src/components/pages/UnifiedSearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useUnifiedSearchQuery } from '../../features/searchSlice';
import { SlidersHorizontal, Grid, List, Loader, AlertCircle } from 'lucide-react';
import AdvancedSearchFilter from '../component/search/AdvancedSearchFilter';
import SearchResultCard from '../component/search/SearchResultCard';

const UnifiedSearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // ✅ FIX: Get country correctly from your Redux state
  const countrySlug = useSelector((state) => state.country?.country);
  
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');

  const query = searchParams.get('q') || '';

  const [filters, setFilters] = useState({
    query,
    country: countrySlug,
    includeTypes: 'all',
    sortBy: 'relevance',
    page: 1,
    limit: 20,
  });

  // ✅ Update filters when country or query changes
  useEffect(() => {
    console.log('🔍 Search params updated:', { query, countrySlug });
    setFilters(prev => ({ 
      ...prev, 
      query,
      country: countrySlug 
    }));
  }, [query, countrySlug]);

  // ✅ Fetch search results
  const { data, isLoading, error, isFetching } = useUnifiedSearchQuery(filters, {
    skip: !query || !countrySlug,
  });

  // ✅ DEBUG: Log what's happening
  useEffect(() => {
    console.log('📊 Search State:', {
      query,
      countrySlug,
      filters,
      hasData: !!data,
      isLoading,
      error: error?.message
    });
  }, [query, countrySlug, filters, data, isLoading, error]);

  const handleApplyFilters = (newFilters) => {
    console.log('✅ Applying filters:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleTabChange = (tab) => {
    console.log('📑 Tab changed to:', tab);
    setActiveTab(tab);
    
    const typeMap = {
      'all': 'all',
      'ads': 'advertisements',
      'needs': 'needs',
      'offers': 'offers',
      'pages': 'pages',
    };
    
    setFilters(prev => ({ 
      ...prev, 
      includeTypes: typeMap[tab] || 'all',
      page: 1,
    }));
  };

  const handleLoadMore = () => {
    setFilters(prev => ({ ...prev, page: prev.page + 1 }));
  };

  const getDisplayResults = () => {
    if (!data?.data) return [];
    
    switch (activeTab) {
      case 'ads':
        return data.data.advertisements || [];
      case 'needs':
        return data.data.needs || [];
      case 'offers':
        return data.data.offers || [];
      case 'pages':
        return data.data.pages || [];
      case 'all':
      default:
        return data.data.all || [];
    }
  };

  const displayResults = getDisplayResults();

  // ✅ Show country error if missing
  if (!countrySlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Country Not Set</h2>
          <p className="text-gray-600 mb-4">
            Please wait while we detect your location...
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No search query</h2>
          <p className="text-gray-600">Please enter a search term to find results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Search Results for "{query}"
              </h1>
              {data?.counts && (
                <p className="text-sm text-gray-600 mt-1">
                  Found {data.counts.total} results in {countrySlug}
                  {activeTab !== 'all' && ` (${displayResults.length} ${activeTab})`}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="List view"
                >
                  <List size={20} />
                </button>
              </div>

              {/* Filters Button */}
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <SlidersHorizontal size={20} />
                Filters
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { key: 'all', label: 'All', count: data?.counts?.total },
              { key: 'ads', label: 'Advertisements', count: data?.counts?.advertisements },
              { key: 'needs', label: 'Needs', count: data?.counts?.needs },
              { key: 'offers', label: 'Offers', count: data?.counts?.offers },
              { key: 'pages', label: 'Pages', count: data?.counts?.pages },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 text-sm opacity-75">({tab.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Loading State */}
        {(isLoading || isFetching) && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-600">Searching...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Search Failed
            </h3>
            <p className="text-red-700 mb-4">
              {error?.data?.message || 'An error occurred while searching'}
            </p>
            <details className="text-left text-sm text-red-600 bg-red-100 p-3 rounded">
              <summary className="cursor-pointer font-semibold">Error Details</summary>
              <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
            </details>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && displayResults.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600 mb-2">
              We searched for "{query}" but couldn't find any matches.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Search Country: {countrySlug}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowFilters(true)}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adjust Filters
              </button>
              <button
                onClick={() => navigate(`/${countrySlug}`)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Browse All
              </button>
            </div>
          </div>
        )}

        {/* Results Grid/List */}
        {!isLoading && !error && displayResults.length > 0 && (
          <>
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'flex flex-col gap-4'
            }>
              {displayResults.map((result) => (
                <SearchResultCard 
                  key={result._id} 
                  result={result}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Load More */}
            {data?.pagination && data.pagination.page < data.pagination.totalPages && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  className="px-6 py-3 bg-white border-2 border-primary text-primary rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFetching ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}

        {/* DEBUG INFO */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded text-xs">
            <details>
              <summary className="cursor-pointer font-bold mb-2">🐛 Debug Info</summary>
              <pre className="whitespace-pre-wrap">
{JSON.stringify({
  query,
  countrySlug,
  filters,
  resultCounts: data?.counts,
  displayResultsLength: displayResults.length,
  isLoading,
  isFetching,
  hasError: !!error,
  apiResponse: data ? 'Has data' : 'No data'
}, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* Advanced Filters Modal */}
      <AdvancedSearchFilter
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
        countrySlug={countrySlug}
        searchType={activeTab === 'all' ? 'Advertisement' : activeTab}
      />
    </div>
  );
};

export default UnifiedSearchPage;