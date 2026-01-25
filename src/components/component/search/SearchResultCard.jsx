// src/components/search/SearchResultCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Eye, Tag, Calendar, User } from 'lucide-react';

const SearchResultCard = ({ result, viewMode = 'grid' }) => {
  const navigate = useNavigate();

  // ✅ Determine the correct detail page route based on result type
  const getDetailRoute = () => {
    const type = result.resultType || result.typeofads;
    
    switch (type) {
      case 'page':
        return `/page/${result._id}`;
      case 'advertisement':
      case 'Advertisement':
        return `/AdDetailPage/${result._id}`;
      case 'needs':
      case 'Needs':
        return `/AdDetailPage/${result._id}`;
      case 'offers':
      case 'Offers':
        return `/AdDetailPage/${result._id}`;
      default:
        return `/AdDetailPage/${result._id}`;
    }
  };

  const handleClick = () => {
    navigate(getDetailRoute());
  };

  // Get display image
  const getImage = () => {
    if (result.logo_image) return result.logo_image; // For pages
    if (result.images && result.images.length > 0) return result.images[0];
    if (result.image) return result.image;
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  // Get location display
  const getLocation = () => {
    if (result.location?.country?.name) {
      return `${result.location.district?.name || ''}, ${result.location.country.name}`.replace(/, ,/g, '');
    }
    return 'Location not specified';
  };

  // Get type badge
  const getTypeBadge = () => {
    const type = result.resultType || result.typeofads;
    const badges = {
      'advertisement': { label: 'Ad', color: 'bg-blue-100 text-blue-800' },
      'Advertisement': { label: 'Ad', color: 'bg-blue-100 text-blue-800' },
      'needs': { label: 'Need', color: 'bg-orange-100 text-orange-800' },
      'Needs': { label: 'Need', color: 'bg-orange-100 text-orange-800' },
      'offers': { label: 'Offer', color: 'bg-green-100 text-green-800' },
      'Offers': { label: 'Offer', color: 'bg-green-100 text-green-800' },
      'page': { label: 'Page', color: 'bg-purple-100 text-purple-800' },
    };
    
    return badges[type] || { label: 'Item', color: 'bg-gray-100 text-gray-800' };
  };

  const badge = getTypeBadge();

  if (viewMode === 'list') {
    return (
      <div 
        onClick={handleClick}
        className="bg-white rounded-lg shadow hover:shadow-xl transition-all cursor-pointer border border-gray-200 hover:border-primary p-4 flex gap-4"
      >
        {/* Image */}
        <img 
          src={getImage()}
          alt={result.title || result.pagename}
          className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
          onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1">
              {result.title || result.pagename}
            </h3>
            <span className={`ml-2 px-3 py-1 ${badge.color} text-xs font-semibold rounded-full whitespace-nowrap`}>
              {badge.label}
            </span>
          </div>

          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {result.description}
          </p>

          <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500">
            {result.price && (
              <span className="text-primary font-bold text-lg">
                ${result.price.toLocaleString()}
              </span>
            )}

            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {getLocation()}
            </span>

            {result.category?.name && (
              <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                {result.category.name}
              </span>
            )}

            {result.views && (
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {result.views} views
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg shadow hover:shadow-xl transition-all cursor-pointer border border-gray-200 hover:border-primary overflow-hidden group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={getImage()}
          alt={result.title || result.pagename}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'}
        />
        
        {/* Type Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 ${badge.color} text-xs font-semibold rounded-full shadow-md`}>
            {badge.label}
          </span>
        </div>

        {/* Relevance Score (Debug) */}
        {result.relevanceScore !== undefined && process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-black/70 text-white text-xs font-semibold rounded-full">
              {(result.relevanceScore * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2 min-h-[3.5rem]">
          {result.title || result.pagename}
        </h3>

        <p className="text-gray-600 text-sm line-clamp-2 mb-3 min-h-[2.5rem]">
          {result.description}
        </p>

        {/* Price */}
        {result.price && (
          <div className="mb-3">
            <span className="text-primary font-bold text-xl">
              ${result.price.toLocaleString()}
            </span>
          </div>
        )}

        {/* Meta Info */}
        <div className="space-y-2 text-sm text-gray-500">
          {getLocation() && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{getLocation()}</span>
            </div>
          )}

          {result.category?.name && (
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{result.category.name}</span>
            </div>
          )}

          {result.views && (
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4 flex-shrink-0" />
              <span>{result.views} views</span>
            </div>
          )}

          {result.followersCount && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4 flex-shrink-0" />
              <span>{result.followersCount} followers</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultCard;