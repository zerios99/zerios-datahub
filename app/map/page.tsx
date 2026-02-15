"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet } from "react-modal-sheet";
import Image from "next/image";
import "../modal-sheet.css";
import {
  FaBus,
  FaWarehouse,
  FaShoppingBag,
  FaShoppingCart,
  FaStore,
  FaUtensils,
  FaCoffee,
  FaGraduationCap,
  FaHospital,
  FaPills,
  FaMapMarkerAlt,
  FaMosque,
  FaWalking,
  FaCircle,
  FaTrafficLight,
  FaPlus,
  FaTree,
  FaLandmark,
  FaFlag,
  FaWrench,
  FaParking,
  FaGasPump,
  FaUniversity,
  FaMoneyBillWave,
  FaFutbol,
  FaGlassCheers,
  FaHotel,
  FaBreadSlice,
  FaHome,
  FaBuilding,
  FaPlane,
  FaCouch,
  FaUmbrellaBeach,
  FaAnchor,
  FaShip,
  FaRoad,
  FaSubway,
} from "react-icons/fa";

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
  const [path, setPath] = useState("");
  const [dir, setDir] = useState("");
  const [line, setLine] = useState("");
  const [category, setCategory] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [belongsToRoute, setBelongsToRoute] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [photoConfidence, setPhotoConfidence] = useState<number>(100);
  const [notes, setNotes] = useState("");
  const [pointType, setPointType] = useState<"NEW" | "EDIT">("NEW");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(
    null,
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
    { icon: FaBus, label: "موقف سرفيس / باص", value: "موقف سرفيس / باص" },
    { icon: FaWarehouse, label: "كراج / محطة نقل", value: "كراج / محطة نقل" },
    {
      icon: FaShoppingBag,
      label: "سوق / شارع تجاري / سوق شعبي",
      value: "سوق / شارع تجاري / سوق شعبي",
    },
    {
      icon: FaShoppingCart,
      label: "مول / مركز تجاري",
      value: "مول / مركز تجاري",
    },
    { icon: FaStore, label: "محل تجاري مشهور", value: "محل تجاري مشهور" },
    {
      icon: FaUtensils,
      label: "مطعم / قهوة مشهورة",
      value: "مطعم / قهوة مشهورة",
    },
    {
      icon: FaGraduationCap,
      label: "مدرسة / جامعة / معهد / روضة",
      value: "مدرسة / جامعة / معهد / روضة",
    },
    { icon: FaHospital, label: "مشفى / مركز طبي", value: "مشفى / مركز طبي" },
    { icon: FaPills, label: "صيدلية", value: "صيدلية" },
    { icon: FaMapMarkerAlt, label: "معلم معروف", value: "معلم معروف" },
    { icon: FaMosque, label: "جامع / كنيسة", value: "جامع / كنيسة" },
    { icon: FaRoad, label: "جسر / نفق", value: "جسر / نفق" },
    {
      icon: FaWalking,
      label: "نفق مشاة / جسر مشاة",
      value: "نفق مشاة / جسر مشاة",
    },
    { icon: FaCircle, label: "دوّار", value: "دوّار" },
    { icon: FaTrafficLight, label: "إشارة مرور", value: "إشارة مرور" },
    { icon: FaPlus, label: "تقاطع طرق", value: "تقاطع طرق" },
    { icon: FaTree, label: "حديقة / ساحة", value: "حديقة / ساحة" },
    { icon: FaLandmark, label: "دائرة حكومية", value: "دائرة حكومية" },
    { icon: FaFlag, label: "سفارة / قنصلية", value: "سفارة / قنصلية" },
    { icon: FaWrench, label: "ورشة صيانة", value: "ورشة صيانة" },
    { icon: FaParking, label: "موقف سيارات", value: "موقف سيارات" },
    { icon: FaGasPump, label: "محطة وقود", value: "محطة وقود" },
    { icon: FaUniversity, label: "مصرف / صراف آلي", value: "مصرف / صراف آلي" },
    { icon: FaMoneyBillWave, label: "شركة صرافة", value: "شركة صرافة" },
    {
      icon: FaFutbol,
      label: "منشأة رياضية (ملعب / نادي / صالة)",
      value: "منشأة رياضية (ملعب / نادي / صالة)",
    },
    {
      icon: FaGlassCheers,
      label: "صالة مناسبات (أفراح / تعازي)",
      value: "صالة مناسبات (أفراح / تعازي)",
    },
    { icon: FaHotel, label: "فندق", value: "فندق" },
    { icon: FaBreadSlice, label: "فرن / مخبز", value: "فرن / مخبز" },
    {
      icon: FaHome,
      label: "مدخل بناية / مدخل حي",
      value: "مدخل بناية / مدخل حي",
    },
    { icon: FaBuilding, label: "شركة / مكتب", value: "شركة / مكتب" },
    { icon: FaPlane, label: "مطار", value: "مطار" },
    { icon: FaCouch, label: "استراحة", value: "استراحة" },
    { icon: FaUmbrellaBeach, label: "شاطئ / كورنيش", value: "شاطئ / كورنيش" },
    { icon: FaAnchor, label: "ميناء / مرفأ بحري", value: "ميناء / مرفأ بحري" },
    { icon: FaShip, label: "مرسى قوارب", value: "مرسى قوارب" },
  ];

  // Color map for category pins
  const categoryColors: { [key: string]: string } = {
    "موقف سرفيس / باص": "#1E88E5",
    "كراج / محطة نقل": "#42A5F5",
    "سوق / شارع تجاري / سوق شعبي": "#4CAF50",
    "مول / مركز تجاري": "#66BB6A",
    "محل تجاري مشهور": "#81C784",
    "مطعم / قهوة مشهورة": "#FF9800",
    "مدرسة / جامعة / معهد / روضة": "#9C27B0",
    "مشفى / مركز طبي": "#F44336",
    صيدلية: "#EF5350",
    "معلم معروف": "#795548",
    "جامع / كنيسة": "#8D6E63",
    "جسر / نفق": "#757575",
    "نفق مشاة / جسر مشاة": "#9E9E9E",
    دوّار: "#BDBDBD",
    "إشارة مرور": "#FF5722",
    "تقاطع طرق": "#FF7043",
    "حديقة / ساحة": "#689F38",
    "دائرة حكومية": "#1565C0",
    "سفارة / قنصلية": "#1976D2",
    "ورشة صيانة": "#F57C00",
    "موقف سيارات": "#FFB74D",
    "محطة وقود": "#FF8A65",
    "مصرف / صراف آلي": "#FFD54F",
    "شركة صرافة": "#FFEB3B",
    "منشأة رياضية (ملعب / نادي / صالة)": "#E91E63",
    "صالة مناسبات (أفراح / تعازي)": "#F06292",
    فندق: "#00BCD4",
    "فرن / مخبز": "#FFCC02",
    "مدخل بناية / مدخل حي": "#607D8B",
    "شركة / مكتب": "#78909C",
    مطار: "#0097A7",
    استراحة: "#4DB6AC",
    "شاطئ / كورنيش": "#26A69A",
    "ميناء / مرفأ بحري": "#00897B",
    "مرسى قوارب": "#4CAF50",
  };

  const getColorByStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "#FFC107"; // أصفر - قيد المراجعة
      case "APPROVED":
        return "#4CAF50"; // أخضر - موافق
      case "REJECTED":
        return "#F44336"; // أحمر - مرفوض
      default:
        return "#FF0000";
    }
  };

  const getPinIcon = (category: string, status?: string) => {
    // إذا كان هناك status، استخدم اللون حسب status بدلاً من category
    const color = status
      ? getColorByStatus(status)
      : categoryColors[category] || "#FF0000";
    const svg = `<svg width="30" height="47" viewBox="0 0 30 47" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.716 0 0 6.716 0 15c0 7.5 12 27 15 32s15-24.5 15-32C30 6.716 23.284 0 15 0z" fill="${color}"/>
      <circle cx="15" cy="15" r="6" fill="white"/>
    </svg>`;
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new window.google.maps.Size(30, 47),
      anchor: new window.google.maps.Point(15, 47),
    };
  };

  const getCategoryIcon = (categoryValue: string) => {
    const category = CATEGORIES.find((cat) => cat.value === categoryValue);
    return category ? category.icon : FaMapMarkerAlt;
  };

  const getCategoryDisplay = (categoryValue: string) => {
    const category = CATEGORIES.find((cat) => cat.value === categoryValue);
    if (!category) return categoryValue;
    const Icon = category.icon;
    return (
      <span className="flex items-center gap-2">
        <Icon className="shrink-0" />
        <span>{category.label}</span>
      </span>
    );
  };

  // Mobile bottom sheet state
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentSnapIndex, setCurrentSnapIndex] = useState(4);
  const sheetRef = useRef<any>(null);
  const centerMarkerRef = useRef<google.maps.Marker | null>(null);

  // All locations and markers state
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [selectedMarkerLocation, setSelectedMarkerLocation] =
    useState<any>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Normalize Arabic text for search
  const normalizeArabic = (text: string) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[ةه]/g, "ه")
      .replace(/[أإآا]/g, "ا")
      .replace(/ى/g, "ي");
  };

  // Filtered locations based on search
  const filteredLocations = allLocations.filter((location) => {
    if (!searchQuery.trim()) return true;

    const normalizedQuery = normalizeArabic(searchQuery);
    return (
      normalizeArabic(location.name || "").includes(normalizedQuery) ||
      normalizeArabic(location.city || "").includes(normalizedQuery) ||
      normalizeArabic(location.street || "").includes(normalizedQuery) ||
      normalizeArabic(location.category || "").includes(normalizedQuery) ||
      normalizeArabic(location.formalPlaceName || "").includes(
        normalizedQuery,
      ) ||
      normalizeArabic(location.side || "").includes(normalizedQuery) ||
      normalizeArabic(location.path || "").includes(normalizedQuery)
    );
  });

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

  // Handle keyboard visibility on mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleResize = () => {
      const isKeyboardOpen = window.visualViewport
        ? window.visualViewport.height < window.innerHeight * 0.75
        : false;

      if (isKeyboardOpen && sheetRef.current) {
        sheetRef.current.snapTo(5);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      return () => {
        window.visualViewport?.removeEventListener("resize", handleResize);
      };
    }
  }, [isMobile]);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };

    if (isCategoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCategoryDropdownOpen]);

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

  // Fetch all locations and display as markers
  useEffect(() => {
    const fetchAllLocations = async () => {
      if (!map) return;

      try {
        const response = await fetch("/api/locations");
        if (response.ok) {
          const data = await response.json();
          setAllLocations(data.locations || []);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    if (map && user) {
      fetchAllLocations();
    }
  }, [map, user]);

  // Create markers for all locations
  useEffect(() => {
    if (!map || allLocations.length === 0) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    filteredLocations.forEach((location) => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: map,
        title: location.name,
        icon: getPinIcon(location.category, location.status),
      });

      marker.addListener("click", () => {
        setSelectedMarkerLocation(location);
        setIsBottomSheetOpen(true);
        if (map) {
          map.panTo({ lat: location.latitude, lng: location.longitude });
        }
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [map, filteredLocations]);

  // Load location data when editing
  useEffect(() => {
    const loadLocationForEdit = async () => {
      if (editLocationId && user) {
        try {
          setIsEditMode(true);
          setEditingLocationId(editLocationId);

          const endpoint =
            user.role === "ADMIN"
              ? `/api/admin/locations?id=${editLocationId}`
              : "/api/user/locations";

          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            const location =
              user.role === "ADMIN"
                ? data.locations[0]
                : data.locations.find((loc: any) => loc.id === editLocationId);

            if (location) {
              setPopularPlaceName(location.name);
              setCity(location.city);
              setCategory(location.category || "");
              setFormalPlaceName(location.formalPlaceName || "");
              setStreet(location.street || "");
              setSide(location.side || "");
              setPath(location.path || "");
              setDir(location.dir || "");
              setLine(location.line || "");
              setBelongsToRoute(location.belongsToRoute || "");
              setNotes(location.notes || "");
              setPhotoConfidence(Number(location.photoConfidence) || 100);
              setPointType((location.pointType as "NEW" | "EDIT") || "EDIT");
              setSelectedLocation({
                lat: location.latitude,
                lng: location.longitude,
              });
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
                  resolve({ lat: 33.5138, lng: 36.2765 });
                },
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
            gestureHandling: "greedy",
            language: "ar",
          });

          setMap(mapInstance);
          setSelectedLocation({
            lat: center.lat,
            lng: center.lng,
          });

          class SmoothCenterPin extends window.google.maps.OverlayView {
            private container: HTMLDivElement | null = null;
            private pin: HTMLImageElement | null = null;
            public isDragging = false;
            public isZooming = false;
            private zoomTimeout: NodeJS.Timeout | null = null;

            onAdd() {
              this.container = document.createElement("div");
              this.container.style.position = "absolute";
              this.container.style.cursor = "pointer";
              this.container.style.zIndex = "1000";

              this.pin = document.createElement("img");
              this.pin.src = "/mapPin.svg";
              this.pin.style.width = "42px";
              this.pin.style.height = "66px";
              this.pin.style.position = "absolute";
              this.pin.style.left = "50%";
              this.pin.style.bottom = "0";
              this.pin.style.transform = "translateX(-50%)";
              this.pin.style.transformOrigin = "center bottom";
              this.pin.style.transition =
                "transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)";
              this.pin.style.willChange = "transform";

              this.container.appendChild(this.pin);

              const panes = this.getPanes();
              if (panes) {
                panes.overlayMouseTarget.appendChild(this.container);
              }

              if (this.pin) {
                this.pin.style.transform =
                  "translateX(-50%) translateY(-100px)";
                setTimeout(() => {
                  if (this.pin) {
                    this.pin.style.transform = "translateX(-50%) translateY(0)";
                  }
                }, 100);
              }
            }

            draw() {
              if (!this.container) return;

              const projection = this.getProjection();
              const center = mapInstance.getCenter();

              if (center && projection) {
                const point = projection.fromLatLngToDivPixel(center);
                if (point) {
                  this.container.style.left = point.x + "px";
                  this.container.style.top = point.y + "px";
                }
              }
            }

            lift() {
              if (this.pin) {
                this.pin.style.transform =
                  "translateX(-50%) translateY(-8px) scale(1.12)";
              }
            }

            settle() {
              if (this.pin) {
                this.pin.style.transform =
                  "translateX(-50%) translateY(0) scale(1)";
              }
            }

            bounce() {
              if (!this.pin) return;

              this.pin.style.transition =
                "transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
              this.pin.style.transform =
                "translateX(-50%) translateY(-24px) scale(1)";

              setTimeout(() => {
                if (this.pin) {
                  this.pin.style.transform =
                    "translateX(-50%) translateY(0) scale(1)";

                  setTimeout(() => {
                    if (this.pin) {
                      this.pin.style.transition =
                        "transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)";
                    }
                  }, 600);
                }
              }, 50);
            }

            setDragging(dragging: boolean) {
              this.isDragging = dragging;
              if (dragging) {
                this.lift();
              }
            }

            handleZoom() {
              this.isZooming = true;
              this.lift();

              if (this.zoomTimeout) {
                clearTimeout(this.zoomTimeout);
              }

              this.zoomTimeout = setTimeout(() => {
                this.settle();
                this.isZooming = false;
                this.draw();
              }, 300);
            }

            onRemove() {
              if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
              }
              this.container = null;
              this.pin = null;
            }
          }

          const smoothPin = new SmoothCenterPin();
          smoothPin.setMap(mapInstance);
          centerMarkerRef.current = smoothPin as any;

          mapInstance.addListener("zoom_changed", () => {
            smoothPin.handleZoom();
          });

          mapInstance.addListener("center_changed", () => {
            if (!smoothPin.isDragging && !smoothPin.isZooming) {
              smoothPin.draw();
            }
          });

          mapInstance.addListener("dragstart", () => {
            smoothPin.setDragging(true);

            if (window.innerWidth < 768 && !isBottomSheetOpen) {
              setIsBottomSheetOpen(true);
            }
          });

          mapInstance.addListener("drag", () => {
            smoothPin.draw();
          });

          mapInstance.addListener("dragend", () => {
            smoothPin.setDragging(false);

            const mapCenter = mapInstance.getCenter();
            if (mapCenter) {
              setSelectedLocation({
                lat: mapCenter.lat(),
                lng: mapCenter.lng(),
              });

              smoothPin.bounce();
            }
          });
        });
      }
    };

    if (user) {
      initMap();
    }

    return () => {
      if (centerMarkerRef.current && centerMarkerRef.current.setMap) {
        centerMarkerRef.current.setMap(null);
      }
    };
  }, [user, isBottomSheetOpen]);

  useEffect(() => {
    if (map && selectedLocation && isEditMode) {
      map.setCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    }
  }, [map, selectedLocation, isEditMode]);

  useEffect(() => {
    if (searchQuery.trim() && filteredLocations.length > 0 && map) {
      const firstResult = filteredLocations[0];
      map.panTo({ lat: firstResult.latitude, lng: firstResult.longitude });
      map.setZoom(15);
    }
  }, [searchQuery, filteredLocations, map]);

  const handleDelete = async (locationId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموقع؟")) {
      return;
    }

    try {
      const response = await fetch(`/api/user/locations/${locationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete location");
      }

      setMessage({
        type: "success",
        text: "تم حذف الموقع بنجاح",
      });

      setSelectedMarkerLocation(null);

      const locationsResponse = await fetch("/api/locations");
      if (locationsResponse.ok) {
        const data = await locationsResponse.json();
        setAllLocations(data.locations || []);
      }

      setTimeout(() => {
        setMessage(null);
      }, 2000);
    } catch (error) {
      console.error("Error deleting location:", error);
      setMessage({
        type: "error",
        text: "فشل حذف الموقع. يرجى المحاولة مرة أخرى.",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages([...images, ...newFiles]);
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

    if (!popularPlaceName || !city || !side || !category) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
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
        path,
        dir,
        line,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        category,
        belongsToRoute,
        photoConfidence: Number(photoConfidence), // ✅ FIX
        notes,
        pointType,
        isSponsored: false,
        ...(imageUrls.length > 0 && { images: imageUrls }),
      };

      console.log("Submitting locationData:", locationData); // debug

      let response;
      if (isEditMode && editingLocationId) {
        const endpoint =
          user?.role === "ADMIN"
            ? `/api/admin/locations/${editingLocationId}`
            : `/api/user/locations/${editingLocationId}`;

        response = await fetch(endpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(locationData),
        });
      } else {
        response = await fetch("/api/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(locationData),
        });
      }

      if (!response.ok) throw new Error("Failed to save location");

      setMessage({
        type: "success",
        text: isEditMode
          ? "Location updated successfully! It will be reviewed by admin."
          : "Location saved successfully! It will be reviewed by admin.",
      });

      setIsEditMode(false);
      setEditingLocationId(null);
      setSelectedMarkerLocation(null);

      const locationsResponse = await fetch("/api/locations");
      if (locationsResponse.ok) {
        const data = await locationsResponse.json();
        setAllLocations(data.locations || []);
      }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const showForm =
    !selectedMarkerLocation || selectedMarkerLocation.userId === user.id;

  const formContent = showForm ? (
    <form onSubmit={handleSubmit} className="space-y-4 text-base" dir="rtl">
      {/* Coordinates Display */}
      <div className="flex items-center justify-between px-1 py-2 border-b border-gray-800">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-400"
        >
          ✕
        </button>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-500">
            Lat:{" "}
            <span className="text-white">
              {selectedLocation?.lat.toFixed(6) || "0.000000"}
            </span>
          </span>
          <span className="text-gray-500">
            Lng:{" "}
            <span className="text-white">
              {selectedLocation?.lng.toFixed(6) || "0.000000"}
            </span>
          </span>
        </div>
      </div>

      {isEditMode && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
          <p className="text-blue-400 text-sm">
            🔄 وضع التعديل - تحرير الموقع الحالي
          </p>
        </div>
      )}

      {/* 1. الاسم الشعبي الشائع للمكان */}
      <div className="relative">
        <input
          type="text"
          value={popularPlaceName}
          onChange={(e) => setPopularPlaceName(e.target.value)}
          className="w-full px-4 py-3.5 bg-transparent border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
          style={{ direction: "rtl" }}
          placeholder="الاسم الشعبي الشائع للمكان الموجود به *"
          required
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
          </svg>
        </div>
      </div>

      {/* 2. الاسم الرسمي للمكان */}
      <div className="relative">
        <input
          type="text"
          value={formalPlaceName}
          onChange={(e) => setFormalPlaceName(e.target.value)}
          className="w-full px-4 py-3.5 bg-transparent border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
          style={{ direction: "rtl" }}
          placeholder="الاسم الرسمي للمكان الموجود به"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* 3. بجانب */}
      <div className="relative">
        <input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="w-full px-4 py-3.5 bg-transparent border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
          style={{ direction: "rtl" }}
          placeholder="بجانب"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* 4. باتجاه */}
      <div className="relative">
        <input
          type="text"
          value={dir}
          onChange={(e) => setDir(e.target.value)}
          className="w-full px-4 py-3.5 bg-transparent border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
          style={{ direction: "rtl" }}
          placeholder="باتجاه"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* 5. خط سرفيس / باص */}
      <div className="relative">
        <input
          type="text"
          value={line}
          onChange={(e) => setLine(e.target.value)}
          className="w-full px-4 py-3.5 bg-transparent border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
          style={{ direction: "rtl" }}
          placeholder="خط سرفيس / باص"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
          <FaBus className="w-4 h-4" />
        </div>
      </div>

      {/* 6. المدينة */}
      <div className="relative">
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-4 py-3.5 bg-transparent border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gray-600 appearance-none"
          style={{ direction: "rtl" }}
          required
        >
          <option value="" className="bg-black">
            المدينة *
          </option>
          {CITIES.map((c) => (
            <option key={c} value={c} className="bg-black">
              {c}
            </option>
          ))}
        </select>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* 7. الحي / المنطقة */}
      <div className="relative">
        <input
          type="text"
          value={side}
          onChange={(e) => setSide(e.target.value)}
          className="w-full px-4 py-3.5 bg-transparent border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
          style={{ direction: "rtl" }}
          placeholder="الحي / المنطقة *"
          required
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </div>
      </div>

      {/* 8. اسم الشارع */}
      <div className="relative">
        <input
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          className="w-full px-4 py-3.5 bg-transparent border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
          style={{ direction: "rtl" }}
          placeholder="اسم الشارع"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
          <FaRoad className="w-4 h-4" />
        </div>
      </div>

      {/* 9. التصنيف */}
      <div className="relative" ref={categoryDropdownRef}>
        <button
          type="button"
          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
          className="w-full px-4 py-3.5 bg-transparent border border-gray-700 rounded-lg text-white text-sm text-right focus:outline-none focus:border-gray-600 flex items-center justify-between"
          style={{ direction: "rtl" }}
        >
          {category ? (
            <span className="flex items-center gap-2">
              {(() => {
                const Icon = getCategoryIcon(category);
                return <Icon className="shrink-0 text-sm" />;
              })()}
              <span className="text-sm">
                {CATEGORIES.find((cat) => cat.value === category)?.label ||
                  category}
              </span>
            </span>
          ) : (
            <span className="text-gray-500 text-sm">التصنيف *</span>
          )}
          <svg
            className={`w-4 h-4 text-gray-600 transition-transform ${
              isCategoryDropdownOpen ? "rotate-180" : ""
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {isCategoryDropdownOpen && (
          <div className="absolute z-50 w-full mt-2 bg-black border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => {
                    setCategory(cat.value);
                    setIsCategoryDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 text-right hover:bg-gray-900 transition-colors flex items-center gap-3 text-white text-sm border-b border-gray-800 last:border-0"
                  style={{ direction: "rtl" }}
                >
                  <Icon className="shrink-0 text-sm" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Photo Upload and Confidence */}
      <div className="space-y-3">
        <div className="flex gap-3">
          {/* Upload Button */}
          <label
            htmlFor="images"
            className="shrink-0 w-16 h-16 bg-transparent border border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-500 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-gray-500 text-[10px]">صورة</span>
            {images.length > 0 && (
              <span className="text-white text-[10px] font-medium">
                ({images.length})
              </span>
            )}
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {/* Confidence Radio */}
          <div className="flex-1 flex flex-col gap-2.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="photoConfidence"
                value="100"
                checked={photoConfidence === 100}
                onChange={() => setPhotoConfidence(100)}
                className="w-4 h-4"
              />
              <span className="text-white text-sm">
                هل تأكدت من صحة الموقع 100%
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="photoConfidence"
                value="90"
                checked={photoConfidence === 90}
                onChange={() => setPhotoConfidence(90)}
                className="w-4 h-4"
              />
              <span className="text-white text-sm">
                هل تأكدت من صحة الموقع 90% أو أقل
              </span>
            </label>
          </div>
        </div>

        {/* Image Preview */}
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImages(images.filter((_, i) => i !== index));
                  }}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    className="w-3 h-3"
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="relative">
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-3.5 bg-transparent border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
          style={{ direction: "rtl" }}
          placeholder="ملاحظة"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-500/10 text-green-400 border border-green-500/30"
              : "bg-red-500/10 text-red-400 border border-red-500/30"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !selectedLocation}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white py-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
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
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
          />
        </svg>
        {isSubmitting
          ? "جاري حفظ الموقع..."
          : isEditMode
            ? "تحديث الموقع"
            : "حفظ الموقع"}
      </button>
    </form>
  ) : null;

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-black">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="md:w-96 bg-black shadow-lg flex flex-col shrink-0 border-r border-gray-800">
          {/* Top User Bar */}
          <div className="p-3 border-b border-gray-800 flex items-center justify-between">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-white text-sm font-medium">
                  {user?.name || "User"}
                </div>
                <div className="text-gray-500 text-xs">{user?.email || ""}</div>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              <button className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Header with Stats */}
          <div className="p-4 border-b border-gray-800">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white text-lg font-semibold" dir="rtl">
                  المواقع
                </h2>
                <span className="text-gray-400 text-sm">Map View</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-2 text-center">
                  <div className="text-green-400 text-lg font-bold">
                    {stats.approved}
                  </div>
                  <div className="text-green-400/70 text-[10px] mt-0.5">
                    موافق
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-2 text-center">
                  <div className="text-yellow-400 text-lg font-bold">
                    {stats.pending}
                  </div>
                  <div className="text-yellow-400/70 text-[10px] mt-0.5">
                    قيد الانتظار
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-lg p-2 text-center">
                  <div className="text-red-400 text-lg font-bold">
                    {stats.rejected}
                  </div>
                  <div className="text-red-400/70 text-[10px] mt-0.5">
                    مرفوض
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/10 border border-gray-500/30 rounded-lg p-2 text-center">
                  <div className="text-gray-400 text-lg font-bold">
                    {stats.total}
                  </div>
                  <div className="text-gray-400/70 text-[10px] mt-0.5">
                    المجموع
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="بحث عن موقع"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-10 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 text-sm"
                dir="rtl"
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
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
          </div>

          <div className="flex-1 overflow-y-auto bg-black p-4">
            {formContent}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        {/* Mobile Top Header */}
        {isMobile && (
          <div className="absolute top-0 left-0 right-0 p-3 z-10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/dashboard")}
                className="shrink-0 w-10 h-10 bg-black/80 backdrop-blur-sm border border-gray-700/50 rounded-full flex items-center justify-center hover:bg-black transition-colors"
              >
                <svg
                  className="w-5 h-5 text-white"
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
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="بحث عن موقع"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 bg-black/80 backdrop-blur-sm border border-gray-700/50 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 text-sm"
                  dir="rtl"
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <Sheet
          ref={sheetRef}
          isOpen={isBottomSheetOpen}
          onClose={() => {}}
          onSnap={(index) => {
            setCurrentSnapIndex(index);
          }}
          snapPoints={[0, 0.2, 0.3, 0.5, 0.85, 1]}
          initialSnap={3}
          disableDismiss={true}
        >
          <Sheet.Container style={{ backgroundColor: "rgb(0, 0, 0)" }}>
            <Sheet.Header
              style={{
                backgroundColor: "rgb(0, 0, 0)",
                borderBottom: "1px solid rgb(31, 41, 55)",
              }}
            >
              <div className="pt-3 pb-3">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-1 bg-gray-700 rounded-full" />
                </div>

                {/* Stats for Mobile */}
                <div className="px-4">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-2 text-center">
                      <div className="text-green-400 text-lg font-bold">
                        {stats.approved}
                      </div>
                      <div className="text-green-400/70 text-[10px] mt-0.5">
                        موافق
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-2 text-center">
                      <div className="text-yellow-400 text-lg font-bold">
                        {stats.pending}
                      </div>
                      <div className="text-yellow-400/70 text-[10px] mt-0.5">
                        قيد الانتظار
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-lg p-2 text-center">
                      <div className="text-red-400 text-lg font-bold">
                        {stats.rejected}
                      </div>
                      <div className="text-red-400/70 text-[10px] mt-0.5">
                        مرفوض
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/10 border border-gray-500/30 rounded-lg p-2 text-center">
                      <div className="text-gray-400 text-lg font-bold">
                        {stats.total}
                      </div>
                      <div className="text-gray-400/70 text-[10px] mt-0.5">
                        المجموع
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Sheet.Header>
            <Sheet.Content style={{ backgroundColor: "rgb(0, 0, 0)" }}>
              <div className="overflow-y-auto p-4">{formContent}</div>
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
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-xl text-gray-400">Loading...</div>
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  );
}
