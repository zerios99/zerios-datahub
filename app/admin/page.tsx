'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Stats {
  totalUsers: number;
  totalLocations: number;
  pendingLocations: number;
  approvedLocations: number;
  rejectedLocations: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      setDarkMode(savedMode === "true");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className={`mt-4 ${darkMode ? "text-white/70" : "text-gray-600"}`}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-40 p-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden fixed inset-0 bg-black/50 z-20" />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 backdrop-blur-xl shadow-2xl z-30 transform transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${
          darkMode
            ? "bg-gradient-to-b from-slate-900/90 via-slate-800/90 to-gray-900/90 border-white/10"
            : "bg-white/60 border-white/40"
        } border-r`}
      >
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute top-6 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 border-b border-gray-700 dark:border-gray-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className={`text-sm mt-1 truncate ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {user.name}
          </p>
        </div>
        
        <nav className="mt-6">
          <Link
            href="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-l-4 border-blue-400 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center px-6 py-3 transition-all duration-200 border-l-4 border-transparent ${
              darkMode
                ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Users
          </Link>
          <Link
            href="/admin/locations"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center px-6 py-3 transition-all duration-200 border-l-4 border-transparent ${
              darkMode
                ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Locations
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700 dark:border-gray-800 space-y-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-all duration-200 ${
              darkMode
                ? "text-gray-300 hover:bg-gray-700/50"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {darkMode ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Light Mode
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Dark Mode
              </>
            )}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-all duration-200 ${
              darkMode
                ? "text-gray-300 hover:bg-gray-700/50"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-6 lg:p-8">
        <h2 className={`text-2xl font-bold mb-8 ${darkMode ? "text-white" : "text-gray-900"}`}>Dashboard Overview</h2>

        {loadingStats ? (
          <div className={`text-center p-12 ${darkMode ? "text-white/70" : "text-gray-500"}`}>
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p>Loading stats...</p>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`backdrop-blur-xl rounded-xl shadow-lg p-6 border ${
              darkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
            }`}>
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${darkMode ? "bg-blue-500/20" : "bg-blue-100"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? "text-blue-400" : "text-blue-600"}`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${darkMode ? "text-white/70" : "text-gray-500"}`}>Total Users</p>
                  <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className={`backdrop-blur-xl rounded-xl shadow-lg p-6 border ${
              darkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
            }`}>
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${darkMode ? "bg-indigo-500/20" : "bg-indigo-100"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${darkMode ? "text-white/70" : "text-gray-500"}`}>Total Locations</p>
                  <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{stats.totalLocations}</p>
                </div>
              </div>
            </div>

            <div className={`backdrop-blur-xl rounded-xl shadow-lg p-6 border ${
              darkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
            }`}>
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${darkMode ? "bg-yellow-500/20" : "bg-yellow-100"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${darkMode ? "text-white/70" : "text-gray-500"}`}>Pending Review</p>
                  <p className={`text-2xl font-bold ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>{stats.pendingLocations}</p>
                </div>
              </div>
            </div>

            <div className={`backdrop-blur-xl rounded-xl shadow-lg p-6 border ${
              darkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
            }`}>
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${darkMode ? "bg-green-500/20" : "bg-green-100"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? "text-green-400" : "text-green-600"}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${darkMode ? "text-white/70" : "text-gray-500"}`}>Approved</p>
                  <p className={`text-2xl font-bold ${darkMode ? "text-green-400" : "text-green-600"}`}>{stats.approvedLocations}</p>
                </div>
              </div>
            </div>

            <div className={`backdrop-blur-xl rounded-xl shadow-lg p-6 border ${
              darkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
            }`}>
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${darkMode ? "bg-red-500/20" : "bg-red-100"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? "text-red-400" : "text-red-600"}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${darkMode ? "text-white/70" : "text-gray-500"}`}>Rejected</p>
                  <p className={`text-2xl font-bold ${darkMode ? "text-red-400" : "text-red-600"}`}>{stats.rejectedLocations}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`text-center p-12 ${darkMode ? "text-white/70" : "text-gray-500"}`}>
            Failed to load stats
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/locations?status=PENDING"
              className={`backdrop-blur-xl rounded-xl shadow-lg p-6 hover:shadow-xl transition-all flex items-center border ${
                darkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
              }`}
            >
              <div className={`p-3 rounded-lg mr-4 ${darkMode ? "bg-yellow-500/20" : "bg-yellow-100"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>Review Pending Locations</p>
                <p className={`text-sm ${darkMode ? "text-white/60" : "text-gray-500"}`}>{stats?.pendingLocations || 0} locations waiting for review</p>
              </div>
            </Link>

            <Link
              href="/admin/users"
              className={`backdrop-blur-xl rounded-xl shadow-lg p-6 hover:shadow-xl transition-all flex items-center border ${
                darkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
              }`}
            >
              <div className={`p-3 rounded-lg mr-4 ${darkMode ? "bg-blue-500/20" : "bg-blue-100"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? "text-blue-400" : "text-blue-600"}`} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
              </div>
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>Manage Users</p>
                <p className={`text-sm ${darkMode ? "text-white/60" : "text-gray-500"}`}>Add, edit, or remove users</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
