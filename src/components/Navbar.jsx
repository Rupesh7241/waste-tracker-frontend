// frontend/src/components/Navbar.jsx

import { Link, useLocation } from 'react-router-dom';
import { useAuth }           from '../context/AuthContext';
import { Leaf, Menu, X, LogOut, User } from 'lucide-react';
import { useState }          from 'react';
import NotificationBell      from './NotificationBell';
import DarkModeToggle        from './DarkModeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location         = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const userLinks = [
    { to: '/dashboard',     label: 'Dashboard'       },
    { to: '/report',        label: 'Report Issue'    },
    { to: '/schedule',      label: 'Schedule Pickup' },
    { to: '/my-complaints', label: 'My Complaints'   },
  ];

  const adminLinks = [
    { to: '/admin',       label: 'Dashboard' },
    { to: '/admin/users', label: 'Users'     },
  ];

  const links = user?.role === 'admin' ? adminLinks : userLinks;

  const isActive = (path) =>
    location.pathname === path
      ? 'bg-green-700 text-white'
      : 'text-green-100 hover:bg-green-700 hover:text-white';

  return (
    <nav className="bg-green-800 dark:bg-gray-900 shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <Leaf className="text-green-300" size={24} />
            <span className="text-white font-semibold text-lg hidden sm:block">
              WasteTracker
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.to)}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            <NotificationBell />
            <DarkModeToggle />
            <div className="flex items-center gap-2 text-green-200 text-sm">
              <User size={16} />
              <span>{user?.name}</span>
              {user?.role === 'admin' && (
                <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-medium">
                  Admin
                </span>
              )}
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1 text-green-200 hover:text-white text-sm transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-green-200 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-green-900 dark:bg-gray-800 px-4 pb-4 space-y-1 transition-colors">

          {/* Dark mode toggle row in mobile menu */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-green-800 dark:border-gray-700 mb-1">
            <span className="text-green-200 dark:text-gray-300 text-sm">
              Dark Mode
            </span>
            <DarkModeToggle />
          </div>

          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.to)}`}
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 text-green-200 hover:text-white text-sm flex items-center gap-2"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}