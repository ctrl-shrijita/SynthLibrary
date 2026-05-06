import { BookOpen, LayoutDashboard, Library, LogOut } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const linkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-white hover:text-slate-950"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/books" className="inline-flex items-center gap-2 text-lg font-bold text-slate-950">
          <Library className="h-6 w-6 text-emerald-600" />
          SynthLibrary
        </Link>

        {user ? (
          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/books" className={linkClass}>
              <BookOpen className="h-4 w-4" />
              Books
            </NavLink>
            <NavLink
              to={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
              className={linkClass}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
            <span className="rounded-md bg-white px-3 py-2 text-sm text-slate-600">{user.name}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-rose-200 hover:text-rose-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        ) : (
          <nav className="flex items-center gap-2">
            <NavLink to="/login" className={linkClass}>
              Login
            </NavLink>
            <NavLink to="/register" className={linkClass}>
              Register
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}
