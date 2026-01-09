import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetAdvertisementByIdQuery } from "../../features/postadsSlice";
import { useVerifyItemMutation } from "../../features/AwsVerficationapislice";
import { useCreateVerificationMutation } from "../../features/aiverificationoutputSlice";

const _VerificationForAds = ({ onBack, onNext }) => {
  const uploadedAdId = useSelector((state) => state.adPost.uploadedAdId);
  const [verificationResult, setVerificationResult] = useState(null);
  const [savingResult, setSavingResult] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [autoRedirect, setAutoRedirect] = useState(false);
  
  const { data: advertisementData, error, isLoading, refetch } = useGetAdvertisementByIdQuery(
    uploadedAdId,
    { skip: !uploadedAdId }
  );
  const [verifyItem, { isLoading: isVerifying }] = useVerifyItemMutation();
  const [createVerification] = useCreateVerificationMutation();
  
  const uploadedAd = advertisementData?.data || null;

  // Auto-run verification when ad data is available
  useEffect(() => {
    const runVerification = async () => {
      if (!uploadedAd) return;

      const payload = {
        image_url: uploadedAd.images?.[0]?.url || uploadedAd.images?.[0],
        title: uploadedAd.title,
        description: uploadedAd.description,
        price: uploadedAd.price?.toString(),
        category: uploadedAd.category?.name,
        childCategory: uploadedAd.childCategory?.name,
        language: uploadedAd.language?.code || "en",
        specialQuestions: uploadedAd.specialQuestions 
          ? Object.entries(uploadedAd.specialQuestions).map(([question, answer]) => ({
              question,
              answer
            }))
          : []
      };

      try {
        // Step 1: Get verification from AWS Lambda
        const result = await verifyItem(payload).unwrap();
        console.log("✅ AWS Verification Result:", result);
        
        setVerificationResult(result);

        // Step 2: Save the result to your backend database
        setSavingResult(true);
        try {
          const savePayload = {
            ad_id: uploadedAdId,
            success: result.success,
            message: result.message,
            image_check: result.image_check,
            text_check: result.text_check
          };
          console.log("🟦 Save Payload:", savePayload);
          const savedResult = await createVerification(savePayload).unwrap();
          console.log("✅ Verification saved to DB:", savedResult);
          
          // Step 3: Start countdown for auto-redirect (both success and failure)
          setAutoRedirect(true);
          
        } catch (saveError) {
          console.error("❌ Failed to save verification result:", saveError);
          // Still start countdown even if saving failed
          setAutoRedirect(true);
        } finally {
          setSavingResult(false);
        }

      } catch (err) {
        console.error("❌ Verification error:", err);
        
        // Check if it's a CORS error
        const isCorsError = err?.status === "FETCH_ERROR" || 
                           err?.error?.includes("Failed to fetch") ||
                           !err?.status;
        
        setVerificationResult({
          success: false,
          message: isCorsError 
            ? "⚠️ CORS Error: Backend needs to enable CORS headers. The API works but browser blocks the request."
            : err?.data?.message || err?.error || "Verification API failed",
          isApiError: true,
          isCorsError: isCorsError,
          statusCode: err?.status || "CORS_ERROR"
        });
        
        // Start countdown even on error
        setAutoRedirect(true);
      }
    };

    runVerification();
  }, [uploadedAd, verifyItem, createVerification, uploadedAdId]);

  // Countdown timer and auto-redirect
  useEffect(() => {
    if (!autoRedirect || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onNext(); // Navigate to success page
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRedirect, countdown, onNext]);

  const steps = [
    { number: 1, label: "Ad Details" },
    { number: 2, label: "Payment" },
    { number: 3, label: "Verification", active: true },
    { number: 4, label: "Published" }
  ];

  if (isLoading || isVerifying || savingResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-semibold">
            {savingResult ? "💾 Saving verification result..." : 
             isVerifying ? "🔍 Verifying your advertisement..." : 
             "Loading ad data..."}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    step.active ? 'bg-blue-600 text-white' : step.number < 3 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.number < 3 ? '✓' : step.number}
                  </div>
                  <span className={`mt-2 text-sm font-semibold ${step.active ? 'text-blue-600' : step.number < 3 ? 'text-green-500' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded ${step.number < 3 ? 'bg-green-500' : step.active ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ marginTop: '-20px' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Verification Result Alert with Countdown */}
        {verificationResult && (
          <div className={`rounded-xl p-6 mb-6 shadow-md border-2 ${
            verificationResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className="text-5xl">{verificationResult.success ? '✅' : '❌'}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-bold text-2xl ${verificationResult.success ? 'text-green-900' : 'text-red-900'}`}>
                    {verificationResult.success ? 'Verification Passed!' : 'Verification Failed'}
                  </h3>
                  {autoRedirect && (
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border-2 border-blue-500 animate-pulse">
                      <p className="text-blue-700 font-bold text-sm">Redirecting in {countdown}s</p>
                    </div>
                  )}
                </div>
                
                <p className={`text-base mb-4 ${verificationResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {verificationResult.message}
                </p>

                {/* Display detailed checks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {verificationResult.image_check && (
                    <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                      <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        📸 Image Check
                        <span className={`px-2 py-1 rounded text-xs ${verificationResult.image_check.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {verificationResult.image_check.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </p>
                      <p className="text-xs text-gray-600">
                        {verificationResult.image_check.checked_count} image(s) checked
                        {verificationResult.image_check.unsafe_count > 0 && (
                          <span className="text-red-600 font-bold"> • {verificationResult.image_check.unsafe_count} unsafe</span>
                        )}
                      </p>
                    </div>
                  )}

                  {verificationResult.text_check && (
                    <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                      <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        📝 Text Check
                        <span className={`px-2 py-1 rounded text-xs ${verificationResult.text_check.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {verificationResult.text_check.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </p>
                      {verificationResult.text_check.issues && verificationResult.text_check.issues.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {verificationResult.text_check.issues.map((issue, idx) => (
                            <li key={idx} className="text-xs text-red-600 flex items-start">
                              <span className="mr-1">•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                {verificationResult.isApiError && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-900 font-semibold mb-2 flex items-center gap-2">
                      🔧 Technical Details
                    </p>
                    <ul className="text-xs text-yellow-800 space-y-1 ml-4 list-disc">
                      <li>Error Status: <code className="bg-yellow-100 px-2 py-1 rounded">{verificationResult.statusCode}</code></li>
                      {verificationResult.isCorsError && (
                        <>
                          <li>The API endpoint exists and works in Postman</li>
                          <li>Browser is blocking due to missing CORS headers</li>
                          <li><strong>Fix:</strong> Add CORS headers in AWS Lambda response & enable CORS in API Gateway</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ad Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {uploadedAd.images?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📸 Images ({uploadedAd.images.length})</h3>
                <div className="grid grid-cols-3 gap-4">
                  {uploadedAd.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-600 transition-all group">
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
                  {uploadedAd.contact.email && (
                    <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg">
                      <span className="text-2xl">📧</span>
                      <div><p className="text-xs text-purple-700 font-semibold">Email</p><p className="text-sm font-bold break-all">{uploadedAd.contact.email}</p></div>
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
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              Continue to Results
              {autoRedirect && <span className="bg-white/20 px-2 py-1 rounded">({countdown}s)</span>}
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default _VerificationForAds;
