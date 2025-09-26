# KIKBIG_USER
KIKBIG_USER

Font-Hetilica

import React from "react";
import { useDispatch } from "react-redux";
import { useLogoutUserMutation } from "../redux/authApi";
import { logout } from "../redux/authSlice";

const LogoutButton = () => {
  const [logoutUser] = useLogoutUserMutation();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap(); // calls backend
    } catch (err) {
      console.error("Logout API failed:", err);
    }
    dispatch(logout()); // clear redux + localStorage
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;

