import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setStep,
  setAdType,
  setTypeOfAds,
  setAccountType,
  setSelectedPage,
  resetAdPost,
} from "../../features/redux/adPostSlice";

import Choose from "./choose";
import POSTANADS from "./POSTANADS";
import PaymentForAds from "./_PaymentForAds";
import _VerificationForAds from "./_VerificationForAds";
import SuccessPage from "./_SuccessPage"; // Import the new success page

const PostAdsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { type } = useParams();
  const { step, formData, accountType, selectedPage } = useSelector((state) => state.adPost);

  // Handle URL parameter changes
  useEffect(() => {
    if (type) {
      let typeOfAds;
      let adType;

      const normalizedType = type.toLowerCase();
      
      if (normalizedType === "ads") {
        typeOfAds = "Advertisement";
        adType = "Ads";
      } else if (normalizedType === "need") {
        typeOfAds = "Needs";
        adType = "Need";
      } else if (normalizedType === "offer") {
        typeOfAds = "Offers";
        adType = "Offer";
      }

      if (typeOfAds && adType) {
        console.log("📌 Setting ad type from URL:", { adType, typeOfAds });
        dispatch(setAdType(adType));
        dispatch(setTypeOfAds(typeOfAds));
        dispatch(setStep("form"));
      }
    } else {
      dispatch(setStep("choose"));
    }
  }, [type, dispatch]);

  // Handle choosing ad type - UPDATED to handle account and page selection
  const handleChoose = (data) => {
    const { postType, accountType, page } = data;
    
    console.log("📌 User selected:", postType);
    console.log("📌 Account type:", accountType);
    console.log("📌 Selected page:", page);

    // Set account type and selected page in Redux
    dispatch(setAccountType(accountType));
    dispatch(setSelectedPage(page));

    // Navigate with the post type
    const urlType = postType.toLowerCase();
    navigate(`/post-ads/${urlType}`);
  };

  // Handle close/cancel
  const handleClose = () => {
    dispatch(resetAdPost());
    navigate("/");
  };

  // Step navigation handlers
  const handleNext = () => {
    if (step === "form") {
      dispatch(setStep("payment"));
    } else if (step === "payment") {
      dispatch(setStep("verification"));
    } else if (step === "verification") {
      dispatch(setStep("success"));
    }
  };

  const handleBack = () => {
    if (step === "verification") {
      dispatch(setStep("payment"));
    } else if (step === "payment") {
      dispatch(setStep("form"));
    } else if (step === "form") {
      navigate("/post-ads");
      dispatch(setStep("choose"));
      // Clear account type and page when going back to choose
      dispatch(setAccountType(null));
      dispatch(setSelectedPage(null));
    }
  };

  // 🔥 Debug: Log current values
  useEffect(() => {
    console.log("Current state:", {
      step,
      typeofads: formData.typeofads,
      accountType,
      selectedPage: selectedPage?.title || selectedPage?.pagename
    });
  }, [step, formData.typeofads, accountType, selectedPage]);

  return (
    <div className="min-h-screen">
      {/* Step 0 - Choose Ad Type */}
      {step === "choose" && (
        <Choose handleChoose={handleChoose} handleClose={handleClose} />
      )}

      {/* Step 1 - Form */}
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

      {/* Step 4 - Success Page */}
      {step === "success" && <SuccessPage />}
    </div>
  );
};

export default PostAdsPage;
