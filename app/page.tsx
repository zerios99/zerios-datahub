"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      setDarkMode(savedMode === "true");
    }
  }, []);

  // Save dark mode preference to localStorage
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
  };

  return (
    <div
      className={`flex min-h-screen items-center justify-center relative overflow-hidden transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse ${
            darkMode ? "bg-blue-600" : "bg-blue-400"
          }`}
        ></div>
        <div
          className={`absolute top-40 right-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000 ${
            darkMode ? "bg-cyan-600" : "bg-purple-400"
          }`}
        ></div>
        <div
          className={`absolute -bottom-20 left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000 ${
            darkMode ? "bg-slate-600" : "bg-pink-400"
          }`}
        ></div>
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-20">
        <div className="max-w-7xl mx-auto">
          <div
            className={`backdrop-blur-xl rounded-2xl border shadow-lg p-3 sm:p-4 ${
              darkMode
                ? "bg-white/5 border-white/10"
                : "bg-white/60 border-white/40"
            }`}
          >
            <div className="flex justify-between items-center">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    darkMode
                      ? "bg-gradient-to-br from-blue-600/30 to-cyan-600/30"
                      : "bg-gradient-to-br from-blue-500/30 to-purple-500/30"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 ${darkMode ? "text-white" : "text-gray-900"}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <span
                  className={`font-bold text-lg hidden sm:block ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  MapManager
                </span>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3">
                {/* Dark mode toggle */}
                <button
                  onClick={toggleDarkMode}
                  className={`p-2.5 rounded-xl transition-all ${
                    darkMode
                      ? "bg-white/10 hover:bg-white/20 text-yellow-300"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                  title={
                    darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
                >
                  {darkMode ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 18a6 6 0 100-12 6 6 0 000 12zm0-2a4 4 0 110-8 4 4 0 010 8zm0-10a1 1 0 011 1v1a1 1 0 11-2 0V7a1 1 0 011-1zm0 14a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm8-8a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM7 12a1 1 0 01-1 1H5a1 1 0 110-2h1a1 1 0 011 1zm10.657-5.657a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zm-12.02 0a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm12.02 12.02a1 1 0 01-1.414 0l-.707-.707a1 1 0 111.414-1.414l.707.707a1 1 0 010 1.414zm-12.02 0a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                  )}
                </button>

                {loading ? null : user ? (
                  <>
                    <span
                      className={`text-sm hidden sm:block ${
                        darkMode ? "text-white/80" : "text-gray-600"
                      }`}
                    >
                      Hello, {user.name}
                    </span>
                    <Link
                      href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        darkMode
                          ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                          : "bg-blue-500/20 text-blue-600 hover:bg-blue-500/30"
                      }`}
                    >
                      {user.role === "ADMIN" ? "Admin" : "Dashboard"}
                    </Link>
                    <button
                      onClick={() => logout()}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        darkMode
                          ? "text-white/70 hover:text-white hover:bg-white/10"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      darkMode
                        ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                        : "bg-blue-500/20 text-blue-600 hover:bg-blue-500/30"
                    }`}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center gap-8 p-8 pt-32 sm:pt-36 relative z-10 max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div
            className={`inline-block px-4 py-2 rounded-full backdrop-blur-sm mb-4 ${
              darkMode
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
            }`}
          >
            <span className="text-sm font-medium">
              🗺️ Professional Location Management
            </span>
          </div>

          <h1
            className={`text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Map Location
            <span
              className={`block ${
                darkMode
                  ? "bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              }`}
            >
              Manager
            </span>
          </h1>

          <p
            className={`text-xl sm:text-2xl max-w-2xl mx-auto ${
              darkMode ? "text-white/70" : "text-gray-600"
            }`}
          >
            Add and manage locations with Google Maps integration seamlessly
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {user ? (
            <>
              <Link
                href="/map"
                className={`group px-8 py-4 rounded-xl font-semibold shadow-2xl transition-all transform hover:scale-105 text-center flex items-center justify-center space-x-2 ${
                  darkMode
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-blue-500/50"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-blue-500/50"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  <circle cx="12" cy="9" r="1.5" fill="white" />
                </svg>
                <span>Add New Location</span>
              </Link>
              <Link
                href="/dashboard"
                className={`px-8 py-4 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 text-center backdrop-blur-sm border-2 ${
                  darkMode
                    ? "bg-white/5 text-white border-white/20 hover:bg-white/10"
                    : "bg-white/60 text-blue-600 border-blue-600/30 hover:bg-white/80"
                }`}
              >
                My Locations
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className={`group px-8 py-4 rounded-xl font-semibold shadow-2xl transition-all transform hover:scale-105 text-center flex items-center justify-center space-x-2 ${
                  darkMode
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-blue-500/50"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-blue-500/50"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Get Started</span>
              </Link>
              <Link
                href="/login"
                className={`px-8 py-4 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 text-center backdrop-blur-sm border-2 ${
                  darkMode
                    ? "bg-white/5 text-white border-white/20 hover:bg-white/10"
                    : "bg-white/60 text-blue-600 border-blue-600/30 hover:bg-white/80"
                }`}
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Features Card */}
        <div
          className={`mt-12 p-8 rounded-3xl shadow-2xl max-w-3xl w-full backdrop-blur-xl border ${
            darkMode
              ? "bg-white/5 border-white/10"
              : "bg-white/60 border-white/40"
          }`}
        >
          <h2
            className={`text-3xl font-bold mb-6 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            ✨ Features
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                ),
                title: "Interactive Map",
                desc: "Click on map to select location coordinates",
              },
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                ),
                title: "Easy Tagging",
                desc: "Add name and category for each location",
              },
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ),
                title: "Sponsored Marks",
                desc: "Mark locations as sponsored",
              },
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                ),
                title: "Image Upload",
                desc: "Upload images to AWS S3 (optional)",
              },
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
                  </svg>
                ),
                title: "Database Storage",
                desc: "Save all data securely to database",
              },
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                  </svg>
                ),
                title: "Secure Access",
                desc: "User authentication and role management",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl transition-all hover:scale-105 ${
                  darkMode
                    ? "bg-white/5 hover:bg-white/10"
                    : "bg-white/50 hover:bg-white/70"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      darkMode
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-blue-500/20 text-blue-600"
                    }`}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <h3
                      className={`font-semibold mb-1 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-white/60" : "text-gray-600"
                      }`}
                    >
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-3xl mt-5 mb-15">
          {[
            { number: "10K+", label: "Locations" },
            { number: "500+", label: "Active Users" },
            { number: "99.9%", label: "Uptime" },
          ].map((stat, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl text-center backdrop-blur-xl border transition-all hover:scale-105 ${
                darkMode
                  ? "bg-white/5 border-white/10"
                  : "bg-white/60 border-white/40"
              }`}
            >
              <div
                className={`text-3xl font-bold mb-2 ${
                  darkMode
                    ? "bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                }`}
              >
                {stat.number}
              </div>
              <div
                className={`text-sm ${
                  darkMode ? "text-white/60" : "text-gray-600"
                }`}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`absolute bottom-0 left-0 right-0 p-6 text-center z-10 ${
          darkMode ? "text-white/40" : "text-gray-500"
        }`}
      ></footer>
    </div>
  );
}
