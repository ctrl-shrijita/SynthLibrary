import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-md border border-slate-200 bg-white p-6 text-slate-600">Loading session...</div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"} replace />;
  }

  return children;
}
