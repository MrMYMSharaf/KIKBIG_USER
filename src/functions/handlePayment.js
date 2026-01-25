// functions/handlePayment.js
import { store } from "../store/store";
import { paymentApi } from "../features/paymentApiSlice";
import Swal from "sweetalert2";

export const handlePayment = async ({
  adType,
  amount,
  currency,
  countryCode,
}) => {

  //-----------------------------------
  Swal.fire({
    icon: "info",
    title: "Payments Not Available",
    text: "Sorry, we don’t have a payment gateway at the moment. Currently, only free ads are supported.",
    confirmButtonText: "OK",
  });

  // ✅ Treat as successful so ad posting flow can continue
  return false;
  //-----------------------------------
  // try {
  //   const state = store.getState();
  //   const adForm = state.adPost.formData;
  //   const contact = adForm.contact || {};

  //   // ✅ Unique order ID
  //   const orderId = `AD-${Date.now()}`;

  //   const countryMap = {
  //     LK: "Sri Lanka",
  //     US: "United States",
  //     AU: "Australia",
  //   };

  //   const countryName = countryMap[countryCode] || "Sri Lanka";

  //   // 🔥 Payment details to backend
  //   const paymentDetails = {
  //     orderId,
  //     payfor: "Advertisement",
  //     amount: Number(amount).toFixed(2),
  //     currency,
  //     first_name: contact.first_name || "User",
  //     last_name: contact.last_name || "",
  //     email: contact.email || "",
  //     phone: contact.phone || "",
  //     address: "N/A",
  //     city: "N/A",
  //     country: countryName,
  //     items: adForm.title || "Advertisement",
  //     metadata: {
  //       adType,
  //       countryCode,
  //       adId: adForm._id,
  //     },
  //   };

  //   // 1️⃣ Start payment (backend reads user from cookie)
  //   const result = await store.dispatch(
  //     paymentApi.endpoints.startPayment.initiate(paymentDetails)
  //   );

  //   if (result.error) {
  //     console.error("❌ Payment initialization failed:", result.error);
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Payment Error',
  //       text: 'Failed to initialize payment. Please try again.',
  //     });
  //     return false;
  //   }

  //   const { hash, merchant_id } = result.data;

  //   // 2️⃣ Prepare PayHere payment object
  //   const payment = {
  //     sandbox: true,
  //     merchant_id,
  //     return_url: "http://localhost:5173/payment/success",
  //     cancel_url: "http://localhost:5173/payment/cancel",
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

  //   // 3️⃣ Start PayHere payment and handle callbacks
  //   return new Promise((resolve) => {
  //     window.payhere.onCompleted = async () => {
  //       // console.log("✅ PayHere COMPLETED | Order:", payment.order_id);

  //       // Show SweetAlert notification immediately
  //       Swal.fire({
  //         icon: 'success',
  //         title: 'Payment Completed!',
  //         text: 'Verification in progress. You will receive confirmation shortly.',
  //         showConfirmButton: true,
  //         confirmButtonText: 'OK',
  //         timer: 5000, // auto-close after 5s
  //       });

  //       try {
  //         // 4️⃣ Call backend to verify payment
  //         const verifyResult = await store.dispatch(
  //           paymentApi.endpoints.verifyPayment.initiate({ orderId: payment.order_id })
  //         );

  //         if (verifyResult.data?.status === "completed") {
  //           // console.log("Payment verified ✅", verifyResult.data);
  //         } else {
  //           console.warn("Payment not verified ❌", verifyResult.data);
  //         }
  //       } catch (err) {
  //         console.error("Payment verification failed:", err);
  //       }

  //       resolve(true); // Resolve immediately so UX is smooth
  //     };

  //     window.payhere.onDismissed = () => {
  //       console.log("⚠️ Payment dismissed by user");
  //       Swal.fire({
  //         icon: 'info',
  //         title: 'Payment Cancelled',
  //         text: 'You closed the payment window.',
  //       });
  //       resolve(false);
  //     };

  //     window.payhere.onError = (err) => {
  //       console.error("❌ PayHere ERROR:", err);
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Payment Error',
  //         text: 'Something went wrong during payment.',
  //       });
  //       resolve(false);
  //     };

  //     // console.log("🚀 Starting PayHere payment popup...");
  //     window.payhere.startPayment(payment);
  //   });
  // } catch (err) {
  //   console.error("❌ Payment exception:", err);
  //   Swal.fire({
  //     icon: 'error',
  //     title: 'Payment Exception',
  //     text: 'An error occurred while processing your payment.',
  //   });
  //   return false;
  // }
};
