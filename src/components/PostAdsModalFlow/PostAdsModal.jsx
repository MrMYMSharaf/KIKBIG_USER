import React, { useState } from "react";
import Modal from "react-modal";
import Choose from "./choose";
import POSTANADS from "./POSTANADS";
import PostanNeed from "./POSTanNeed";
import POSTanOffer from "./POSTanOffer";

const PostAdsModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState("choose");
  const [adType, setAdType] = useState("");

  const handleChoose = (type) => {
    setAdType(type);
    setStep("form");
  };

  const handleNext = () => {
    if (step === "form") setStep("payment");
    else if (step === "payment") setStep("success");
  };

  const handleBack = () => {
    if (step === "payment") setStep("form");
    else if (step === "form") setStep("choose");
  };

  const handleClose = () => {
    setStep("choose");
    setAdType("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      ariaHideApp={false}
      shouldCloseOnOverlayClick={true}
      className="fixed inset-0 bg-white z-[9999] overflow-auto p-6"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
    >
      {step === "choose" && (
        <Choose handleChoose={handleChoose} handleClose={handleClose} />
      )}

      {step === "form" && (
        <>
          {adType === "Ads" && <POSTANADS onBack={handleBack} onNext={handleNext} />}
          {adType === "Need" && <PostanNeed onBack={handleBack} onNext={handleNext} />}
          {adType === "Offer" && <POSTanOffer onBack={handleBack} onNext={handleNext} />}
        </>
      )}

      {step === "payment" && (
        <div className="flex flex-col space-y-4 w-full">
          <h2 className="text-xl font-bold">Payment for {adType}</h2>
          <input type="text" placeholder="Card Number" className="border p-2 rounded" />
          <input type="text" placeholder="Expiry Date" className="border p-2 rounded" />
          <div className="flex justify-between">
            <button onClick={handleBack} className="px-4 py-2 bg-gray-300 rounded">
              Back
            </button>
            <button onClick={handleNext} className="px-4 py-2 bg-green-400 text-white rounded">
              Pay
            </button>
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-2xl font-bold text-green-600">Success!</h2>
          <p>Your {adType} has been posted successfully.</p>
          <button onClick={handleClose} className="px-6 py-3 bg-blue-400 text-white rounded-lg">
            Close
          </button>
        </div>
      )}
    </Modal>
  );
};

export default PostAdsModal;
