// functions/handlePayment.js
import { store } from "../store/store";
import { paymentApi } from "../features/paymentApiSlice";

export const handlePayment = async ({ adType, amount }) => {
  try {
    console.log(`💳 Starting payment for ${adType}, amount: ${amount}`);
    
    // Generate unique order ID
    const order_id = `AD-${Date.now()}`;
    
    // Prepare payment details to send to backend
    const paymentDetails = {
      order_id: order_id,
      amount: amount.toString(), // Convert to string
      currency: "LKR",
      first_name: "Saman",
      last_name: "Perera",
      email: "samanp@gmail.com",
      phone: "0771234567",
      address: "No.1, Galle Road",
      city: "Colombo",
      country: "Sri Lanka",
      items: "Advertisement Posting", // More descriptive
      // Store adType separately for your own tracking
      metadata: { adType }
    };

    // 1️⃣ Start payment via RTK Query - get hash from backend
    const result = await store.dispatch(
      paymentApi.endpoints.startPayment.initiate(paymentDetails)
    );

    if (result.error) {
      console.error("❌ Payment failed to start:", result.error);
      alert("Failed to initialize payment. Please try again.");
      return false;
    }

    const { hash, merchant_id } = result.data;

    // 2️⃣ Prepare PayHere payment object using the SAME details sent to backend
    const payment = {
      sandbox: true, // Use sandbox for testing
      merchant_id: merchant_id,
      return_url: "http://localhost:3000/payment/success", // Frontend return URL
      cancel_url: "http://localhost:3000/payment/cancel", // Frontend cancel URL
      notify_url: "http://localhost:4000/payment/notify", // Backend notify URL - must be publicly accessible
      order_id: paymentDetails.order_id,
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
      hash: hash, // Hash from backend
    };

    console.log("🔐 Payment object prepared:", payment);

    // 3️⃣ Check if PayHere is loaded
    if (!window.payhere) {
      console.error("⚠️ PayHere script not loaded!");
      alert("Payment gateway not loaded. Please refresh the page.");
      return false;
    }

    // 4️⃣ Set up PayHere event handlers
    return new Promise((resolve) => {
      window.payhere.onCompleted = function onCompleted(orderId) {
        console.log("✅ Payment completed. OrderID:", orderId);
        resolve(true);
      };

      window.payhere.onDismissed = function onDismissed() {
        console.log("❌ Payment dismissed by user");
        alert("Payment was cancelled");
        resolve(false);
      };

      window.payhere.onError = function onError(error) {
        console.error("❌ Payment error:", error);
        alert("Payment failed. Please try again.");
        resolve(false);
      };

      // 5️⃣ Trigger PayHere popup
      console.log("🚀 Opening PayHere popup...");
      window.payhere.startPayment(payment);
    });

  } catch (error) {
    console.error("❌ Payment Exception:", error);
    alert("An error occurred during payment. Please try again.");
    return false;
  }
};