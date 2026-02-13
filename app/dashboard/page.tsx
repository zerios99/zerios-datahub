"use client";

import { useState, useEffect } from "react";
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
  const itemsPerPage = 12;

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
              <p className="text-gray-600 mt-1">مرحباً، {user?.name}</p>
            </div>
            <Link
              href="/map"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              + إضافة موقع جديد
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">إجمالي المواقع</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {locations.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">موافق عليها</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {locations.filter((loc) => loc.status === "APPROVED").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">قيد المراجعة</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {locations.filter((loc) => loc.status === "PENDING").length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="ابحث عن موقع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-600">جاري التحميل...</p>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">لم يتم العثور على مواقع</p>
            <Link
              href="/map"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition">
      {location.images && location.images.length > 0 ? (
        <img
          src={location.images[0]}
          alt={location.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
          <p className="text-gray-400">لا توجد صورة</p>
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {location.name}
        </h3>
        <p className="text-sm text-gray-600 mt-1">{location.city}</p>
        <p className="text-xs text-gray-500 mt-1">{location.category}</p>

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
            className="flex-1 text-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
          >
            تعديل
          </Link>
          <button
            onClick={onDelete}
            className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
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
