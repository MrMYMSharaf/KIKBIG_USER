// functions/handlePayment.js
import { store } from "../store/store";
import { paymentApi } from "../features/paymentApiSlice";

export const handlePayment = async ({
  adType,
  amount,
  currency,
  countryCode,
}) => {
  try {
    const state = store.getState();
    const user = state.auth.user;
    const adForm = state.adPost.formData;
    const contact = adForm.contact || {};

    if (!user) {
      alert("User not logged in");
      return false;
    }

    // ✅ UNIQUE ORDER ID
    const orderId = `AD-${Date.now()}`;

    const countryMap = {
      LK: "Sri Lanka",
      US: "United States",
      AU: "Australia",
    };

    const countryName = countryMap[countryCode] || "Sri Lanka";

    // 🔥 SEND FULL DATA TO BACKEND
    const paymentDetails = {
      orderId,
      userId: user._id || user.id,
      payfor: "Advertisement",

      amount: Number(amount).toFixed(2),
      currency,

      first_name: user.firstName || user.name || "User",
      last_name: user.lastName || "",
      email: contact.email || user.email || "",
      phone: contact.phone || user.phone || "",
      address: "N/A",
      city: "N/A",
      country: countryName,

      items: adForm.title || "Advertisement",
      metadata: { adType, countryCode, adId: adForm._id },
    };

    // 1️⃣ CALL BACKEND /start to create pending payment
    const result = await store.dispatch(
      paymentApi.endpoints.startPayment.initiate(paymentDetails)
    );

    if (result.error) {
      console.error("❌ Payment initialization failed:", result.error);
      alert("Payment initialization failed");
      return false;
    }

    const { hash, merchant_id } = result.data;

    // 2️⃣ PREPARE PAYHERE PAYMENT OBJECT
    const payment = {
      sandbox: true,
      merchant_id,

      return_url: "http://localhost:5173/payment/success",
      cancel_url: "http://localhost:5173/payment/cancel",
      notify_url: "http://localhost:4000/payment/notify",

      order_id: orderId,
      items: paymentDetails.items,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,

      first_name: paymentDetails.first_name,
      last_name: paymentDetails.last_name,
      email: paymentDetails.email,
      phone: paymentDetails.phone,
      address: paymentDetails.address,
      city: paymentDetails.city,
      country: paymentDetails.country,

      hash,
    };

    // 3️⃣ START PAYHERE PAYMENT AND HANDLE CALLBACKS
    return new Promise((resolve) => {
      window.payhere.onCompleted = async () => {
        console.log("✅ PayHere COMPLETED | Order:", payment.order_id);

        try {
          // 4️⃣ CALL BACKEND VERIFY ENDPOINT
          const verifyResult = await store.dispatch(
            paymentApi.endpoints.verifyPayment.initiate({ orderId: payment.order_id })
          );

          if (verifyResult.data?.status === "completed") {
            console.log("Payment verified ✅", verifyResult.data);
            resolve(true); // Payment success
          } else {
            console.warn("Payment not verified ❌", verifyResult.data);
            resolve(false);
          }
        } catch (err) {
          console.error("Payment verification failed:", err);
          resolve(false);
        }
      };

      window.payhere.onDismissed = () => {
        console.log("⚠️ Payment dismissed by user");
        resolve(false);
      };

      window.payhere.onError = (err) => {
        console.error("❌ PayHere ERROR:", err);
        resolve(false);
      };

      console.log("🚀 Starting PayHere payment popup...");
      window.payhere.startPayment(payment);
    });
  } catch (err) {
    console.error("❌ Payment exception:", err);
    alert("Payment error occurred");
    return false;
  }
};
