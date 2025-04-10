import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // Ou récupérez le token des cookies
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;