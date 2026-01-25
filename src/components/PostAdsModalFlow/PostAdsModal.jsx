import React, { useEffect } from "react";
import Modal from "react-modal";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";

import {
  setStep,
  setAdType,
  setTypeOfAds,
  setAccountType,
  setSelectedPage,
  resetAdPost,
} from "../../features/redux/adPostSlice";

import Choose from "./choose.jsx";
import POSTANADS from "./POSTANADS";
import PaymentForAds from "./_PaymentForAds";
import _VerificationForAds from "./_VerificationForAds";

const PostAdsModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { step, formData, accountType, selectedPage } = useSelector((state) => state.adPost);

  // 🔹 Handle refresh warning and reset
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
      sessionStorage.setItem("clearAdPost", "true");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Clear if reloaded
    if (sessionStorage.getItem("clearAdPost") === "true") {
      dispatch(resetAdPost());
      sessionStorage.removeItem("clearAdPost");
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [dispatch]);

  // 🔹 Choose Type handler - UPDATED to handle account and page selection
  const handleChoose = (data) => {
    const { postType, accountType, page } = data;
    
    // 🔥 Map user selection to correct typeofads value
    let typeOfAds;
    
    if (postType === "Ads") {
      typeOfAds = "Advertisement";
    } else if (postType === "Need") {
      typeOfAds = "Needs";
    } else if (postType === "Offer") {
      typeOfAds = "Offers";
    }

    // Set account type and selected page
    dispatch(setAccountType(accountType));
    dispatch(setSelectedPage(page));
    
    // Set both adType (for UI) and typeofads (for backend)
    dispatch(setAdType(postType));          // UI display type (Ads, Need, Offer)
    dispatch(setTypeOfAds(typeOfAds));      // Backend value (Advertisement, Needs, Offers)
    dispatch(setStep("form"));
  };

  // 🔹 Step Handlers
  const handleNext = () => {
    if (step === "form") dispatch(setStep("payment"));
    else if (step === "payment") dispatch(setStep("verification"));
    else if (step === "verification") dispatch(setStep("success"));
  };

  const handleBack = () => {
    if (step === "verification") dispatch(setStep("payment"));
    else if (step === "payment") dispatch(setStep("form"));
    else if (step === "form") dispatch(setStep("choose"));
  };

  const handleClose = () => {
    dispatch(resetAdPost());
    onClose();
  };

  // 🔥 Debug: Log current values
  useEffect(() => {
    console.log("Current state:", {
      typeofads: formData.typeofads,
      accountType,
      selectedPage: selectedPage?.title || selectedPage?.pagename
    });
  }, [formData.typeofads, accountType, selectedPage]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      ariaHideApp={false}
      shouldCloseOnOverlayClick={true}
      className="fixed inset-0 bg-white z-[9999] overflow-auto font-playfair font-bold"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
    >
      {/* Step 0 - Choose Ad Type */}
      {step === "choose" && (
        <Choose handleChoose={handleChoose} handleClose={handleClose} />
      )}

      {/* Step 1 - Single Unified Form */}
      {step === "form" && (
        <POSTANADS onBack={handleBack} onNext={handleNext} />
      )}

      {/* Step 2 - Payment */}
      {step === "payment" && (
        <PaymentForAds onBack={handleBack} onNext={handleNext} />
      )}

      {/* Step 3 - Verification */}
      {step === "verification" && (
        <_VerificationForAds onBack={handleBack} onNext={handleNext} />
      )}

      {/* Step 4 - Success */}
      {step === "success" && (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
          <h2 className="text-2xl font-bold text-green-600">Published!</h2>
          <p className="text-center">
            Your <strong>{formData.typeofads}</strong> has been successfully
            verified and published
            {accountType === 'page' && selectedPage && (
              <span> as <strong>{selectedPage.title || selectedPage.pagename}</strong></span>
            )}
            .
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </Modal>
  );
};

export default PostAdsModal;

