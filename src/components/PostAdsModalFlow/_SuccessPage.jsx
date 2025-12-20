import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { resetAdPost } from "../../features/redux/adPostSlice";
import { useGetVerificationByAdIdQuery } from "../../features/aiverificationoutputSlice";

const SuccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { formData, uploadedAdId } = useSelector((state) => state.adPost);
  const [countdown, setCountdown] = useState(10);
  
  // Fetch verification result from database
  const { data: verificationData, isLoading } = useGetVerificationByAdIdQuery(uploadedAdId, {
    skip: !uploadedAdId
  });
  
  const verificationResult = verificationData?.data?.[0]; // Get first (latest) verification
  const verificationPassed = verificationResult?.success ?? true; // Default to true if no data

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown <= 0) {
      handleGoHome();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 3000);

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

  // Show loading state while fetching verification
  if (isLoading) {
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
    <div className={`min-h-screen bg-gradient-to-br ${verificationPassed ? 'from-green-50 via-blue-50 to-purple-50' : 'from-orange-50 via-yellow-50 to-red-50'} flex items-center justify-center p-4`}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full">
        {/* Icon Animation - Success or Pending */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className={`absolute inset-0 ${verificationPassed ? 'bg-green-400' : 'bg-orange-400'} rounded-full animate-ping opacity-75`}></div>
            <div className={`relative ${verificationPassed ? 'bg-green-500' : 'bg-orange-500'} text-white rounded-full w-24 h-24 flex items-center justify-center text-5xl animate-bounce`}>
              {verificationPassed ? '✅' : '⏳'}
            </div>
          </div>
        </div>

        {/* Message - Success or Manual Review */}
        {verificationPassed ? (
          <>
            <h1 className="text-4xl font-bold text-center text-gray-900 mb-3">
              🎉 Successfully Published!
            </h1>
            
            <p className="text-center text-gray-600 text-lg mb-6">
              Your <span className="font-bold text-blue-600">{formData.typeofads || "advertisement"}</span> has been verified and is now live!
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-center text-orange-600 mb-3">
              ⏳ Manual Review Required
            </h1>
            
            <p className="text-center text-gray-700 text-lg mb-6">
              Your <span className="font-bold text-blue-600">{formData.typeofads || "advertisement"}</span> has been submitted for review.
            </p>
            
            {/* Manual Review Notice */}
            <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🔍</div>
                <div>
                  <h3 className="font-bold text-orange-900 text-xl mb-2">
                    Your Ad is Under Review
                  </h3>
                  <p className="text-orange-800 mb-3">
                    Our AI verification system flagged some content that requires manual verification. Don't worry - this is a standard safety procedure!
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <p className="font-semibold text-gray-900 mb-2">What happens next?</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 font-bold">1.</span>
                        <span>Our team will manually review your ad within <strong>24-48 hours</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 font-bold">2.</span>
                        <span>If your ad complies with our policies, it will be published automatically</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 font-bold">3.</span>
                        <span>If there are issues, we'll contact you via email with feedback</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 font-bold">4.</span>
                        <span>You'll receive a notification once the review is complete</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm text-orange-700 mt-3 italic">
                    ⚠️ <strong>Sorry for the wait!</strong> We're committed to maintaining a safe marketplace for everyone.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Ad Details Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border-2 border-blue-200">
          <h3 className="font-bold text-gray-900 mb-3 text-lg">📋 Posted Ad Details</h3>
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
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Ad ID:</span>
                <span className="font-mono text-xs text-gray-500">{uploadedAdId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Verification Status */}
        {verificationPassed ? (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✅</div>
              <div>
                <p className="font-bold text-green-900">Verification Complete</p>
                <p className="text-sm text-green-700">Your content passed all safety checks</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚠️</div>
              <div>
                <p className="font-bold text-yellow-900">AI Verification: Manual Review Needed</p>
                <p className="text-sm text-yellow-700">
                  {verificationResult?.message || "Your ad requires human verification for quality assurance"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* What's Next Section */}
        <div className="bg-gray-50 rounded-xl p-5 mb-6">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-xl">🚀</span> What's Next?
          </h4>
          {verificationPassed ? (
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
          ) : (
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">⏳</span>
                <span>Check your email for review status updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">⏳</span>
                <span>Review typically takes 24-48 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">⏳</span>
                <span>You can view your pending ads in your dashboard</span>
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
          <div className={`inline-flex items-center gap-2 ${verificationPassed ? 'bg-blue-100 border-blue-300' : 'bg-orange-100 border-orange-300'} border rounded-full px-4 py-2 animate-pulse`}>
            <span className={`${verificationPassed ? 'text-blue-700' : 'text-orange-700'} text-sm font-semibold`}>
              {verificationPassed ? `Auto-redirecting to homepage in ${countdown}s` : `Redirecting in ${countdown}s`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {verificationPassed && uploadedAdId && (
            <button
              onClick={handleViewAd}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-bold flex items-center justify-center gap-2"
            >
              <span>👁️</span> View My Ad
            </button>
          )}
          {!verificationPassed && (
            <button
              onClick={() => navigate("/my-ads")}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-xl hover:from-orange-700 hover:to-yellow-700 transition-all duration-200 shadow-lg hover:shadow-xl font-bold flex items-center justify-center gap-2"
            >
              <span>📋</span> View Pending Ads
            </button>
          )}
          <button
            onClick={handleGoHome}
            className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-bold flex items-center justify-center gap-2"
          >
            <span>🏠</span> Go to Homepage
          </button>
        </div>

        {/* Social Share Section (Optional) */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-3">Share your success!</p>
          <div className="flex justify-center gap-3">
            <button className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors">
              📘
            </button>
            <button className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors">
              🐦
            </button>
            <button className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors">
              💬
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;