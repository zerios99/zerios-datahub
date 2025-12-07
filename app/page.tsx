"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, loading, logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-4">
        <div className="max-w-7xl mx-auto flex justify-end items-center gap-4">
          {loading ? null : user ? (
            <>
              <span className="text-gray-600 text-sm">Hello, {user.name}</span>
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                {user.role === "ADMIN" ? "Admin Panel" : "Dashboard"}
              </Link>
              <button
                onClick={() => logout()}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex flex-col items-center justify-center gap-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Map Location Manager
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            Add and manage locations with Google Maps integration
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {user ? (
            <>
              <Link
                href="/map"
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-center"
              >
                Add New Location
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-50 transition-colors text-center border-2 border-blue-600"
              >
                My Locations
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-center"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-50 transition-colors text-center border-2 border-blue-600"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-md max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Features
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="mr-2">📍</span>
              <span>Click on map to select location coordinates</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">📝</span>
              <span>Add name and category for each location</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">⭐</span>
              <span>Mark locations as sponsored</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">📸</span>
              <span>Upload images to AWS S3 (optional)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">💾</span>
              <span>Save all data to database</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
