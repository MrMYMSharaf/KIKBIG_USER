import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  DollarSign, 
  User, 
  Calendar, 
  MessageCircle, 
  Share2, 
  Heart,
  ArrowRight,
  Eye,
  Tag,
  Globe,
  Phone,
  Mail,
  ArrowLeft,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
import { useGetAdvertisementByIdQuery, useGetAllAdvertisementsQuery } from '../../features/postadsSlice';
import WatermarkedImage from '../component/WatermarkedImage.jsx';
import getDisplayImage from '../../functions/getDisplayImage';
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

const AdDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetAdvertisementByIdQuery(id);
  const { data: similarAdsData } = useGetAllAdvertisementsQuery({ page: 1, limit: 4 });
  
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    if (isError) navigate('/viewallads');
  }, [isError, navigate]);

  // Prevent body scroll when gallery is open
  useEffect(() => {
    if (showGallery) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showGallery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-32"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-96 bg-slate-200 rounded-2xl"></div>
                <div className="h-32 bg-slate-200 rounded-2xl"></div>
              </div>
              <div className="h-96 bg-slate-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Ad Not Found</h2>
          <p className="text-gray-500 mb-6">The advertisement you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/viewallads')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Browse All Ads
          </button>
        </div>
      </div>
    );
  }

  const listing = data.data;
  
  // Determine main display image
  const fallbackImage = getDisplayImage({
    image: listing.images?.[0] || listing.image,
    category: listing.category,
    childCategory: listing.childCategory,
    titleText: listing.title?.toLowerCase() || "",
    desc: listing.description?.toLowerCase() || ""
  });

  // Always ensure array for carousel
  const images = (listing.images?.length > 0 ? listing.images : [fallbackImage]).filter(Boolean);

  // Prepare gallery images for react-image-gallery
  const galleryImages = images.map((img) => ({
    original: img,
    thumbnail: img,
  }));

  const similarAds = similarAdsData?.data?.filter(ad => ad._id !== id)?.slice(0, 4) || [];

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleContactSeller = () => {
    if (listing.userId?.email) {
      window.location.href = `mailto:${listing.userId.email}`;
    } else {
      alert('Contact information not available');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: listing.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLocationString = () => {
    const loc = listing.location;
    if (!loc) return 'Location not specified';
    
    const parts = [
      loc.town?.name,
      loc.district?.name,
      loc.province?.name || loc.state?.name,
      loc.country?.name
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  const openGallery = (index = 0) => {
    setCurrentImageIndex(index);
    setShowGallery(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-xl z-50 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm md:text-base">Link copied!</span>
        </div>
      )}

      {/* Image Gallery Modal - FIXED FOR MOBILE */}
      {showGallery && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex flex-col"
        >
          {/* Close Button Bar - NOW VISIBLE */}
          <div className="absolute top-0 left-0 right-0 z-[110] bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
              <div className="text-white text-sm md:text-base font-medium">
                {currentImageIndex + 1} / {images.length}
              </div>
              <button
                onClick={() => setShowGallery(false)}
                className="bg-white text-black px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center space-x-2 shadow-lg"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>
          </div>

          {/* Image Gallery - MOBILE OPTIMIZED */}
          <div className="flex-1 flex items-center justify-center p-2 md:p-4 pt-20">
            <div className="w-full h-full max-w-7xl">
              <ImageGallery
                items={galleryImages}
                startIndex={currentImageIndex}
                showPlayButton={false}
                showFullscreenButton={true}
                showThumbnails={true}
                thumbnailPosition="bottom"
                showNav={true}
                showBullets={images.length > 1}
                slideDuration={300}
                slideInterval={3000}
                onSlide={(index) => setCurrentImageIndex(index)}
                additionalClass="mobile-gallery"
              />
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <button 
            onClick={() => navigate('/viewallads')}
            className="flex items-center text-slate-600 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm md:text-base">Back to Listings</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8 pb-32">
        <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Image Gallery Card */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden">
              <div className="relative group">
                {/* Main Image */}
                <div 
                  className="relative cursor-pointer"
                  onClick={() => openGallery(currentImageIndex)}
                >
                  <WatermarkedImage
                    src={images[currentImageIndex]} 
                    alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-[250px] sm:h-[350px] md:h-[500px] object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/500x500?text=Image+Not+Found';
                    }}
                  />
                  
                  {/* Click to View Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div className="bg-white/90 px-3 py-2 md:px-4 md:py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs md:text-sm font-semibold">Click to view gallery</p>
                    </div>
                  </div>
                  
                  {/* Image Counter Badge */}
                  <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black/70 backdrop-blur-sm text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 md:p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
                    >
                      <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 md:p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
                    >
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="p-3 md:p-4 bg-slate-50">
                  <div className="flex space-x-2 md:space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300">
                    {images.map((img, index) => (
                      <img 
                        key={index}
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        onClick={() => openGallery(index)}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                        }}
                        className={`
                          w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg cursor-pointer transition-all flex-shrink-0
                          ${index === currentImageIndex 
                            ? 'ring-2 md:ring-4 ring-blue-500 scale-105' 
                            : 'opacity-60 hover:opacity-100 hover:scale-105'}
                        `}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Info Card */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 lg:p-8">
              {/* Header with Title and Actions */}
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="flex-1 pr-2 md:pr-4">
                  <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 md:mb-3 leading-tight">
                    {listing.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="font-medium">{listing.views || 0}</span>
                      <span>views</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 md:w-4 md:h-4" />
                      <span>{formatDate(listing.createdAt)}</span>
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-1 md:space-x-2">
                  <button 
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`
                      p-2 md:p-3 rounded-lg md:rounded-xl transition-all transform hover:scale-110
                      ${isFavorite 
                        ? 'bg-red-100 text-red-600 shadow-lg' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                    `}
                  >
                    <Heart className={`w-5 h-5 md:w-6 md:h-6 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    onClick={handleShare}
                    className="p-2 md:p-3 rounded-lg md:rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all transform hover:scale-110"
                  >
                    <Share2 className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>

              {/* Price Tag */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 md:px-6 md:py-4 rounded-xl mb-4 md:mb-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm opacity-90 mb-1">Price</p>
                    <p className="text-2xl md:text-3xl font-bold">
                      ${listing.price?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 md:w-12 md:h-12 opacity-50" />
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start space-x-2 md:space-x-3 mb-4 md:mb-6 p-3 md:p-4 bg-slate-50 rounded-xl">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs md:text-sm text-slate-500 mb-1">Location</p>
                  <p className="text-sm md:text-base text-slate-900 font-medium">{getLocationString()}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                {listing.category?.name && (
                  <span className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium">
                    <Tag className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    {listing.category.name}
                  </span>
                )}
                {listing.language?.name && (
                  <span className="inline-flex items-center bg-purple-100 text-purple-700 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium">
                    <Globe className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    {listing.language.name}
                  </span>
                )}
                {listing.adType?.name && (
                  <span className="inline-flex items-center bg-amber-100 text-amber-700 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium uppercase">
                    {listing.adType.name}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="border-t border-slate-200 pt-4 md:pt-6 mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">Description</h3>
                <div 
                  className="text-sm md:text-base text-slate-700 leading-relaxed prose prose-sm md:prose-base max-w-none"
                  dangerouslySetInnerHTML={{ __html: listing.description }}
                />
              </div>

              {/* Additional Details */}
              {listing.specialQuestions && Object.keys(listing.specialQuestions).length > 0 && (
                <div className="border-t border-slate-200 pt-4 md:pt-6">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 md:mb-4">Additional Details</h3>
                  <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                    {Object.entries(listing.specialQuestions).map(([key, value]) => (
                      <div key={key} className="bg-slate-50 p-3 md:p-4 rounded-lg">
                        <p className="text-xs md:text-sm text-slate-500 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm md:text-base font-semibold text-slate-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Seller & Contact Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 lg:p-8">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center mr-3 md:mr-4">
                  <User className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold">{listing.userId?.name || "Anonymous"}</h3>
                  <p className="text-blue-100 text-xs md:text-sm flex items-center mt-1">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Member since {formatDate(listing.createdAt)}
                  </p>
                </div>
              </div>

              {/* Contact Methods */}
              {listing.contact && Object.values(listing.contact).some(Boolean) && (
                <div className="space-y-2 md:space-y-3">
                  <h4 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-blue-100">Contact Options</h4>
                  
                  {listing.contact.phone && (
                    <button
                      onClick={() => (window.location.href = `tel:${listing.contact.phone}`)}
                      className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-2.5 md:px-4 md:py-3 rounded-xl transition-all flex items-center justify-between group"
                    >
                      <span className="flex items-center text-sm md:text-base">
                        <Phone className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                        <span className="font-medium">{listing.contact.phone}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                  
                  {listing.contact.whatsapp && (
                    <button
                      onClick={() =>
                        window.open(`https://wa.me/${listing.contact.whatsapp.replace(/\D/g, "")}`, "_blank")
                      }
                      className="w-full bg-green-500 hover:bg-green-600 px-3 py-2.5 md:px-4 md:py-3 rounded-xl transition-all flex items-center justify-between group"
                    >
                      <span className="flex items-center text-sm md:text-base">
                        <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                        <span className="font-medium">Chat on WhatsApp</span>
                      </span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                  
                  {listing.contact.email && (
                    <button
                      onClick={() => (window.location.href = `mailto:${listing.contact.email}`)}
                      className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-2.5 md:px-4 md:py-3 rounded-xl transition-all flex items-center justify-between group"
                    >
                      <span className="flex items-center text-sm md:text-base">
                        <Mail className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                        <span className="font-medium truncate">{listing.contact.email}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                  
                  {listing.contact.telegram && (
                    <button
                      onClick={() =>
                        window.open(`https://t.me/${listing.contact.telegram}`, "_blank")
                      }
                      className="w-full bg-sky-500 hover:bg-sky-600 px-3 py-2.5 md:px-4 md:py-3 rounded-xl transition-all flex items-center justify-between group"
                    >
                      <span className="flex items-center text-sm md:text-base">
                        <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                        <span className="font-medium">@{listing.contact.telegram}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>
              )}

              {/* Primary Contact Button */}
              <button 
                onClick={handleContactSeller}
                className="w-full mt-3 md:mt-4 bg-white text-blue-600 px-4 py-3 md:px-6 md:py-4 rounded-xl hover:shadow-xl transition-all font-bold text-base md:text-lg flex items-center justify-center group"
              >
                <MessageCircle className="mr-2 group-hover:scale-110 transition-transform w-5 h-5 md:w-6 md:h-6" />
                Contact Seller
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            {/* Similar Ads */}
            {similarAds.length > 0 && (
              <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-3 md:mb-4 flex items-center">
                  Similar Listings
                  <ArrowRight className="ml-2 text-blue-500 w-4 h-4 md:w-5 md:h-5" />
                </h2>
                <div className="space-y-2 md:space-y-3">
                  {similarAds.map((ad) => (
                    <div 
                      key={ad._id} 
                      onClick={() => navigate(`/AdDetailPage/${ad._id}`)}
                      className="group flex space-x-2 md:space-x-3 bg-slate-50 hover:bg-blue-50 p-2 md:p-3 rounded-xl transition-all cursor-pointer hover:shadow-md"
                    >
                      <img
                        src={
                          ad.images?.[0] ||
                          getDisplayImage({
                            image: ad.images?.[0],
                            category: ad.category,
                            childCategory: ad.childCategory,
                            titleText: ad.title?.toLowerCase() || "",
                            desc: ad.description?.toLowerCase() || ""
                          })
                        }
                        alt={ad.title}
                        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-xs md:text-sm text-slate-900 line-clamp-2 mb-1">
                          {ad.title}
                        </h3>
                        <p className="text-green-600 font-bold text-base md:text-lg">
                          ${ad.price?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ad Space */}
            <div className="hidden lg:block bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-12 text-center border-2 border-dashed border-slate-300">
              <p className="text-slate-400 font-medium">Advertisement Space</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdDetailPage;