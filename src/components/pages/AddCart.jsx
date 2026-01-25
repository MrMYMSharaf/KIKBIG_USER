import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingCart,
  Trash2,
  Heart,
  MapPin,
  Calendar,
  Eye,
  X,
  ShoppingBag,
  Gift,
  AlertCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import {
  useGetMyCartQuery,
  useRemoveFromCartMutation,
  useClearCartMutation,
} from '../../features/AddTocartSlice';
import { 
  removeItemFromCart, 
  clearCartItems, 
  syncCartFromAPI 
} from '../../features/redux/addTocardredux';

const AddCart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Get cart from Redux (local state)
  const reduxCartItems = useSelector((state) => state.cart.items);

  // Fetch cart data from API
  const { data: cartData, isLoading, isError, refetch } = useGetMyCartQuery();
  const [removeFromCart, { isLoading: isRemoving }] = useRemoveFromCartMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();

  // ✅ Sync Redux cart with API cart on mount
  useEffect(() => {
    if (cartData?.data) {
      const apiCartItems = cartData.data.map(item => ({
        post_id: item.post_id?._id,
        title: item.post_id?.title,
        image: item.post_id?.images?.[0] || '',
        price: item.post_id?.price,
        typeofads: item.post_id?.typeofads,
        addedAt: item.createdAt,
        _id: item._id, // Keep the cart item ID for removal
      }));
      dispatch(syncCartFromAPI(apiCartItems));
    }
  }, [cartData, dispatch]);

  // Helper to get type badge color
  const getTypeBadgeColor = (type) => {
    const normalized = type?.toString().toLowerCase() || '';
    switch (normalized) {
      case 'advertisement':
        return 'bg-blue-500';
      case 'need':
      case 'needs':
        return 'bg-purple-500';
      case 'offer':
      case 'offers':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Helper for type icon
  const getTypeIcon = (type) => {
    const normalized = type?.toString().toLowerCase() || '';
    switch (normalized) {
      case 'advertisement':
        return <ShoppingBag size={14} />;
      case 'need':
      case 'needs':
        return <Heart size={14} />;
      case 'offer':
      case 'offers':
        return <Gift size={14} />;
      default:
        return <ShoppingBag size={14} />;
    }
  };

  // ✅ Handle remove single item (Redux + API)
  const handleRemoveItem = async (cartItemId, postId, postTitle) => {
    const result = await Swal.fire({
      title: 'Remove from Cart?',
      html: `Remove <strong>${postTitle}</strong> from your cart?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, remove it',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        // ✅ Remove from Redux immediately (optimistic update)
        dispatch(removeItemFromCart(postId));
        
        // ✅ Show instant feedback
        const toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });

        toast.fire({
          icon: 'success',
          title: 'Removed from cart!',
        });
        
        // ✅ Remove from API in background
        removeFromCart(cartItemId)
          .unwrap()
          .then(() => {
            console.log('✅ Removed from backend:', postTitle);
            refetch(); // Sync with backend
          })
          .catch((error) => {
            console.error('❌ Failed to remove from backend:', error);
            
            Swal.fire({
              title: 'Sync Error',
              text: 'Item removed locally but failed to sync with server.',
              icon: 'warning',
              confirmButtonColor: '#3B82F6',
            });
          });
        
      } catch (error) {
        console.error('Failed to remove item:', error);
      }
    }
  };

  // ✅ Handle clear entire cart (Redux + API)
  const handleClearCart = async () => {
    const result = await Swal.fire({
      title: 'Clear Entire Cart?',
      text: 'This will remove all items from your cart. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, clear cart',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        // ✅ Clear Redux immediately
        dispatch(clearCartItems());
        
        Swal.fire({
          title: 'Cleared!',
          text: 'Your cart has been cleared successfully.',
          icon: 'success',
          confirmButtonColor: '#3B82F6',
          timer: 2000,
          showConfirmButton: false,
        });
        
        // ✅ Clear API in background
        clearCart()
          .unwrap()
          .then(() => {
            console.log('✅ Cleared from backend');
            refetch();
          })
          .catch((error) => {
            console.error('❌ Failed to clear backend:', error);
          });
        
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }
  };

  // Handle view post details
  const handleViewPost = (postId) => {
    navigate(`/post/${postId}`);
  };

  // Handle contact seller
  const handleContactSeller = (post) => {
    if (post.contact?.phone) {
      window.open(`tel:${post.contact.phone}`);
    } else if (post.contact?.email) {
      window.open(`mailto:${post.contact.email}`);
    } else {
      Swal.fire({
        title: 'No Contact Info',
        text: 'No contact information available for this seller.',
        icon: 'info',
        confirmButtonColor: '#3B82F6',
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">Failed to load cart</p>
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

  // ✅ Use API cart data (with full post details) for display
  const cartItems = cartData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <ShoppingCart size={32} />
              My Cart
            </h1>
            <p className="text-gray-600 mt-1">
              {reduxCartItems.length} item{reduxCartItems.length !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          
          {reduxCartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              disabled={isClearing}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:bg-red-300 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} />
              {isClearing ? 'Clearing...' : 'Clear Cart'}
            </button>
          )}
        </div>

        {/* Cart Items */}
        {cartItems.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const post = item.post_id;
                
                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Image */}
                      <div className="relative sm:w-48 h-48 flex-shrink-0">
                        <img
                          src={post?.images?.[0] || 'https://via.placeholder.com/300x200'}
                          alt={post?.title}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => handleViewPost(post?._id)}
                        />
                        
                        {/* Type Badge */}
                        <div className="absolute top-3 left-3">
                          <span
                            className={`${getTypeBadgeColor(
                              post?.typeofads
                            )} text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}
                          >
                            {getTypeIcon(post?.typeofads)}
                            {post?.typeofads || 'Ad'}
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3
                            className="text-lg font-bold text-gray-800 line-clamp-2 cursor-pointer hover:text-blue-600 transition"
                            onClick={() => handleViewPost(post?._id)}
                          >
                            {post?.title}
                          </h3>
                          
                          <button
                            onClick={() => handleRemoveItem(item._id, post?._id, post?.title)}
                            disabled={isRemoving}
                            className="text-red-500 hover:text-red-700 transition ml-2 disabled:opacity-50"
                            title="Remove from cart"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {post?.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                          {post?.location?.country?.name && (
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {post.location.country.name}
                            </span>
                          )}
                          
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(post?.createdAt).toLocaleDateString()}
                          </span>
                          
                          <span className="flex items-center gap-1">
                            <Eye size={14} />
                            {post?.views || 0} views
                          </span>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <span className="text-2xl font-bold text-blue-600">
                            {post?.price ? `Rs. ${post.price.toLocaleString()}` : 'N/A'}
                          </span>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewPost(post?._id)}
                              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
                            >
                              View Details
                            </button>
                            
                            {post?.contact && (
                              <button
                                onClick={() => handleContactSeller(post)}
                                className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition"
                              >
                                Contact
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Added date info */}
                    <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
                      Added to cart: {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                <h2 className="text-xl font-bold mb-4">Cart Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Total Items:</span>
                    <span className="font-semibold">{cartItems.length}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Posts with Price:</span>
                    <span className="font-semibold">
                      {cartItems.filter(item => item.post_id?.price).length}
                    </span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-800">
                      <span>Estimated Total:</span>
                      <span className="text-blue-600">
                        Rs.{' '}
                        {cartItems
                          .reduce((sum, item) => sum + (item.post_id?.price || 0), 0)
                          .toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/')}
                    className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                  >
                    Continue Shopping
                  </button>
                  
                  <button
                    onClick={() => {
                      Swal.fire({
                        title: 'Contact Sellers',
                        text: 'This feature will allow you to contact all sellers at once. Coming soon!',
                        icon: 'info',
                        confirmButtonColor: '#3B82F6',
                      });
                    }}
                    className="w-full py-3 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition font-semibold"
                  >
                    Contact All Sellers
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Items in your cart are saved for quick access. 
                    Contact sellers directly to complete your purchase.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Empty Cart State
          <div className="text-center py-20">
            <div className="text-gray-300 mb-6">
              <ShoppingCart size={120} className="mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-gray-600 mb-6">
              Start adding items to your cart to see them here
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              Browse Posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCart;