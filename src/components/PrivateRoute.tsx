import { Navigate } from "react-router-dom";

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const isAuth = localStorage.getItem("auth") === "true";
  return isAuth ? children : <Navigate to="/" replace />;
};

export const RoleRoute = ({ children, role }: { children: JSX.Element; role: string }) => {
  const userRole = localStorage.getItem("role");
  return userRole === role ? children : <Navigate to="/" replace />;
};
