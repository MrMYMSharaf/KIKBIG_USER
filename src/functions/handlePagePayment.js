// functions/handlePagePayment.js
import { store } from "../store/store";
import { paymentApi } from "../features/paymentApiSlice";
import Swal from "sweetalert2";

/**
 * ✅ FINAL: Handle page payment
 * 🔒 Page creation allowed ONLY when payment status === "completed"
 */
export const handlePagePayment = async ({
  pageType,
  amount,
  currency,
  countryCode,
  imagesCost = 0,
  metadata = {},
}) => {
  //-----------------------------------
  Swal.fire({
    icon: "info",
    title: "Payments Not Available",
    text: "Sorry, we don’t have a payment gateway at the moment. Currently, only free Page are supported.",
    confirmButtonText: "OK",
  });

  // ✅ Treat as successful so ad posting flow can continue
  return false;
  //-----------------------------------
  // try {
  //   const state = store.getState();
  //   const pageForm = state.pageCreate.formData;
  //   const contact = pageForm.contact || {};

  //   // ✅ Unique order ID
  //   const orderId = `PAGE-${Date.now()}`;

  //   const countryMap = {
  //     LK: "Sri Lanka",
  //     US: "United States",
  //     AU: "Australia",
  //     IN: "India",
  //   };

  //   const countryName = countryMap[countryCode] || "Sri Lanka";

  //   // 🔥 Payment details sent to backend
  //   const paymentDetails = {
  //     orderId,
  //     payfor: "Page",
  //     amount: Number(amount).toFixed(2),
  //     currency,
  //     first_name:
  //       contact.first_name || pageForm.title?.split(" ")[0] || "User",
  //     last_name: contact.last_name || "",
  //     email: contact.email || "",
  //     phone: contact.phone || contact.whatsapp || "",
  //     address:
  //       [
  //         pageForm.location?.villageName,
  //         pageForm.location?.townName,
  //         pageForm.location?.districtName,
  //       ]
  //         .filter(Boolean)
  //         .join(", ") || "N/A",
  //     city:
  //       pageForm.location?.townName ||
  //       pageForm.location?.districtName ||
  //       "N/A",
  //     country: countryName,
  //     items: pageForm.title || "Page Creation",
  //     metadata: {
  //       pageType: pageType?.name,
  //       pageTypeId: pageType?._id,
  //       countryCode,
  //       imagesCost,
  //       totalImages: metadata.imageCount || 0,
  //       category: pageForm.category,
  //       ...metadata,
  //     },
  //   };

  //   console.log("💳 Initializing payment...", paymentDetails);

  //   // 1️⃣ Start payment
  //   const result = await store.dispatch(
  //     paymentApi.endpoints.startPayment.initiate(paymentDetails)
  //   );

  //   if (result.error) {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Payment Error",
  //       text: "Failed to initialize payment. Please try again.",
  //     });
  //     return false;
  //   }

  //   const { hash, merchant_id } = result.data;

  //   // 2️⃣ PayHere payment object
  //   const payment = {
  //     sandbox: true, // ❗ set false in production
  //     merchant_id,
  //     return_url: `${window.location.origin}/payment/success`,
  //     cancel_url: `${window.location.origin}/payment/cancel`,
  //     notify_url: "http://localhost:4000/payment/notify",
  //     order_id: orderId,
  //     items: paymentDetails.items,
  //     amount: paymentDetails.amount,
  //     currency: paymentDetails.currency,
  //     first_name: paymentDetails.first_name,
  //     last_name: paymentDetails.last_name,
  //     email: paymentDetails.email,
  //     phone: paymentDetails.phone,
  //     address: paymentDetails.address,
  //     city: paymentDetails.city,
  //     country: paymentDetails.country,
  //     hash,
  //   };

  //   // 3️⃣ Open PayHere and handle callbacks
  //   return new Promise((resolve) => {
  //     // ✅ SUCCESS CALLBACK
  //     window.payhere.onCompleted = async (paymentId) => {
  //       console.log("✅ PayHere completed:", paymentId);

  //       try {
  //         const verifyResult = await store.dispatch(
  //           paymentApi.endpoints.verifyPayment.initiate({
  //             orderId: payment.order_id,
  //           })
  //         );

  //         if (verifyResult.data?.status === "completed") {
  //           Swal.fire({
  //             icon: "success",
  //             title: "Payment Successful",
  //             text: "Your page will be created now.",
  //             timer: 2000,
  //             showConfirmButton: false,
  //           });

  //           resolve(true); // ✅ ONLY SUCCESS PATH
  //         } else {
  //           Swal.fire({
  //             icon: "error",
  //             title: "Payment Failed",
  //             text: "Payment was not completed. Page not created.",
  //           });

  //           resolve(false); // ❌ BLOCK PAGE
  //         }
  //       } catch (err) {
  //         console.error("❌ Verification error:", err);

  //         Swal.fire({
  //           icon: "error",
  //           title: "Verification Failed",
  //           text: "Unable to verify payment. Page not created.",
  //         });

  //         resolve(false); // ❌ BLOCK PAGE
  //       }
  //     };

  //     // ❌ USER CLOSED POPUP
  //     window.payhere.onDismissed = () => {
  //       Swal.fire({
  //         icon: "info",
  //         title: "Payment Cancelled",
  //         text: "You closed the payment window.",
  //       });

  //       resolve(false); // ❌ NO PAGE
  //     };

  //     // ❌ CARD ERROR (Limit exceeded / Do not honor)
  //     window.payhere.onError = (err) => {
  //       console.error("❌ PayHere error:", err);

  //       Swal.fire({
  //         icon: "error",
  //         title: "Payment Declined",
  //         text: err || "Card declined (Limit exceeded / Do not honor)",
  //       });

  //       resolve(false); // ❌ NO PAGE
  //     };

  //     console.log("🚀 Opening PayHere popup...");
  //     window.payhere.startPayment(payment);
  //   });
  // } catch (err) {
  //   console.error("❌ Payment exception:", err);

  //   Swal.fire({
  //     icon: "error",
  //     title: "Payment Error",
  //     text: "An unexpected error occurred.",
  //   });

  //   return false;
  // }
};
