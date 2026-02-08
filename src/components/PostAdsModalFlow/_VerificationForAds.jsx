import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetAdvertisementByIdQuery } from "../../features/postadsSlice";
import { useUpdateAdvertisementStatusMutation } from "../../features/postadsSlice";

const _VerificationForAds = ({ onBack, onNext }) => {
  const uploadedAdId = useSelector((state) => state.adPost.uploadedAdId);
  const accountType = useSelector((state) => state.adPost.accountType);
  const selectedPage = useSelector((state) => state.adPost.selectedPage);
  
  const [countdown, setCountdown] = useState(5);
  const [processingComplete, setProcessingComplete] = useState(false);
  
  const { data: advertisementData, error, isLoading, refetch } = useGetAdvertisementByIdQuery(
    uploadedAdId,
    { skip: !uploadedAdId }
  );
  const [updateAdStatus] = useUpdateAdvertisementStatusMutation();
  
  const uploadedAd = advertisementData?.data || null;

  // Log account type info
  useEffect(() => {
    if (accountType) {
      console.log("📌 Verification - Account Type:", accountType);
      if (accountType === 'page' && selectedPage) {
        console.log("📄 Verification - Selected Page:", selectedPage);
      }
    }
  }, [accountType, selectedPage]);

  // 🔥 UPDATED: Skip AI verification, set to manual review
  useEffect(() => {
    const submitForManualReview = async () => {
      if (!uploadedAd || processingComplete) return;

      try {
        console.log("⏳ Submitting ad for manual review (AI verification disabled)...");
        
        // Set status to "inactive" for manual review
        await updateAdStatus({
          id: uploadedAdId,
          status: "inactive",
          verificationResult: {
            success: false,
            message: "Ad submitted for manual review within 24 hours",
            requiresManualReview: true
          }
        }).unwrap();
        
        console.log("✅ Ad submitted for manual review successfully");
        
        // Refetch to get updated status
        refetch();
        
        // Mark processing as complete
        setProcessingComplete(true);
        
      } catch (err) {
        console.error("❌ Error submitting for manual review:", err);
        
        // Still mark as complete to allow user to proceed
        setProcessingComplete(true);
      }
    };

    submitForManualReview();
  }, [uploadedAd, processingComplete, uploadedAdId, updateAdStatus, refetch]);

  // Countdown timer and auto-redirect
  useEffect(() => {
    if (!processingComplete || countdown <= 0) {
      if (countdown <= 0) {
        onNext(); // Navigate to success page
      }
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [processingComplete, countdown, onNext]);

  const steps = [
    { number: 1, label: "Ad Details" },
    { number: 2, label: "Payment" },
    { number: 3, label: "Verification", active: true },
    { number: 4, label: "Published" }
  ];

  if (isLoading || !processingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-semibold">
            Submitting your ad for review...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            This will only take a moment
          </p>
        </div>
      </div>
    );
  }

  if (error || !uploadedAd) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4 text-center">⚠️</div>
          <h3 className="text-red-500 text-xl font-bold text-center">Failed to Load Ad</h3>
          <p className="text-gray-600 text-center mt-2">
            {error?.data?.message || "Unable to fetch advertisement"}
          </p>
          <div className="mt-6 space-y-3">
            <button onClick={() => refetch()} className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold">
              🔄 Try Again
            </button>
            <button onClick={onBack} className="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold">
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    step.active ? 'bg-orange-600 text-white' : step.number < 3 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.number < 3 ? '✓' : step.number}
                  </div>
                  <span className={`mt-2 text-sm font-semibold ${step.active ? 'text-orange-600' : step.number < 3 ? 'text-green-500' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded ${step.number < 3 ? 'bg-green-500' : step.active ? 'bg-orange-600' : 'bg-gray-200'}`} style={{ marginTop: '-20px' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Account Type Display */}
        {accountType && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-orange-200">
            <div className="flex items-center gap-4">
              <div className="text-5xl">
                {accountType === 'page' ? '📄' : '👤'}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Posting As
                </h3>
                <div className="flex items-center gap-3">
                  <p className="text-xl font-bold text-orange-600">
                    {accountType === 'page' 
                      ? (selectedPage?.pagename || selectedPage?.title || selectedPage?.name || 'Page')
                      : 'Personal Account'}
                  </p>
                  {accountType === 'page' && selectedPage && (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 rounded-full text-sm font-semibold">
                        {selectedPage.category?.name || 'Page'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedPage.pagetype?.isPaid || 
                        ['vip', 'premium', 'standard'].some(type => 
                          (selectedPage.pagetype?.name || '').toLowerCase().includes(type)
                        )
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedPage.pagetype?.name || selectedPage.pagetype?.typename || 'Basic'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Review Notice */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-8 mb-6 shadow-md border-2 border-orange-200">
          <div className="flex items-start gap-4">
            <div className="text-6xl">⏳</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-3xl text-orange-900">
                  Manual Review Required
                </h3>
                {processingComplete && (
                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm border-2 border-orange-500 animate-pulse">
                    <p className="text-orange-700 font-bold text-sm">Redirecting in {countdown}s</p>
                  </div>
                )}
              </div>
              
              <p className="text-lg mb-4 text-orange-800">
                Your ad has been submitted for manual review by our team
              </p>

              <div className="bg-white rounded-lg p-6 border-2 border-orange-200 space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-3 text-lg">What happens next?</p>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="text-orange-500 font-bold text-lg">1.</span>
                      <span>Our team will manually review your ad within <strong className="text-orange-700">24 hours</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-orange-500 font-bold text-lg">2.</span>
                      <span>If your ad complies with our policies, it will be published automatically</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-orange-500 font-bold text-lg">3.</span>
                      <span>If there are issues, we'll contact you via email with feedback</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-orange-500 font-bold text-lg">4.</span>
                      <span>You'll receive a notification once the review is complete</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-sm text-orange-800 italic flex items-start gap-2">
                    <span className="text-xl">💡</span>
                    <span><strong>Note:</strong> We've temporarily disabled automated AI verification. All ads are being manually reviewed to ensure the highest quality standards.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Display */}
        {uploadedAd && (
          <div className="bg-yellow-50 rounded-xl p-4 mb-6 border-2 border-yellow-300">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⏳</div>
              <div>
                <p className="font-bold text-sm text-yellow-800">Current Status:</p>
                <p className="text-lg font-bold text-yellow-700">Pending Manual Review</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Ad Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ad Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {uploadedAd.images?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📸 Images ({uploadedAd.images.length})</h3>
                <div className="grid grid-cols-3 gap-4">
                  {uploadedAd.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-orange-600 transition-all group">
                      <img src={img.url || img} alt={`Ad ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">#{idx + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-3">📋 Details</h3>
              <div className="space-y-4">
                {/* Ad Type Display */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <label className="text-xs font-bold text-purple-700 uppercase">Ad Type</label>
                  <p className="text-lg font-bold text-purple-900 mt-1">{uploadedAd.typeofads || 'Advertisement'}</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <label className="text-xs font-bold text-blue-700 uppercase">Title</label>
                  <p className="text-xl font-bold text-gray-900 mt-1">{uploadedAd.title}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-xs font-bold text-gray-700 uppercase">Description</label>
                  <div className="text-sm text-gray-700 mt-1" dangerouslySetInnerHTML={{ __html: uploadedAd.description }} />
                </div>
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-300">
                  <label className="text-xs font-bold text-green-700 uppercase">Price</label>
                  <p className="text-3xl font-bold text-green-600 mt-1">${uploadedAd.price || "0"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact */}
            {uploadedAd.contact && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📞 Contact</h3>
                <div className="space-y-3">
                  {uploadedAd.contact.phone && (
                    <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                      <span className="text-2xl">📱</span>
                      <div><p className="text-xs text-blue-700 font-semibold">Phone</p><p className="text-sm font-bold">{uploadedAd.contact.phone}</p></div>
                    </div>
                  )}
                  {uploadedAd.contact.whatsapp && (
                    <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg">
                      <span className="text-2xl">💬</span>
                      <div><p className="text-xs text-green-700 font-semibold">WhatsApp</p><p className="text-sm font-bold">{uploadedAd.contact.whatsapp}</p></div>
                    </div>
                  )}
                  {uploadedAd.contact.email && (
                    <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg">
                      <span className="text-2xl">📧</span>
                      <div><p className="text-xs text-purple-700 font-semibold">Email</p><p className="text-sm font-bold break-all">{uploadedAd.contact.email}</p></div>
                    </div>
                  )}
                  {uploadedAd.contact.telegram && (
                    <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                      <span className="text-2xl">✈️</span>
                      <div><p className="text-xs text-blue-700 font-semibold">Telegram</p><p className="text-sm font-bold">{uploadedAd.contact.telegram}</p></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📍 Location</h3>
              <div className="space-y-2">
                {uploadedAd.location?.country?.name && <div className="flex justify-between py-2 border-b"><span className="text-sm text-gray-600">Country:</span><span className="text-sm font-bold">{uploadedAd.location.country.name}</span></div>}
                {uploadedAd.location?.region?.name && <div className="flex justify-between py-2 border-b"><span className="text-sm text-gray-600">Region:</span><span className="text-sm font-bold">{uploadedAd.location.region.name}</span></div>}
                {uploadedAd.location?.state?.name && <div className="flex justify-between py-2 border-b"><span className="text-sm text-gray-600">State:</span><span className="text-sm font-bold">{uploadedAd.location.state.name}</span></div>}
                {uploadedAd.location?.district?.name && <div className="flex justify-between py-2 border-b"><span className="text-sm text-gray-600">District:</span><span className="text-sm font-bold">{uploadedAd.location.district.name}</span></div>}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mt-6">
          <div className="flex justify-between items-center gap-4">
            <button onClick={onBack} className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all">
              ← Back
            </button>
            <button 
              onClick={onNext} 
              className="px-8 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 text-white font-bold rounded-xl hover:from-orange-700 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              Continue to Results
              {processingComplete && <span className="bg-white/20 px-2 py-1 rounded">({countdown}s)</span>}
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default _VerificationForAds;