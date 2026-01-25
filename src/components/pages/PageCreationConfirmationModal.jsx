"use client";
import React from "react";
import {
  X,
  CheckCircle,
  CreditCard,
  AlertCircle,
  DollarSign,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import Swal from "sweetalert2";
import { formatCurrency } from "../../functions/calculatePageCost";
import { handlePagePayment } from "../../functions/handlePagePayment";

/**
 * Page Creation Confirmation Modal
 * ✅ UPDATED: Proper payment flow with state management
 */
const PageCreationConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  costData,
  isCreating = false,
  isProcessingPayment = false,
  setIsProcessingPayment,
}) => {
  if (!isOpen || !costData) return null;

  const { total, isFree, requiresPayment, currency, pageType, images, metadata } = costData;

  const pageTypeCost = pageType?.cost ?? 0;
  const galleryCost = images?.cost ?? 0;
  const breakdown = images?.breakdown ?? [];

  // ✅ UPDATED: Handle payment and page creation flow
  const handleConfirmClick = async () => {
    if (isFree) {
      // ✅ Free page - create immediately
      console.log('🆓 Free page - creating immediately');
      onConfirm("create", true);
      return;
    }

    // ✅ Paid page - process payment first
    console.log('💳 Paid page - starting payment flow');
    setIsProcessingPayment(true);

    try {
      const paymentSuccess = await handlePagePayment({
        pageType,
        amount: total,
        currency: costData.currency,
        countryCode: costData.countryCode || 'LK',
        imagesCost: galleryCost,
        metadata: {
          ...metadata,
          imageCount: images?.count || 0,
        },
      });

      if (paymentSuccess) {
        console.log('✅ Payment successful - creating page');
        // ✅ Payment successful - now create the page
        onConfirm("create", true);
      } else {
        console.log('❌ Payment failed or cancelled');
        setIsProcessingPayment(false);
        // Swal.fire({
        //   icon: "error",
        //   title: "Payment Cancelled",
        //   text: "Page creation was not completed.",
        // });
        Swal.fire({
            icon: "info",
            title: "Payments Not Available",
            text: "Sorry, we don’t have a payment gateway at the moment. Currently, only free Page are supported.",
            confirmButtonText: "OK",
          });
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      setIsProcessingPayment(false);
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: "An error occurred during payment. Please try again.",
      });
    }
  };

  // ✅ Determine button state
  const isButtonDisabled = isCreating || isProcessingPayment;
  const buttonText = isProcessingPayment 
    ? "Processing Payment..." 
    : isCreating 
    ? "Creating Page..." 
    : isFree 
    ? "Create Page" 
    : "Pay Now";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div
          className={`p-6 border-b border-gray-200 ${
            isFree
              ? "bg-gradient-to-r from-green-50 to-emerald-50"
              : "bg-gradient-to-r from-blue-50 to-purple-50"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  isFree ? "bg-green-500" : "bg-blue-600"
                } shadow-lg`}
              >
                {isFree ? (
                  <CheckCircle className="w-8 h-8 text-white" />
                ) : (
                  <CreditCard className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  {isFree ? "Create Your Page" : "Payment Required"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {isFree ? "Your page is completely free!" : "Review your order details"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isButtonDisabled}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
          {/* Cost Breakdown */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#00008F]" />
              Cost Breakdown
            </h3>

            {/* Page Type */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#00008F] rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {pageType?.name || "Page Type"}
                    </p>
                    <p className="text-xs text-gray-500">Page Listing</p>
                  </div>
                </div>
                <p
                  className={`text-lg font-bold ${
                    pageTypeCost === 0 ? "text-green-600" : "text-gray-900"
                  }`}
                >
                  {formatCurrency(pageTypeCost, currency)}
                </p>
              </div>
            </div>

            {/* Gallery */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Gallery Images ({images?.count || 0})
                    </p>
                    <p className="text-xs text-gray-500">Media Uploads</p>
                  </div>
                </div>
                <p
                  className={`text-lg font-bold ${
                    galleryCost === 0 ? "text-green-600" : "text-gray-900"
                  }`}
                >
                  {formatCurrency(galleryCost, currency)}
                </p>
              </div>

              {/* Gallery Breakdown */}
              {breakdown.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  {breakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        {item.description}
                      </span>
                      <span
                        className={`font-semibold ${
                          item.cost === 0 ? "text-green-600" : "text-gray-700"
                        }`}
                      >
                        {formatCurrency(item.cost, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div
            className={`rounded-xl p-5 border-2 ${
              isFree
                ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300"
                : "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Total Amount</p>
                <p
                  className={`text-3xl font-black ${isFree ? "text-green-600" : "text-[#00008F]"}`}
                >
                  {isFree ? "FREE" : formatCurrency(total, currency)}
                </p>
              </div>

              {isFree && (
                <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  🎉 NO COST
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div
            className={`mt-4 p-4 rounded-xl border ${
              isFree ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {isFree ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-semibold mb-1">
                  {isFree ? "Ready to Create!" : "Payment Gateway"}
                </p>
                <p className="text-xs">
                  {isFree
                    ? "Create your page instantly. No payment needed."
                    : "You will be redirected to the secure payment gateway. After successful payment, your page will be created automatically."}
                </p>
              </div>
            </div>
          </div>

          {/* ✅ NEW: Processing indicator */}
          {isProcessingPayment && (
            <div className="mt-4 p-4 rounded-xl border bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                <div>
                  <p className="text-sm font-semibold text-yellow-900">Processing Payment</p>
                  <p className="text-xs text-yellow-700">
                    Please complete the payment in the popup window...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ NEW: Creating indicator */}
          {isCreating && (
            <div className="mt-4 p-4 rounded-xl border bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Creating Your Page</p>
                  <p className="text-xs text-blue-700">
                    Please wait while we set up your page...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={isButtonDisabled}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={isButtonDisabled}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-white transition-colors ${
              isFree 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-[#00008F] hover:bg-[#00006F]"
            } ${
              isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isButtonDisabled && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
            )}
            {buttonText}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PageCreationConfirmationModal;