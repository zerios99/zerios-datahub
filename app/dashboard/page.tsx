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
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded">
            موافق
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded">
            مرفوض
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded">
            قيد المراجعة
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
              <p className="text-sm text-gray-400">Welcome, {user.name}</p>
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
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-gray-800 rounded-2xl p-4 text-center border border-gray-700">
            <div className="text-3xl font-bold text-white">
              {locations.length}
            </div>
            <div className="text-sm text-gray-400 mt-1">المجموع</div>
          </div>
          <div className="bg-green-900/30 rounded-2xl p-4 text-center border border-green-800">
            <div className="text-3xl font-bold text-green-400">
              {locations.filter((l) => l.status === "APPROVED").length}
            </div>
            <div className="text-sm text-green-400 mt-1">موافق</div>
          </div>
          <div className="bg-red-900/30 rounded-2xl p-4 text-center border border-red-800">
            <div className="text-3xl font-bold text-red-400">
              {locations.filter((l) => l.status === "REJECTED").length}
            </div>
            <div className="text-sm text-red-400 mt-1">مرفوض</div>
          </div>
          <div className="bg-yellow-900/30 rounded-2xl p-4 text-center border border-yellow-800">
            <div className="text-3xl font-bold text-yellow-400">
              {locations.filter((l) => l.status === "PENDING").length}
            </div>
            <div className="text-sm text-yellow-400 mt-1">قيد الانتظار</div>
          </div>
        </div>

        {/* Locations List */}
        <div className="bg-gray-800 rounded-lg shadow border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">My Locations</h2>
          </div>

          {loadingLocations ? (
            <div className="p-8 text-center text-gray-400">
              Loading locations...
            </div>
          ) : locations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 mb-4">
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
            <div className="divide-y divide-gray-700">
              {locations.map((location) => (
                <div key={location.id} className="p-6 hover:bg-gray-750">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-white">
                          {location.name}
                        </h3>
                        {getStatusBadge(location.status || "PENDING")}
                        {location.isSponsored && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                            Sponsored
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-1">
                        <span className="font-medium">City:</span>{" "}
                        {location.city}
                      </p>
                      <p className="text-sm text-gray-400 mb-1">
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
