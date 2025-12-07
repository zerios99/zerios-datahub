"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Location } from "@/types/location";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchUserLocations();
    }
  }, [user]);

  const fetchUserLocations = async () => {
    try {
      const response = await fetch("/api/user/locations");
      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/map"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Add Location
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              Total Locations
            </h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {locations.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Approved</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {locations.filter((l) => l.status === "APPROVED").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {locations.filter((l) => l.status === "REJECTED").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {locations.filter((l) => l.status === "PENDING").length}
            </p>
          </div>
        </div>

        {/* Locations List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              My Locations
            </h2>
          </div>

          {loadingLocations ? (
            <div className="p-8 text-center text-gray-500">
              Loading locations...
            </div>
          ) : locations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">
                You haven&apos;t added any locations yet
              </p>
              <Link
                href="/map"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Location
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {locations.map((location) => (
                <div key={location.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {location.name}
                        </h3>
                        {getStatusBadge(location.status || "PENDING")}
                        {location.isSponsored && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                            Sponsored
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">City:</span>{" "}
                        {location.city}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Category:</span>{" "}
                        {location.category}
                      </p>
                      <p className="text-xs text-gray-500">
                        Coordinates: {location.latitude.toFixed(6)},{" "}
                        {location.longitude.toFixed(6)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {location.images && location.images.length > 0 && (
                        <img
                          src={location.images[0]}
                          alt={location.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <Link
                        href={`/map?edit=${location.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
