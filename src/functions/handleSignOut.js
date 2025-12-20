// functions/handleSignOut.js
import { useLogoutUserMutation } from "../features/authSlice";
import { useDispatch } from "react-redux";
import { clearAuth } from "../features/redux/authSlice";
import { persistor } from "../store/store";

export const useSignOut = () => {
  const [logoutUser] = useLogoutUserMutation();
  const dispatch = useDispatch();

  const signOut = async () => {
    try {
      console.log("🔵 Logging out...");
      
      // 1️⃣ Call backend to clear HttpOnly cookies
      await logoutUser().unwrap();
      console.log("✅ Backend logout successful");
    } catch (err) {
      console.error("⚠️ Logout API failed:", err);
      // Continue with local cleanup even if API fails
    }

    // 2️⃣ Clear Redux state
    dispatch(clearAuth());

    // 3️⃣ Purge persisted state
    await persistor.purge();
    console.log("✅ Persisted state purged");

    // 4️⃣ Clear localStorage (backup)
    localStorage.clear();

    // 5️⃣ Clear sessionStorage
    sessionStorage.clear();

    // 6️⃣ Clear non-HttpOnly cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });

    console.log("✅ Logout complete, redirecting...");

    // 7️⃣ Redirect to login
    window.location.replace("/auth");
  };

  return signOut;
};