import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { resetAdPost } from "../../features/redux/adPostSlice";
import { useGetAdvertisementByIdQuery } from "../../features/postadsSlice";

const SuccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { formData, uploadedAdId } = useSelector((state) => state.adPost);
  const [countdown, setCountdown] = useState(10);
  
  // Fetch current advertisement to get real-time status
  const { data: adData, isLoading: adLoading } = useGetAdvertisementByIdQuery(uploadedAdId, {
    skip: !uploadedAdId,
    pollingInterval: 2000, // Poll every 2 seconds
  });
  
  const currentAd = adData?.data;
  
  // 🔥 UPDATED: Since AI verification is disabled, all ads will be "inactive" (pending manual review)
  const adStatus = currentAd?.status || "inactive";
  const isPending = adStatus === "inactive";
  const isPublished = adStatus === "active"; // Will be active after manual approval
  const isBlocked = adStatus === "Ai_Blocked";

  console.log("📊 Success Page Status:", { adStatus, isPending, isPublished, isBlocked });

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown <= 0) {
      handleGoHome();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleGoHome = () => {
    dispatch(resetAdPost());
    navigate("/");
  };

  const handleViewAd = () => {
    if (uploadedAdId) {
      dispatch(resetAdPost());
      navigate(`/ad/${uploadedAdId}`);
    }
  };

  // Show loading state
  if (adLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-semibold">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${
      isPublished ? 'from-green-50 via-blue-50 to-purple-50' : 
      isBlocked ? 'from-red-50 via-orange-50 to-yellow-50' :
      'from-orange-50 via-yellow-50 to-blue-50'
    } flex items-center justify-center p-4`}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full">
        {/* Icon Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className={`absolute inset-0 ${
              isPublished ? 'bg-green-400' : 
              isBlocked ? 'bg-red-400' : 
              'bg-orange-400'
            } rounded-full animate-ping opacity-75`}></div>
            <div className={`relative ${
              isPublished ? 'bg-green-500' : 
              isBlocked ? 'bg-red-500' : 
              'bg-orange-500'
            } text-white rounded-full w-24 h-24 flex items-center justify-center text-5xl animate-bounce`}>
              {isPublished ? '✅' : isBlocked ? '🚫' : '⏳'}
            </div>
          </div>
        </div>

        {/* Message */}
        {isPublished ? (
          <>
            <h1 className="text-4xl font-bold text-center text-gray-900 mb-3">
              🎉 Successfully Published!
            </h1>
            
            <p className="text-center text-gray-600 text-lg mb-6">
              Your <span className="font-bold text-blue-600">{formData.typeofads || "advertisement"}</span> has been approved and is now live!
            </p>
          </>
        ) : isBlocked ? (
          <>
            <h1 className="text-4xl font-bold text-center text-red-600 mb-3">
              🚫 Advertisement Blocked
            </h1>
            
            <p className="text-center text-gray-700 text-lg mb-6">
              Your <span className="font-bold text-blue-600">{formData.typeofads || "advertisement"}</span> did not pass our review.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-center text-orange-600 mb-3">
              ⏳ Submitted for Review
            </h1>
            
            <p className="text-center text-gray-700 text-lg mb-6">
              Your <span className="font-bold text-blue-600">{formData.typeofads || "advertisement"}</span> has been submitted successfully!
            </p>
            
            {/* Manual Review Notice */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="text-5xl">🔍</div>
                <div>
                  <h3 className="font-bold text-orange-900 text-xl mb-2">
                    Manual Review in Progress
                  </h3>
                  <p className="text-orange-800 mb-3">
                    Our team will review your ad to ensure it meets our quality standards.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <p className="font-semibold text-gray-900 mb-2">What happens next?</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 font-bold">1.</span>
                        <span>Our team will review your ad within <strong>24 hours</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 font-bold">2.</span>
                        <span>If approved, your ad will be published automatically</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 font-bold">3.</span>
                        <span>You'll receive an email notification once published</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 font-bold">4.</span>
                        <span>If issues are found, we'll contact you with feedback</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-orange-200 mt-3">
                    <p className="text-sm text-orange-700 italic flex items-start gap-2">
                      <span className="text-xl">💡</span>
                      <span><strong>Note:</strong> We're manually reviewing all ads to ensure the best quality for our users. Thank you for your patience!</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Ad Details Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border-2 border-blue-200">
          <h3 className="font-bold text-gray-900 mb-3 text-lg">📋 Submitted Ad Details</h3>
          <div className="space-y-2 text-sm">
            {formData.title && (
              <div className="flex justify-between items-center py-2 border-b border-blue-200">
                <span className="text-gray-600">Title:</span>
                <span className="font-bold text-gray-900 text-right max-w-xs truncate">{formData.title}</span>
              </div>
            )}
            {formData.category?.name && (
              <div className="flex justify-between items-center py-2 border-b border-blue-200">
                <span className="text-gray-600">Category:</span>
                <span className="font-bold text-gray-900">{formData.category.name}</span>
              </div>
            )}
            {formData.price && (
              <div className="flex justify-between items-center py-2 border-b border-blue-200">
                <span className="text-gray-600">Price:</span>
                <span className="font-bold text-green-600">${formData.price}</span>
              </div>
            )}
            {uploadedAdId && (
              <div className="flex justify-between items-center py-2 border-b border-blue-200">
                <span className="text-gray-600">Ad ID:</span>
                <span className="font-mono text-xs text-gray-500">{uploadedAdId}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Status:</span>
              <span className={`font-bold text-sm px-3 py-1 rounded-full ${
                adStatus === 'active' ? 'bg-green-100 text-green-700' :
                adStatus === 'Ai_Blocked' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {adStatus === 'active' ? 'Active' : adStatus === 'Ai_Blocked' ? 'Blocked' : 'Pending Review'}
              </span>
            </div>
          </div>
        </div>

        {/* What's Next Section */}
        <div className="bg-gray-50 rounded-xl p-5 mb-6">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-xl">🚀</span> What's Next?
          </h4>
          {isPublished ? (
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Your ad is now visible to thousands of potential buyers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>You'll receive notifications when someone contacts you</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Manage your ads from your dashboard anytime</span>
              </li>
            </ul>
          ) : isBlocked ? (
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✗</span>
                <span>Review our community guidelines</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✗</span>
                <span>Submit a new ad with corrected content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✗</span>
                <span>Contact support if you believe this was an error</span>
              </li>
            </ul>
          ) : (
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">⏳</span>
                <span>Check your email for review status updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">⏳</span>
                <span>Review typically takes 24 hours or less</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">⏳</span>
                <span>View your pending ads in your dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">⏳</span>
                <span>We'll publish it automatically once approved</span>
              </li>
            </ul>
          )}
        </div>

        {/* Auto-redirect notice */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center gap-2 ${
            isPublished ? 'bg-blue-100 border-blue-300' : 
            isBlocked ? 'bg-red-100 border-red-300' :
            'bg-orange-100 border-orange-300'
          } border rounded-full px-4 py-2 animate-pulse`}>
            <span className={`${
              isPublished ? 'text-blue-700' : 
              isBlocked ? 'text-red-700' :
              'text-orange-700'
            } text-sm font-semibold`}>
              Redirecting to homepage in {countdown}s
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {isPending && (
            <button
              onClick={() => navigate("/my-ads")}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-xl hover:from-orange-700 hover:to-yellow-700 transition-all duration-200 shadow-lg hover:shadow-xl font-bold flex items-center justify-center gap-2"
            >
              <span>📋</span> View My Ads
            </button>
          )}
          {isPublished && uploadedAdId && (
            <button
              onClick={handleViewAd}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-bold flex items-center justify-center gap-2"
            >
              <span>👁️</span> View My Ad
            </button>
          )}
          {isBlocked && (
            <button
              onClick={() => {
                dispatch(resetAdPost());
                navigate("/post-ads");
              }}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl font-bold flex items-center justify-center gap-2"
            >
              <span>📝</span> Create New Ad
            </button>
          )}
          <button
            onClick={handleGoHome}
            className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-bold flex items-center justify-center gap-2"
          >
            <span>🏠</span> Go to Homepage
          </button>
        </div>

        {/* Email Reminder */}
        {isPending && (
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-2">📧 Check your email for updates</p>
            <p className="text-xs text-gray-500">We'll notify you as soon as your ad is reviewed</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;