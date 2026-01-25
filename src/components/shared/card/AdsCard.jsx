import React from "react";
import { Link, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { Heart, ShoppingCart } from "lucide-react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import getDisplayImage from "../../../functions/getDisplayImage";

const AdsCard = ({ 
  layout, 
  title, 
  description, 
  image, 
  id, 
  category, 
  childCategory,
  onAddToCart,
  isAddingToCart,
  isInCart
}) => {
  const navigate = useNavigate();
  
  // ✅ Check if user is logged in - ONLY for cart functionality
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  const safeToString = (val) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") {
      if (val.name) return val.name;
      return JSON.stringify(val);
    }
    return String(val);
  };

  const titleText = safeToString(title).toLowerCase();
  const desc = safeToString(description).toLowerCase();

  // ✅ Get image using helper (ID-aware)
  const finalImage = getDisplayImage({ image, category, childCategory, titleText, desc });

  // ✅ Responsive layout classes
  const cardClass =
    layout === "grid"
      ? "relative flex flex-col bg-white border border-gray-200 rounded-lg shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 h-full transition-shadow duration-200"
      : "relative flex flex-col sm:flex-row bg-white border border-gray-200 rounded-lg shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 h-full transition-shadow duration-200";

  const imgClass =
    layout === "grid"
      ? "object-cover w-full h-48 rounded-t-lg"
      : "object-cover w-full sm:w-48 h-48 sm:h-full rounded-t-lg sm:rounded-none sm:rounded-l-lg";

  const cleanHTML = DOMPurify.sanitize(description);
  const shortDescription =
    cleanHTML.length > 100 ? cleanHTML.slice(0, 100) + "..." : cleanHTML;

  // ✅ Handle favorite/heart click with proper event stopping
  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation(); // 🔥 Prevent card navigation
    
    // TODO: Implement favorites feature
    console.log('Favorite clicked for ad:', id);
    
    // Optional: Show login prompt if not authenticated
    if (!isAuthenticated) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to add items to your favorites',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3B82F6',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Login Now',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/auth');
        }
      });
    }
  };

  // ✅ Handle cart click with proper event stopping
  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation(); // 🔥 CRITICAL: Prevent card navigation
    
    if (!isAuthenticated) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to add items to your cart',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3B82F6',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Login Now',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/auth');
        }
      });
      return;
    }

    if (onAddToCart) {
      onAddToCart();
    }
  };

  return (
    // 🔥 FIX: Wrap ENTIRE card with Link - makes everything clickable
    <Link 
      to={`/AdDetailPage/${id}`} 
      className="block h-full"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div className={cardClass}>
        {/* 🖼️ Image Section */}
        <div className="relative">
          <img className={imgClass} src={finalImage} alt={title} />
          
          {/* ✅ Heart icon - ALWAYS visible, stops propagation */}
          <button 
            onClick={handleFavoriteClick}
            className="absolute top-2 left-2 bg-white bg-opacity-90 text-gray-700 rounded-full p-2 hover:text-red-500 hover:bg-white transition-all shadow-sm z-10"
            title="Add to favorites"
            aria-label="Add to favorites"
          >
            <Heart size={18} />
          </button>

          {/* ✅ SHOPPING CART icon - ONLY visible when logged in, stops propagation */}
          {isAuthenticated && (
            <button
              onClick={handleCartClick}
              disabled={isAddingToCart || isInCart}
              className={`absolute top-2 right-2 rounded-full p-2 transition-all shadow-sm z-10 ${
                isInCart
                  ? "bg-green-500 text-white cursor-default"
                  : isAddingToCart
                  ? "bg-gray-300 text-gray-500 cursor-wait"
                  : "bg-white bg-opacity-90 text-gray-700 hover:bg-blue-500 hover:text-white"
              }`}
              title={isInCart ? "In cart" : "Add to cart"}
              aria-label={isInCart ? "In cart" : "Add to cart"}
            >
              {isAddingToCart ? (
                <div className="animate-spin">
                  <ShoppingCart size={18} />
                </div>
              ) : isInCart ? (
                <ShoppingCart size={18} className="fill-current" />
              ) : (
                <ShoppingCart size={18} />
              )}
            </button>
          )}
        </div>

        {/* 📄 Content Section */}
        <div className="p-5 flex flex-col flex-grow justify-between leading-normal">
          <div>
            {/* ✅ Title - clickable as part of card */}
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white min-h-[56px]">
              {title.length > 52 ? title.slice(0, 52) + "..." : title}
            </h5>

            {/* ✅ Description - clickable as part of card */}
            <div
              className="mb-3 font-normal text-gray-700 dark:text-gray-400 line-clamp-3 min-h-[60px]"
              dangerouslySetInnerHTML={{ __html: shortDescription }}
            />
          </div>

          {/* 📎 Buttons Section */}
          <div className="mt-auto pt-2 flex gap-2">
            {/* ✅ Read More indicator - not a separate button since whole card is clickable */}
            <div className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg pointer-events-none">
              Read more
              <svg
                className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </div>

            {/* ✅ SHOPPING CART button - ONLY visible when logged in, stops propagation */}
            {isAuthenticated && (
              <button
                onClick={handleCartClick}
                disabled={isAddingToCart || isInCart}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all z-10 ${
                  isInCart
                    ? "bg-green-100 text-green-700 cursor-default"
                    : isAddingToCart
                    ? "bg-gray-200 text-gray-500 cursor-wait"
                    : "bg-white text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white"
                }`}
                title={isInCart ? "In cart" : "Add to cart"}
                aria-label={isInCart ? "In cart" : "Add to cart"}
              >
                {isAddingToCart ? (
                  <div className="animate-spin inline-block">
                    <ShoppingCart size={16} />
                  </div>
                ) : isInCart ? (
                  "✓ In Cart"
                ) : (
                  <ShoppingCart size={16} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AdsCard;