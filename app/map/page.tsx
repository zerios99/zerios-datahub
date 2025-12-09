"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet } from "react-modal-sheet";
import "../modal-sheet.css";

declare global {
  interface Window {
    google: any;
  }
}

function MapPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editLocationId = searchParams.get("edit");
  const { user, loading } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Form state
  const [city, setCity] = useState("");
  const [popularPlaceName, setPopularPlaceName] = useState("");
  const [formalPlaceName, setFormalPlaceName] = useState("");
  const [street, setStreet] = useState("");
  const [side, setSide] = useState("");
  const [category, setCategory] = useState("");
  const [belongsToRoute, setBelongsToRoute] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [photoConfidence, setPhotoConfidence] = useState<"100" | "90">("100");
  const [notes, setNotes] = useState("");
  const [pointType, setPointType] = useState<"new" | "edit">("new");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(
    null
  );

  // Options for dropdowns
  const CITIES = [
    "دمشق",
    "ريف دمشق",
    "القنيطرة",
    "درعا",
    "السويداء",
    "حمص",
    "حماة",
    "طرطوس",
    "اللاذقية",
    "إدلب",
    "حلب",
    "الرقة",
    "دير الزور",
    "الحسكة",
  ];
  const CATEGORIES = [
    "🚐 موقف نقل",
    "📍 معلم معروف",
    "🛣️ جسر / نفق",
    "🚪 مدخل حي",
    "🛒 سوق / منطقة تجارية",
    "🏬 مول / مركز تسوق",
    "🕌 / ⛪ جامع / كنيسة",
    "🏥 مشفى / مركز طبي",
    "🎓 مدرسة / جامعة",
    "🚌 كراج / محطة نقل",
    "🍽️ مطعم / محل مشهور",
    "🌳 حديقة / ساحة",
    "⛽ محطة وقود",
    "🏛️ دائرة حكومية",
    "⚽ ملعب / نادي رياضي",
  ];

  // Mobile bottom sheet state
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch location stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/user/locations");
        if (response.ok) {
          const data = await response.json();
          const locations = data.locations || [];
          setStats({
            total: locations.length,
            approved: locations.filter((loc: any) => loc.status === "APPROVED")
              .length,
            rejected: locations.filter((loc: any) => loc.status === "REJECTED")
              .length,
            pending: locations.filter((loc: any) => loc.status === "PENDING")
              .length,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  // Load location data when editing
  useEffect(() => {
    const loadLocationForEdit = async () => {
      if (editLocationId && user) {
        try {
          setIsEditMode(true);
          setEditingLocationId(editLocationId);

          const response = await fetch("/api/user/locations");
          if (response.ok) {
            const data = await response.json();
            const location = data.locations.find(
              (loc: any) => loc.id === editLocationId
            );

            if (location) {
              // Pre-populate form fields
              setPopularPlaceName(location.name);
              setCity(location.city);
              setCategory(location.category);
              setSelectedLocation({
                lat: location.latitude,
                lng: location.longitude,
              });

              // Set point type to edit
              setPointType("edit");

              // Open bottom sheet on mobile
              if (window.innerWidth < 768) {
                setIsBottomSheetOpen(true);
              }
            }
          }
        } catch (error) {
          console.error("Error loading location for edit:", error);
          setMessage({
            type: "error",
            text: "Failed to load location data",
          });
        }
      }
    };

    if (editLocationId && user) {
      loadLocationForEdit();
    }
  }, [editLocationId, user]);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=ar`;
        script.async = true;
        script.defer = true;
        script.onload = () => initMap();
        document.head.appendChild(script);
        return;
      }

      if (mapRef.current && window.google) {
        // Get current location or fallback to Damascus
        const getCurrentLocation = () => {
          return new Promise<{ lat: number; lng: number }>((resolve) => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                  });
                },
                () => {
                  // Fallback to Damascus
                  resolve({ lat: 33.5138, lng: 36.2765 });
                }
              );
            } else {
              resolve({ lat: 33.5138, lng: 36.2765 });
            }
          });
        };

        getCurrentLocation().then((center) => {
          const mapInstance = new window.google.maps.Map(mapRef.current!, {
            center,
            zoom: 15,
            mapTypeId: "hybrid",
            mapTypeControl: false,
            fullscreenControl: false,
            gestureHandling: "greedy", // Allow single-finger dragging on mobile
            language: "ar", // Arabic language
          });

          setMap(mapInstance);

          // Set initial selectedLocation to map center
          setSelectedLocation({
            lat: center.lat,
            lng: center.lng,
          });

          // Update selectedLocation when map center changes (drag)
          mapInstance.addListener("center_changed", () => {
            const mapCenter = mapInstance.getCenter();
            if (mapCenter) {
              setSelectedLocation({
                lat: mapCenter.lat(),
                lng: mapCenter.lng(),
              });
            }
          });

          // Open bottom sheet on mobile when map is first clicked/dragged
          mapInstance.addListener("dragstart", () => {
            if (window.innerWidth < 768 && !isBottomSheetOpen) {
              setIsBottomSheetOpen(true);
            }
          });
        });
      }
    };

    if (user) {
      initMap();
    }
  }, [user, isBottomSheetOpen]);

  // When editing, center map on the location
  useEffect(() => {
    if (map && selectedLocation && isEditMode) {
      map.setCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    }
  }, [map, selectedLocation, isEditMode]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      try {
        const response = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
          }),
        });

        if (!response.ok) throw new Error("Failed to get upload URL");

        const { uploadUrl, fileUrl } = await response.json();

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResponse.ok) throw new Error("Failed to upload file");

        uploadedUrls.push(fileUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLocation) {
      setMessage({
        type: "error",
        text: "Please select a location on the map",
      });
      return;
    }

    if (!popularPlaceName || !city || !street || !side || !category) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }

    if (images.length === 0 && !isEditMode) {
      setMessage({ type: "error", text: "Please add at least one photo" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages(images);
      }

      const locationData = {
        name: popularPlaceName,
        formalPlaceName,
        city,
        street,
        side,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        category,
        belongsToRoute,
        photoConfidence,
        notes,
        pointType,
        isSponsored: false,
        ...(imageUrls.length > 0 && { images: imageUrls }),
      };

      let response;
      if (isEditMode && editingLocationId) {
        // Update existing location
        response = await fetch(`/api/user/locations/${editingLocationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(locationData),
        });
      } else {
        // Create new location
        response = await fetch("/api/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...locationData,
            images: imageUrls,
          }),
        });
      }

      if (!response.ok) throw new Error("Failed to save location");

      setMessage({
        type: "success",
        text: isEditMode
          ? "Location updated successfully! It will be reviewed by admin."
          : "Location saved successfully! It will be reviewed by admin.",
      });

      // Reset form and redirect after a delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error saving location:", error);
      setMessage({
        type: "error",
        text: "Failed to save location. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCity("");
    setPopularPlaceName("");
    setFormalPlaceName("");
    setStreet("");
    setSide("");
    setCategory("");
    setBelongsToRoute("");
    setImages([]);
    setPhotoConfidence("100");
    setNotes("");
    setPointType("new");
    setSelectedLocation(null);
    setMessage(null);
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    setIsBottomSheetOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-3 text-base" dir="rtl">
      <h2 className="text-xl font-bold text-white text-center mt-4 mb-3">
        {isEditMode ? "تعديل الموقع" : "نظام تجميع النقاط"}
      </h2>
      <div className="flex gap-2">
        <button
          onClick={() => setPointType("new")}
          className={`flex-1 py-3 rounded-full text-base font-medium transition-colors ${
            pointType === "new"
              ? "bg-gray-700 text-white border border-gray-600"
              : "bg-gray-800 text-gray-400 border border-gray-700"
          }`}
        >
          نقطة جديدة
        </button>
        <button
          onClick={() => setPointType("edit")}
          className={`flex-1 py-3 rounded-full text-base font-medium transition-colors ${
            pointType === "edit"
              ? "bg-gray-700 text-white border border-gray-600"
              : "bg-gray-800 text-gray-400 border border-gray-700"
          }`}
        >
          تعديل نقطة
        </button>
      </div>

      {/* City */}
      <div>
        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <select
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full pr-14 pl-6 py-4 bg-gray-800 border border-gray-700 rounded-[28px] text-white text-base focus:outline-none focus:ring-2 focus:ring-gray-600 appearance-none"
            style={{ direction: "rtl" }}
            required
          >
            <option value="">المدينة</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Popular place name */}
      <div>
        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            id="popularPlaceName"
            value={popularPlaceName}
            onChange={(e) => setPopularPlaceName(e.target.value)}
            placeholder="الاسم الشائع للمكان (مطلوب)"
            className="w-full pr-14 pl-6 py-4 bg-gray-800 border border-gray-700 rounded-[28px] text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
            style={{ direction: "rtl" }}
            required
          />
        </div>
      </div>

      {/* Formal place name */}
      <div>
        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            id="formalPlaceName"
            value={formalPlaceName}
            onChange={(e) => setFormalPlaceName(e.target.value)}
            placeholder="الاسم الرسمي للمكان"
            className="w-full pr-14 pl-6 py-4 bg-gray-800 border border-gray-700 rounded-[28px] text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
            style={{ direction: "rtl" }}
          />
        </div>
      </div>

      {/* Street */}
      <div>
        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            id="street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="الشارع (مطلوب)"
            className="w-full pr-14 pl-6 py-4 bg-gray-800 border border-gray-700 rounded-[28px] text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
            style={{ direction: "rtl" }}
            required
          />
        </div>
      </div>

      {/* Side */}
      <div>
        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            id="side"
            value={side}
            onChange={(e) => setSide(e.target.value)}
            placeholder="الجانب"
            className="w-full pr-14 pl-6 py-4 bg-gray-800 border border-gray-700 rounded-[28px] text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
            style={{ direction: "rtl" }}
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full pr-14 pl-6 py-4 bg-gray-800 border border-gray-700 rounded-[28px] text-white text-base focus:outline-none focus:ring-2 focus:ring-gray-600 appearance-none"
            style={{ direction: "rtl" }}
            required
          >
            <option value="">التصنيف</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Belongs to route */}
      <div>
        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            id="belongsToRoute"
            value={belongsToRoute}
            onChange={(e) => setBelongsToRoute(e.target.value)}
            placeholder="ينتمي إلى مسار"
            className="w-full pr-14 pl-6 py-4 bg-gray-800 border border-gray-700 rounded-[28px] text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
            style={{ direction: "rtl" }}
          />
        </div>
      </div>

      {/* Photo Upload and Confidence */}
      <div className="flex gap-3 items-start">
        {/* Upload Button */}
        <label
          htmlFor="images"
          className="flex-shrink-0 w-32 h-32 bg-gray-800 border border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-750"
        >
          <svg
            className="w-10 h-10 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-gray-400 text-sm">رفع صورة</span>
          <input
            type="file"
            id="images"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          {images.length > 0 && (
            <span className="text-xs text-gray-500 mt-1">
              ({images.length})
            </span>
          )}
        </label>

        {/* Confidence Radio Buttons */}
        <div className="flex-1 flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="photoConfidence"
              value="100"
              checked={photoConfidence === "100"}
              onChange={() => setPhotoConfidence("100")}
              className="w-6 h-6 text-white bg-gray-800 border-gray-600 focus:ring-2 focus:ring-gray-600"
            />
            <span className="text-white text-base">متأكد 100%</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="photoConfidence"
              value="90"
              checked={photoConfidence === "90"}
              onChange={() => setPhotoConfidence("90")}
              className="w-6 h-6 text-white bg-gray-800 border-gray-600 focus:ring-2 focus:ring-gray-600"
            />
            <span className="text-white text-base">متأكد 90% أو أقل</span>
          </label>
        </div>
      </div>

      {/* Notes */}
      <div>
        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظة"
            className="w-full pr-14 pl-6 py-4 bg-gray-800 border border-gray-700 rounded-[28px] text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
            style={{ direction: "rtl" }}
          />
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-base ${
            message.type === "success"
              ? "bg-green-900/50 text-green-200 border border-green-800"
              : "bg-red-900/50 text-red-200 border border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !selectedLocation}
        className="w-full bg-gray-800 text-white py-5 px-6 rounded-[28px] text-lg font-semibold border border-gray-700 hover:bg-gray-750 focus:outline-none focus:ring-2 focus:ring-gray-600 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "جاري الحفظ..." : isEditMode ? "تحديث الموقع" : "حفظ"}
      </button>
    </form>
  );

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-96 bg-gray-900 shadow-lg flex-col shrink-0 border-r border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="بحث عن موقع"
                className="w-full px-4 py-3 pr-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
                dir="rtl"
              />
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="shrink-0 w-12 h-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full flex items-center justify-center hover:bg-gray-750/50 transition-colors"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-2xl p-3 text-center border border-gray-700">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-gray-400 mt-1">المجموع</div>
            </div>
            <div className="bg-green-900/30 rounded-2xl p-3 text-center border border-green-800">
              <div className="text-2xl font-bold text-green-400">
                {stats.approved}
              </div>
              <div className="text-xs text-green-400 mt-1">موافق</div>
            </div>
            <div className="bg-red-900/30 rounded-2xl p-3 text-center border border-red-800">
              <div className="text-2xl font-bold text-red-400">
                {stats.rejected}
              </div>
              <div className="text-xs text-red-400 mt-1">مرفوض</div>
            </div>
            <div className="bg-yellow-900/30 rounded-2xl p-3 text-center border border-yellow-800">
              <div className="text-2xl font-bold text-yellow-400">
                {stats.pending}
              </div>
              <div className="text-xs text-yellow-400 mt-1">قيد الانتظار</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
          {formContent}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        {/* Fixed Center Marker/Crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full pointer-events-none z-20">
          <svg
            width="40"
            height="56"
            viewBox="0 0 40 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl"
          >
            {/* Map pin shape with gradient */}
            <defs>
              <radialGradient id="pinGradient" cx="50%" cy="30%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="50%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#B91C1C" />
              </radialGradient>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                <feOffset dx="0" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Pin body */}
            <path
              d="M20 0C11.163 0 4 7.163 4 16C4 28 20 52 20 52C20 52 36 28 36 16C36 7.163 28.837 0 20 0Z"
              fill="url(#pinGradient)"
              stroke="white"
              strokeWidth="2"
              filter="url(#shadow)"
            />
            
            {/* Inner white circle */}
            <circle 
              cx="20" 
              cy="15" 
              r="6" 
              fill="white" 
              opacity="0.95"
            />
            
            {/* Inner red dot */}
            <circle 
              cx="20" 
              cy="15" 
              r="3" 
              fill="#DC2626"
            />
          </svg>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden absolute top-0 left-0 right-0 bg-transparent backdrop-blur-sm shadow-sm z-10 border-b border-gray-800/30">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="بحث عن موقع"
                  className="w-full px-4 py-3 pr-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600"
                  dir="rtl"
                />
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="shrink-0 w-12 h-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full flex items-center justify-center hover:bg-gray-750/50 transition-colors"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile: Add Details Button */}
        {isMobile && !isBottomSheetOpen && (
          <button
            onClick={() => {
              setIsBottomSheetOpen(true);
            }}
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg font-medium z-10 flex items-center gap-2 border border-red-600"
          >
            <span>إضافة التفاصيل</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <Sheet
          isOpen={isBottomSheetOpen}
          onClose={() => {
            setSelectedLocation(null);
            if (markerRef.current) {
              markerRef.current.setMap(null);
              markerRef.current = null;
            }
            setIsBottomSheetOpen(false);
          }}
          snapPoints={[0.85, 0.5, 0.3, 0.2]}
          initialSnap={2}
        >
          <Sheet.Container style={{ backgroundColor: 'rgb(17, 24, 39)' }}>
            <Sheet.Header style={{ backgroundColor: 'rgb(17, 24, 39)', borderBottom: '1px solid rgb(31, 41, 55)' }}>
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <button
                  onClick={() => {
                    setSelectedLocation(null);
                    if (markerRef.current) {
                      markerRef.current.setMap(null);
                      markerRef.current = null;
                    }
                    setIsBottomSheetOpen(false);
                  }}
                  className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-750 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="flex-1 flex justify-center">
                  <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
                </div>
                <div className="w-10 h-10" /> {/* Spacer for centering */}
              </div>
            </Sheet.Header>
            <Sheet.Content style={{ backgroundColor: 'rgb(17, 24, 39)' }}>
              <div className="overflow-y-auto">
                {/* Stats Section */}
                <div className="px-4 pb-3 border-b border-gray-800">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-gray-800 rounded-2xl p-3 text-center border border-gray-700">
                      <div className="text-2xl font-bold text-white">
                        {stats.total}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">المجموع</div>
                    </div>
                    <div className="bg-green-900/30 rounded-2xl p-3 text-center border border-green-800">
                      <div className="text-2xl font-bold text-green-400">
                        {stats.approved}
                      </div>
                      <div className="text-xs text-green-400 mt-1">موافق</div>
                    </div>
                    <div className="bg-red-900/30 rounded-2xl p-3 text-center border border-red-800">
                      <div className="text-2xl font-bold text-red-400">
                        {stats.rejected}
                      </div>
                      <div className="text-xs text-red-400 mt-1">مرفوض</div>
                    </div>
                    <div className="bg-yellow-900/30 rounded-2xl p-3 text-center border border-yellow-800">
                      <div className="text-2xl font-bold text-yellow-400">
                        {stats.pending}
                      </div>
                      <div className="text-xs text-yellow-400 mt-1">
                        قيد الانتظار
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 bg-gray-900">
                  {formContent}
                </div>
              </div>
            </Sheet.Content>
          </Sheet.Container>
          <Sheet.Backdrop />
        </Sheet>
      )}
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  );
}
