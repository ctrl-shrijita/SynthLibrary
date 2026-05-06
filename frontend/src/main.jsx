import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import Books from "./pages/Books.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/books" replace /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      {
        path: "books",
        element: (
          <ProtectedRoute>
            <Books />
          </ProtectedRoute>
        )
      },
      {
        path: "admin/dashboard",
        element: (
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: "user/dashboard",
        element: (
          <ProtectedRoute role="user">
            <UserDashboard />
          </ProtectedRoute>
        )
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
