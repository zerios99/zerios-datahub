"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Location {
  id: string;
  name: string;
  city: string;
  category: string;
  latitude: number;
  longitude: number;
  images: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const itemsPerPage = 12;

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
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    fetchLocations();
  }, [currentPage, statusFilter]);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/user/locations?page=${currentPage}&limit=${itemsPerPage}&status=${statusFilter}`,
      );
      const data = await res.json();

      if (res.ok) {
        setLocations(data.locations);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const filtered = locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.city.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredLocations(filtered);
  }, [searchTerm, locations]);

  const handleDelete = async (locationId: string) => {
    try {
      const res = await fetch(`/api/user/locations/${locationId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setLocations(locations.filter((loc) => loc.id !== locationId));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className={`mt-4 ${darkMode ? "text-white/70" : "text-gray-600"}`}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "موافق عليه";
      case "REJECTED":
        return "مرفوض";
      case "PENDING":
      default:
        return "قيد المراجعة";
    }
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      {/* Header */}
      <div className={`backdrop-blur-xl shadow-lg ${darkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"}`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>لوحة التحكم</h1>
              <p className={darkMode ? "text-white/60 mt-1" : "text-gray-600 mt-1"}>مرحباً، {user?.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-xl transition-all ${
                  darkMode
                    ? "bg-white/10 hover:bg-white/20 text-yellow-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 18a6 6 0 100-12 6 6 0 000 12zm0-2a4 4 0 110-8 4 4 0 010 8zm0-10a1 1 0 011 1v1a1 1 0 11-2 0V7a1 1 0 011-1zm0 14a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm8-8a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM7 12a1 1 0 01-1 1H5a1 1 0 110-2h1a1 1 0 011 1zm10.657-5.657a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zm-12.02 0a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm12.02 12.02a1 1 0 01-1.414 0l-.707-.707a1 1 0 111.414-1.414l.707.707a1 1 0 010 1.414zm-12.02 0a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </button>
              <Link
                href="/map"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition font-medium"
              >
                + إضافة موقع جديد
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`backdrop-blur-xl rounded-xl shadow-lg p-6 border ${
            darkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
          }`}>
            <p className={darkMode ? "text-white/70 text-sm" : "text-gray-600 text-sm"}>إجمالي المواقع</p>
            <p className={`text-3xl font-bold mt-2 ${
              darkMode ? "bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent" : "text-gray-900"
            }`}>
              {locations.length}
            </p>
          </div>
          <div className={`backdrop-blur-xl rounded-xl shadow-lg p-6 border ${
            darkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
          }`}>
            <p className={darkMode ? "text-white/70 text-sm" : "text-gray-600 text-sm"}>موافق عليها</p>
            <p className="text-3xl font-bold text-green-500 mt-2">
              {locations.filter((loc) => loc.status === "APPROVED").length}
            </p>
          </div>
          <div className={`backdrop-blur-xl rounded-xl shadow-lg p-6 border ${
            darkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
          }`}>
            <p className={darkMode ? "text-white/70 text-sm" : "text-gray-600 text-sm"}>قيد المراجعة</p>
            <p className="text-3xl font-bold text-yellow-500 mt-2">
              {locations.filter((loc) => loc.status === "PENDING").length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className={`backdrop-blur-xl rounded-xl shadow-lg p-6 border ${
          darkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="ابحث عن موقع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode ? "bg-white/5 border-white/10 text-white placeholder-white/50" : "bg-white/60 border-white/40 text-gray-900"
              }`}
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode ? "bg-white/5 border-white/10 text-white" : "bg-white/60 border-white/40 text-gray-900"
              }`}
            >
              <option value="ALL">جميع الحالات</option>
              <option value="PENDING">قيد المراجعة</option>
              <option value="APPROVED">موافق عليه</option>
              <option value="REJECTED">مرفوض</option>
            </select>
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className={`backdrop-blur-xl rounded-xl shadow-lg p-12 text-center border ${
            darkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
          }`}>
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className={`mt-3 ${darkMode ? "text-white/70" : "text-gray-600"}`}>جاري التحميل...</p>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className={`backdrop-blur-xl rounded-xl shadow-lg p-12 text-center border ${
            darkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
          }`}>
            <p className={`text-lg ${darkMode ? "text-white/70" : "text-gray-500"}`}>لم يتم العثور على مواقع</p>
            <Link
              href="/map"
              className="mt-4 inline-block text-blue-500 hover:text-blue-400 font-medium"
            >
              أضف موقعك الأول الآن →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLocations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onDelete={() => setDeleteConfirm(location.id)}
                  getStatusBadgeColor={getStatusBadgeColor}
                  getStatusLabel={getStatusLabel}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode
                      ? "border border-white/10 text-white/70 hover:bg-white/10"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  السابق
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : darkMode
                            ? "border border-white/10 text-white/70 hover:bg-white/10"
                            : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {deleteConfirm && (
        <DeleteConfirmModal
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
          location={locations.find((loc) => loc.id === deleteConfirm)}
        />
      )}
    </div>
  );
}

function LocationCard({
  location,
  onDelete,
  getStatusBadgeColor,
  getStatusLabel,
}: any) {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      setDarkMode(savedMode === "true");
    }
  }, []);

  return (
    <div className={`backdrop-blur-xl rounded-xl shadow-lg hover:shadow-xl transition border ${
      darkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
    }`}>
      {location.images && location.images.length > 0 ? (
        <img
          src={location.images[0]}
          alt={location.name}
          className="w-full h-48 object-cover rounded-t-xl"
        />
      ) : (
        <div className={`w-full h-48 rounded-t-xl flex items-center justify-center ${
          darkMode ? "bg-gray-700" : "bg-gray-200"
        }`}>
          <p className={darkMode ? "text-gray-400" : "text-gray-500"}>لا توجد صورة</p>
        </div>
      )}
      <div className="p-4">
        <h3 className={`text-lg font-semibold line-clamp-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
          {location.name}
        </h3>
        <p className={`text-sm mt-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>{location.city}</p>
        <p className={`text-xs mt-1 ${darkMode ? "text-white/60" : "text-gray-500"}`}>{location.category}</p>

        <div className="mt-3 flex items-center justify-between">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
              location.status,
            )}`}
          >
            {getStatusLabel(location.status)}
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/map?edit=${location.id}`}
            className="flex-1 text-center px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition text-sm font-medium"
          >
            تعديل
          </Link>
          <button
            onClick={onDelete}
            className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm font-medium"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ onConfirm, onCancel, location }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm">
        <h3 className="text-lg font-semibold text-gray-900">تأكيد الحذف</h3>
        <p className="text-gray-600 mt-2">
          هل أنت متأكد من رغبتك في حذف "
          <span className="font-semibold">{location?.name}</span>"؟
        </p>
        <p className="text-sm text-gray-500 mt-1">
          هذا الإجراء لا يمكن التراجع عنه.
        </p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}
