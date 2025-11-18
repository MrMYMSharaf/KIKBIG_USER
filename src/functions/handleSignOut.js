// ../../functions/handleSignOut.js
export const useSignOut = () => {

  const signOut = () => {
    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Redirect to login and reload page
    window.location.replace("/auth"); // replaces current history entry
  };

  return signOut;
};
