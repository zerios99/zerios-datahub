"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet } from "react-modal-sheet";
import Image from "next/image";
import "../modal-sheet.css";
import {
  FaBus, FaWarehouse, FaShoppingBag, FaShoppingCart, FaStore,
  FaUtensils, FaCoffee, FaGraduationCap, FaHospital, FaPills,
  FaMapMarkerAlt, FaMosque, FaWalking, FaCircle,
  FaTrafficLight, FaPlus, FaTree, FaLandmark, FaFlag,
  FaWrench, FaParking, FaGasPump, FaUniversity, FaMoneyBillWave,
  FaFutbol, FaGlassCheers, FaHotel, FaBreadSlice, FaHome,
  FaBuilding, FaPlane, FaCouch, FaUmbrellaBeach, FaAnchor, FaShip,
  FaRoad, FaSubway
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
    { icon: FaBus, label: "موقف سرفيس / باص", value: "موقف سرفيس / باص" },
    { icon: FaWarehouse, label: "كراج / محطة نقل", value: "كراج / محطة نقل" },
    { icon: FaShoppingBag, label: "سوق / شارع تجاري / سوق شعبي", value: "سوق / شارع تجاري / سوق شعبي" },
    { icon: FaShoppingCart, label: "مول / مركز تجاري", value: "مول / مركز تجاري" },
    { icon: FaStore, label: "محل تجاري مشهور", value: "محل تجاري مشهور" },
    { icon: FaUtensils, label: "مطعم / قهوة مشهورة", value: "مطعم / قهوة مشهورة" },
    { icon: FaGraduationCap, label: "مدرسة / جامعة / معهد / روضة", value: "مدرسة / جامعة / معهد / روضة" },
    { icon: FaHospital, label: "مشفى / مركز طبي", value: "مشفى / مركز طبي" },
    { icon: FaPills, label: "صيدلية", value: "صيدلية" },
    { icon: FaMapMarkerAlt, label: "معلم معروف", value: "معلم معروف" },
    { icon: FaMosque, label: "جامع / كنيسة", value: "جامع / كنيسة" },
    { icon: FaRoad, label: "جسر / نفق", value: "جسر / نفق" },
    { icon: FaWalking, label: "نفق مشاة / جسر مشاة", value: "نفق مشاة / جسر مشاة" },
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
    { icon: FaFutbol, label: "منشأة رياضية (ملعب / نادي / صالة)", value: "منشأة رياضية (ملعب / نادي / صالة)" },
    { icon: FaGlassCheers, label: "صالة مناسبات (أفراح / تعازي)", value: "صالة مناسبات (أفراح / تعازي)" },
    { icon: FaHotel, label: "فندق", value: "فندق" },
    { icon: FaBreadSlice, label: "فرن / مخبز", value: "فرن / مخبز" },
    { icon: FaHome, label: "مدخل بناية / مدخل حي", value: "مدخل بناية / مدخل حي" },
    { icon: FaBuilding, label: "شركة / مكتب", value: "شركة / مكتب" },
    { icon: FaPlane, label: "مطار", value: "مطار" },
    { icon: FaCouch, label: "استراحة", value: "استراحة" },
    { icon: FaUmbrellaBeach, label: "شاطئ / كورنيش", value: "شاطئ / كورنيش" },
    { icon: FaAnchor, label: "ميناء / مرفأ بحري", value: "ميناء / مرفأ بحري" },
    { icon: FaShip, label: "مرسى قوارب", value: "مرسى قوارب" },
  ];

  // Color map for category pins
  const categoryColors: { [key: string]: string } = {
    "موقف سرفيس / باص": "#1E88E5", // Blue
    "كراج / محطة نقل": "#42A5F5", // Light blue
    "سوق / شارع تجاري / سوق شعبي": "#4CAF50", // Green
    "مول / مركز تجاري": "#66BB6A", // Light green
    "محل تجاري مشهور": "#81C784", // Lighter green
    "مطعم / قهوة مشهورة": "#FF9800", // Orange
    "مدرسة / جامعة / معهد / روضة": "#9C27B0", // Purple
    "مشفى / مركز طبي": "#F44336", // Red
    "صيدلية": "#EF5350", // Light red
    "معلم معروف": "#795548", // Brown
    "جامع / كنيسة": "#8D6E63", // Light brown
    "جسر / نفق": "#757575", // Gray
    "نفق مشاة / جسر مشاة": "#9E9E9E", // Light gray
    "دوّار": "#BDBDBD", // Lighter gray
    "إشارة مرور": "#FF5722", // Deep orange
    "تقاطع طرق": "#FF7043", // Light deep orange
    "حديقة / ساحة": "#689F38", // Dark green
    "دائرة حكومية": "#1565C0", // Dark blue
    "سفارة / قنصلية": "#1976D2", // Blue
    "ورشة صيانة": "#F57C00", // Amber
    "موقف سيارات": "#FFB74D", // Light amber
    "محطة وقود": "#FF8A65", // Light red-orange
    "مصرف / صراف آلي": "#FFD54F", // Yellow
    "شركة صرافة": "#FFEB3B", // Light yellow
    "منشأة رياضية (ملعب / نادي / صالة)": "#E91E63", // Pink
    "صالة مناسبات (أفراح / تعازي)": "#F06292", // Light pink
    "فندق": "#00BCD4", // Cyan
    "فرن / مخبز": "#FFCC02", // Gold
    "مدخل بناية / مدخل حي": "#607D8B", // Blue gray
    "شركة / مكتب": "#78909C", // Light blue gray
    "مطار": "#0097A7", // Teal
    "استراحة": "#4DB6AC", // Light teal
    "شاطئ / كورنيش": "#26A69A", // Green teal
    "ميناء / مرفأ بحري": "#00897B", // Dark teal
    "مرسى قوارب": "#4CAF50", // Green
  };

  // Function to get colored pin icon
  const getPinIcon = (category: string) => {
    const color = categoryColors[category] || "#FF0000"; // Default red
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
    const category = CATEGORIES.find(cat => cat.value === categoryValue);
    return category ? category.icon : FaMapMarkerAlt;
  };

  const getCategoryDisplay = (categoryValue: string) => {
    const category = CATEGORIES.find(cat => cat.value === categoryValue);
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
      .replace(/\s+/g, "") // Remove all spaces
      .replace(/[ةه]/g, "ه") // Normalize ة and ه to ه
      .replace(/[أإآا]/g, "ا") // Normalize all alif variations to ا
      .replace(/ى/g, "ي"); // Normalize ى to ي
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
      normalizeArabic(location.formalPlaceName || "").includes(normalizedQuery) ||
      normalizeArabic(location.side || "").includes(normalizedQuery) ||
      normalizeArabic(location.path || "").includes(normalizedQuery)
    );
  });

  // Debug logging
  console.log("Search Query:", searchQuery);
  console.log("All Locations:", allLocations.length);
  console.log("Filtered Locations:", filteredLocations.length);
  console.log("Should show search results:", searchQuery.trim() !== "");

  // Center map on first search result when searching
  useEffect(() => {
    if (searchQuery.trim() && filteredLocations.length > 0 && map) {
      const firstResult = filteredLocations[0];
      map.panTo({ lat: firstResult.latitude, lng: firstResult.longitude });
      map.setZoom(15);
    }
  }, [searchQuery, filteredLocations, map]);

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
      // Detect if keyboard is open by checking if viewport height changed significantly
      const isKeyboardOpen = window.visualViewport
        ? window.visualViewport.height < window.innerHeight * 0.75
        : false;

      if (isKeyboardOpen && sheetRef.current) {
        // Snap to full height when keyboard opens
        sheetRef.current.snapTo(5); // Index 5 is the full height (1)
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
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    if (isCategoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
          console.log("Fetched locations:", data.locations);
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
    if (!map || allLocations.length === 0) {
      console.log(
        "Skipping markers - map:",
        !!map,
        "locations:",
        allLocations.length
      );
      return;
    }

    console.log(
      "Creating markers for",
      filteredLocations.length,
      "locations (filtered from",
      allLocations.length,
      ")"
    );

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Create markers for each filtered location
    filteredLocations.forEach((location) => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: map,
        title: location.name,
        icon: getPinIcon(location.category),
      });

      // Add click listener to show location info
      marker.addListener("click", () => {
        console.log("Marker clicked:", location);
        setSelectedMarkerLocation(location);
        setIsBottomSheetOpen(true);
        // Center map on clicked marker
        if (map) {
          map.panTo({ lat: location.latitude, lng: location.longitude });
        }
      });

      markersRef.current.push(marker);
    });

    // Cleanup on unmount
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

          // Admins can edit any location, regular users can only edit their own
          const endpoint = user.role === 'ADMIN'
            ? `/api/admin/locations?id=${editLocationId}`
            : "/api/user/locations";

          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            const location = user.role === 'ADMIN'
              ? data.locations[0] // Admin endpoint returns filtered list
              : data.locations.find((loc: any) => loc.id === editLocationId);

            if (location) {
              // Pre-populate form fields
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
              setPhotoConfidence(location.photoConfidence || "100");
              setPointType((location.pointType as "new" | "edit") || "edit");
              setSelectedLocation({
                lat: location.latitude,
                lng: location.longitude,
              });

              // Note: Images cannot be pre-loaded as they are S3 URLs, not File objects
              // User will need to re-upload images if they want to change them
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
          gestureHandling: "greedy",
          language: "ar",
        });

        setMap(mapInstance);
        setSelectedLocation({
          lat: center.lat,
          lng: center.lng,
        });

        // ✅ SUPER SMOOTH CENTER PIN - Custom Overlay
        class SmoothCenterPin extends window.google.maps.OverlayView {
          private container: HTMLDivElement | null = null;
          private pin: HTMLImageElement | null = null;
          private isDragging = false;
          private isZooming = false;
          private zoomTimeout: NodeJS.Timeout | null = null;

          onAdd() {
            // Create container
            this.container = document.createElement('div');
            this.container.style.position = 'absolute';
            this.container.style.cursor = 'pointer';
            this.container.style.zIndex = '1000';
            
            // Create pin image
            this.pin = document.createElement('img');
            this.pin.src = '/mapPin.svg';
            this.pin.style.width = '42px';
            this.pin.style.height = '66px';
            this.pin.style.position = 'absolute';
            this.pin.style.left = '50%';
            this.pin.style.bottom = '0';
            this.pin.style.transform = 'translateX(-50%)';
            this.pin.style.transformOrigin = 'center bottom';
            
            // Smooth CSS transitions
            this.pin.style.transition = 'transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)';
            this.pin.style.willChange = 'transform';
            
            this.container.appendChild(this.pin);

            // Add to map
            const panes = this.getPanes();
            if (panes) {
              panes.overlayMouseTarget.appendChild(this.container);
            }

            // Initial drop animation
            if (this.pin) {
              this.pin.style.transform = 'translateX(-50%) translateY(-100px)';
              setTimeout(() => {
                if (this.pin) {
                  this.pin.style.transform = 'translateX(-50%) translateY(0)';
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
                this.container.style.left = point.x + 'px';
                this.container.style.top = point.y + 'px';
              }
            }
          }

          // Lift animation on zoom/drag
          lift() {
            if (this.pin) {
              this.pin.style.transform = 'translateX(-50%) translateY(-8px) scale(1.12)';
            }
          }

          // Settle animation
          settle() {
            if (this.pin) {
              this.pin.style.transform = 'translateX(-50%) translateY(0) scale(1)';
            }
          }

          // Bounce animation
          bounce() {
            if (!this.pin) return;
            
            // Change to elastic timing for bounce
            this.pin.style.transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            this.pin.style.transform = 'translateX(-50%) translateY(-24px) scale(1)';
            
            setTimeout(() => {
              if (this.pin) {
                this.pin.style.transform = 'translateX(-50%) translateY(0) scale(1)';
                
                // Restore smooth timing
                setTimeout(() => {
                  if (this.pin) {
                    this.pin.style.transition = 'transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)';
                  }
                }, 600);
              }
            }, 50);
          }

          // Handle dragging
          setDragging(dragging: boolean) {
            this.isDragging = dragging;
            if (dragging) {
              this.lift();
            }
          }

          // Handle zooming
          handleZoom() {
            this.isZooming = true;
            this.lift();

            if (this.zoomTimeout) {
              clearTimeout(this.zoomTimeout);
            }

            this.zoomTimeout = setTimeout(() => {
              this.settle();
              this.isZooming = false;
              this.draw(); // Redraw at new position
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

        // Create and set the smooth pin
        const smoothPin = new SmoothCenterPin();
        smoothPin.setMap(mapInstance);
        centerMarkerRef.current = smoothPin as any;

        // Zoom animation
        mapInstance.addListener('zoom_changed', () => {
          smoothPin.handleZoom();
        });

        // Center changed - redraw position
        mapInstance.addListener('center_changed', () => {
          if (!smoothPin.isDragging && !smoothPin.isZooming) {
            smoothPin.draw();
          }
        });

        // Drag start
        mapInstance.addListener('dragstart', () => {
          smoothPin.setDragging(true);
          
          if (window.innerWidth < 768 && !isBottomSheetOpen) {
            setIsBottomSheetOpen(true);
          }
        });

        // During drag
        mapInstance.addListener('drag', () => {
          smoothPin.draw();
        });

        // Drag end
        mapInstance.addListener('dragend', () => {
          smoothPin.setDragging(false);
          
          const mapCenter = mapInstance.getCenter();
          if (mapCenter) {
            setSelectedLocation({
              lat: mapCenter.lat(),
              lng: mapCenter.lng(),
            });
            
            // Bounce on drag end
            smoothPin.bounce();
          }
        });
      });
    }
  };

  if (user) {
    initMap();
  }

  // Cleanup
  return () => {
    if (centerMarkerRef.current && centerMarkerRef.current.setMap) {
      centerMarkerRef.current.setMap(null);
    }
  };
}, [user, isBottomSheetOpen]);


  // When editing, center map on the location
  useEffect(() => {
    if (map && selectedLocation && isEditMode) {
      map.setCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    }
  }, [map, selectedLocation, isEditMode]);

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

      // Clear selected marker
      setSelectedMarkerLocation(null);

      // Refetch locations to update the map
      const locationsResponse = await fetch("/api/locations");
      if (locationsResponse.ok) {
        const data = await locationsResponse.json();
        setAllLocations(data.locations || []);
      }

      // Clear message after 2 seconds
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
        photoConfidence,
        notes,
        pointType,
        isSponsored: false,
        ...(imageUrls.length > 0 && { images: imageUrls }),
      };

      let response;
      if (isEditMode && editingLocationId) {
        // Update existing location - use admin endpoint if user is admin
        const endpoint = user?.role === 'ADMIN'
          ? `/api/admin/locations/${editingLocationId}`
          : `/api/user/locations/${editingLocationId}`;

        response = await fetch(endpoint, {
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

      // Reset edit mode and selected marker
      setIsEditMode(false);
      setEditingLocationId(null);
      setSelectedMarkerLocation(null);

      // Refetch locations to show updated marker
      const locationsResponse = await fetch("/api/locations");
      if (locationsResponse.ok) {
        const data = await locationsResponse.json();
        setAllLocations(data.locations || []);
      }

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


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  // Show form only if not viewing another user's location
  const showForm =
    !selectedMarkerLocation || selectedMarkerLocation.userId === user.id;

  const formContent = showForm ? (
    <form onSubmit={handleSubmit} className="space-y-8 text-base" dir="rtl">
      <div className="flex items-center justify-between mt-4 mb-3">
        <h2 className="text-xl font-bold text-white text-center flex-1">
          {isEditMode ? "تعديل الموقع" : "اضافة موقع جديد"}
        </h2>
        {isEditMode && (
          <button
            type="button"
            onClick={() => {
              setIsEditMode(false);
              setEditingLocationId(null);
              setCity("");
              setPopularPlaceName("");
              setFormalPlaceName("");
              setStreet("");
              setSide("");
              setPath("");
              setDir("");
              setLine("");
              setCategory("");
              setBelongsToRoute("");
              setImages([]);
              setPhotoConfidence("100");
              setNotes("");
              setPointType("new");
              setMessage(null);
            }}
            className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
            title="إلغاء التعديل"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {isEditMode && (
        <div className="bg-blue-900/30 border border-blue-700 rounded-2xl p-3 text-center">
          <p className="text-blue-300 text-sm">
            🔄 وضع التعديل - تحرير الموقع الحالي
          </p>
        </div>
      )}

      {/* 1. City - المدينة */}
      <div>
        <div className="relative">
          <select
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full pr-14 pl-12 py-4 bg-gray-800 border-2 border-gray-700 rounded-xl text-white text-base focus:outline-none focus:border-blue-500 appearance-none peer"
            style={{ direction: "rtl" }}
            required
          >
            <option value=""></option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label
            htmlFor="city"
            className={`absolute right-10 bg-gray-800 px-2 text-gray-400 transition-all pointer-events-none ${city
                ? "-top-3 text-sm text-blue-400"
                : "top-1/2 -translate-y-1/2 text-base"
              }`}
            style={{ direction: "rtl" }}
          >
            المدينة *
          </label>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
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

      {/* 2. Neighborhood/Area - الحي / المنطقة */}
      <div>
        <div className="relative">
          <input
            type="text"
            id="side"
            value={side}
            onChange={(e) => setSide(e.target.value)}
            className="w-full pr-14 pl-6 py-4 bg-gray-800 border-2 border-gray-700 rounded-xl text-white text-base focus:outline-none focus:border-blue-500 peer placeholder-transparent"
            style={{ direction: "rtl" }}
            placeholder="الحي / المنطقة"
            required
          />
          <label
            htmlFor="side"
            className={`absolute right-10 bg-gray-800 px-2 text-gray-400 transition-all pointer-events-none ${side
                ? "-top-3 text-sm text-blue-400"
                : "top-1/2 -translate-y-1/2 text-base peer-focus:-top-3 peer-focus:text-sm peer-focus:text-blue-400"
              }`}
            style={{ direction: "rtl" }}
          >
            الحي / المنطقة *
          </label>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Street Name - اسم الشارع */}
      <div>
        <div className="relative">
          <input
            type="text"
            id="street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="w-full pr-14 pl-6 py-4 bg-gray-800 border-2 border-gray-700 rounded-xl text-white text-base focus:outline-none focus:border-blue-500 peer placeholder-transparent"
            style={{ direction: "rtl" }}
            placeholder="اسم الشارع"
          />
          <label
            htmlFor="street"
            className={`absolute right-10 bg-gray-800 px-2 text-gray-400 transition-all pointer-events-none ${street
                ? "-top-3 text-sm text-blue-400"
                : "top-1/2 -translate-y-1/2 text-base peer-focus:-top-3 peer-focus:text-sm peer-focus:text-blue-400"
              }`}
            style={{ direction: "rtl" }}
          >
            اسم الشارع
          </label>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 4. Popular Place Name - الاسم الشعبي الشائع للمكان */}
      <div>
        <div className="relative">
          <input
            type="text"
            id="popularPlaceName"
            value={popularPlaceName}
            onChange={(e) => setPopularPlaceName(e.target.value)}
            className="w-full pr-14 pl-6 py-4 bg-gray-800 border-2 border-gray-700 rounded-xl text-white text-base focus:outline-none focus:border-blue-500 peer placeholder-transparent"
            style={{ direction: "rtl" }}
            placeholder="الاسم الشعبي الشائع للمكان"
            required
          />
          <label
            htmlFor="popularPlaceName"
            className={`absolute right-10 bg-gray-800 px-2 text-gray-400 transition-all pointer-events-none ${popularPlaceName
                ? "-top-3 text-sm text-blue-400"
                : "top-1/2 -translate-y-1/2 text-base peer-focus:-top-3 peer-focus:text-sm peer-focus:text-blue-400"
              }`}
            style={{ direction: "rtl" }}
          >
            الاسم الشعبي الشائع للمكان *
          </label>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 5. Formal Place Name - الاسم الرسمي للمكان */}
      <div>
        <div className="relative">
          <input
            type="text"
            id="formalPlaceName"
            value={formalPlaceName}
            onChange={(e) => setFormalPlaceName(e.target.value)}
            className="w-full pr-14 pl-6 py-4 bg-gray-800 border-2 border-gray-700 rounded-xl text-white text-base focus:outline-none focus:border-blue-500 peer placeholder-transparent"
            style={{ direction: "rtl" }}
            placeholder="الاسم الرسمي للمكان"
          />
          <label
            htmlFor="formalPlaceName"
            className={`absolute right-10 bg-gray-800 px-2 text-gray-400 transition-all pointer-events-none ${formalPlaceName
                ? "-top-3 text-sm text-blue-400"
                : "top-1/2 -translate-y-1/2 text-base peer-focus:-top-3 peer-focus:text-sm peer-focus:text-blue-400"
              }`}
            style={{ direction: "rtl" }}
          >
            الاسم الرسمي للمكان
          </label>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 6. Beside - بجانب */}
      <div>
        <div className="relative">
          <input
            type="text"
            id="path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="w-full pr-14 pl-6 py-4 bg-gray-800 border-2 border-gray-700 rounded-xl text-white text-base focus:outline-none focus:border-blue-500 peer placeholder-transparent"
            style={{ direction: "rtl" }}
            placeholder="بجانب"
          />
          <label
            htmlFor="path"
            className={`absolute right-10 bg-gray-800 px-2 text-gray-400 transition-all pointer-events-none ${path
                ? "-top-3 text-sm text-blue-400"
                : "top-1/2 -translate-y-1/2 text-base peer-focus:-top-3 peer-focus:text-sm peer-focus:text-blue-400"
              }`}
            style={{ direction: "rtl" }}
          >
            بجانب
          </label>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 7. Direction - باتجاه */}
      <div>
        <div className="relative">
          <input
            type="text"
            id="dir"
            value={dir}
            onChange={(e) => setDir(e.target.value)}
            className="w-full pr-14 pl-6 py-4 bg-gray-800 border-2 border-gray-700 rounded-xl text-white text-base focus:outline-none focus:border-blue-500 peer placeholder-transparent"
            style={{ direction: "rtl" }}
            placeholder="باتجاه"
          />
          <label
            htmlFor="dir"
            className={`absolute right-10 bg-gray-800 px-2 text-gray-400 transition-all pointer-events-none ${dir
                ? "-top-3 text-sm text-blue-400"
                : "top-1/2 -translate-y-1/2 text-base peer-focus:-top-3 peer-focus:text-sm peer-focus:text-blue-400"
              }`}
            style={{ direction: "rtl" }}
          >
            باتجاه
          </label>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 8. Bus/Service Line - خط سرفيس / باص */}
      <div>
        <div className="relative">
          <input
            type="text"
            id="line"
            value={line}
            onChange={(e) => setLine(e.target.value)}
            className="w-full pr-14 pl-6 py-4 bg-gray-800 border-2 border-gray-700 rounded-xl text-white text-base focus:outline-none focus:border-blue-500 peer placeholder-transparent"
            style={{ direction: "rtl" }}
            placeholder="خط سرفيس / باص"
          />
          <label
            htmlFor="line"
            className={`absolute right-10 bg-gray-800 px-2 text-gray-400 transition-all pointer-events-none ${line
                ? "-top-3 text-sm text-blue-400"
                : "top-1/2 -translate-y-1/2 text-base peer-focus:-top-3 peer-focus:text-sm peer-focus:text-blue-400"
              }`}
            style={{ direction: "rtl" }}
          >
            خط سرفيس / باص
          </label>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 9. Category - التصنيف */}
      <div>
        <div className="relative" ref={categoryDropdownRef}>
          <button
            type="button"
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="w-full pr-14 pl-12 py-4 bg-gray-800 border-2 border-gray-700 rounded-xl text-white text-base focus:outline-none focus:border-blue-500 appearance-none text-right"
            style={{ direction: "rtl" }}
          >
            {category ? (
              <span className="flex items-center gap-2">
                {(() => {
                  const Icon = getCategoryIcon(category);
                  return <Icon className="shrink-0" />;
                })()}
                <span>{CATEGORIES.find(cat => cat.value === category)?.label || category}</span>
              </span>
            ) : (
              <span className="text-gray-400"></span>
            )}
          </button>
          <label
            className={`absolute right-10 bg-gray-800 px-2 text-gray-400 transition-all pointer-events-none ${category
                ? "-top-3 text-sm text-blue-400"
                : "top-1/2 -translate-y-1/2 text-base"
              }`}
            style={{ direction: "rtl" }}
          >
            التصنيف *
          </label>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
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
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg
              className={`w-5 h-5 transition-transform ${isCategoryDropdownOpen ? "rotate-180" : ""
                }`}
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
          {isCategoryDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-gray-800 border-2 border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
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
                    className="w-full px-4 py-3 text-right hover:bg-gray-700 transition-colors flex items-center gap-3 text-white"
                    style={{ direction: "rtl" }}
                  >
                    <Icon className="shrink-0 text-lg" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Photo Upload and Confidence */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 items-start">
          {/* Upload Button - Smaller, no image inside */}
          <label
            htmlFor="images"
            className="shrink-0 w-20 h-20 bg-gray-800 border border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-750 transition-colors"
          >
            <svg
              className="w-8 h-8 text-gray-400 mb-1"
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
            <span className="text-gray-400 text-xs">صورة</span>
            {images.length > 0 && (
              <span className="text-white text-xs font-medium mt-0.5">
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

        {/* Image Preview Grid */}
        {images.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm" dir="rtl">
                الصور المحددة ({images.length})
              </span>
              <button
                type="button"
                onClick={() => setImages([])}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                حذف الكل
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-gray-700"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setImages(images.filter((_, i) => i !== index));
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <svg
                        className="w-4 h-4"
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
                  <div className="absolute top-1 left-1 bg-gray-900/80 text-white text-xs px-1.5 py-0.5 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <div className="relative">
          <input
            type="text"
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full pr-14 pl-6 py-4 bg-gray-800 border-2 border-gray-700 rounded-xl text-white text-base focus:outline-none focus:border-blue-500 peer placeholder-transparent"
            style={{ direction: "rtl" }}
            placeholder="ملاحظة"
          />
          <label
            htmlFor="notes"
            className={`absolute right-10 bg-gray-800 px-2 text-gray-400 transition-all pointer-events-none ${notes
                ? "-top-3 text-sm text-blue-400"
                : "top-1/2 -translate-y-1/2 text-base peer-focus:-top-3 peer-focus:text-sm peer-focus:text-blue-400"
              }`}
            style={{ direction: "rtl" }}
          >
            ملاحظة
          </label>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-base ${message.type === "success"
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
  ) : null;

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-gray-900">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="md:w-96 bg-gray-900 shadow-lg flex flex-col shrink-0 border-r border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3 mb-4">
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
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="بحث عن موقع"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-transparent border border-gray-700/50 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
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
            </div>
          </div>

          {/* Search Results, Selected Location, or Stats Section */}
          {selectedMarkerLocation ? (
            <div className="flex-1 overflow-y-auto bg-gray-900">
              <div className="px-4 py-4 border-b border-gray-800 bg-gray-800/50">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-white" dir="rtl">
                    {selectedMarkerLocation.name || "موقع"}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedMarkerLocation(null);
                    }}
                    className="text-gray-400 hover:text-white"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2 text-sm" dir="rtl">
                  {selectedMarkerLocation.category && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 shrink-0">الفئة:</span>
                      <span className="text-white flex items-center gap-2">
                        {getCategoryDisplay(selectedMarkerLocation.category)}
                      </span>
                    </div>
                  )}
                  {selectedMarkerLocation.formalPlaceName && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 shrink-0">
                        الاسم الرسمي:
                      </span>
                      <span className="text-white">
                        {selectedMarkerLocation.formalPlaceName}
                      </span>
                    </div>
                  )}
                  {selectedMarkerLocation.city && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 shrink-0">
                        المدينة:
                      </span>
                      <span className="text-white">
                        {selectedMarkerLocation.city}
                      </span>
                    </div>
                  )}
                  {selectedMarkerLocation.side && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 shrink-0">
                        الحي / المنطقة:
                      </span>
                      <span className="text-white">
                        {selectedMarkerLocation.side}
                      </span>
                    </div>
                  )}
                  {selectedMarkerLocation.street && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 shrink-0">
                        الشارع:
                      </span>
                      <span className="text-white">
                        {selectedMarkerLocation.street}
                      </span>
                    </div>
                  )}
                  {selectedMarkerLocation.path && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 shrink-0">
                        بجانب:
                      </span>
                      <span className="text-white">
                        {selectedMarkerLocation.path}
                      </span>
                    </div>
                  )}
                  {selectedMarkerLocation.dir && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 shrink-0">
                        باتجاه:
                      </span>
                      <span className="text-white">
                        {selectedMarkerLocation.dir}
                      </span>
                    </div>
                  )}
                  {selectedMarkerLocation.line && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 shrink-0">خط سرفيس / باص:</span>
                      <span className="text-white">
                        {selectedMarkerLocation.line}
                      </span>
                    </div>
                  )}
                  {selectedMarkerLocation.belongsToRoute && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 shrink-0">
                        ينتمي للمسار:
                      </span>
                      <span className="text-white">
                        {selectedMarkerLocation.belongsToRoute}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 shrink-0">
                      الإحداثيات:
                    </span>
                    <span className="text-white font-mono text-xs">
                      {selectedMarkerLocation.latitude.toFixed(6)},{" "}
                      {selectedMarkerLocation.longitude.toFixed(6)}
                    </span>
                  </div>
                  {selectedMarkerLocation.photoConfidence && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 shrink-0">
                        الدقة:
                      </span>
                      <span className="text-white">
                        {selectedMarkerLocation.photoConfidence}%
                      </span>
                    </div>
                  )}
                  {selectedMarkerLocation.isSponsored && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 shrink-0">
                        ممول:
                      </span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                        نعم
                      </span>
                    </div>
                  )}
                  {selectedMarkerLocation.status && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 shrink-0">
                        الحالة:
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${selectedMarkerLocation.status === "APPROVED"
                            ? "bg-green-500/20 text-green-400"
                            : selectedMarkerLocation.status === "REJECTED"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                      >
                        {selectedMarkerLocation.status === "APPROVED"
                          ? "موافق عليه"
                          : selectedMarkerLocation.status === "REJECTED"
                            ? "مرفوض"
                            : "قيد المراجعة"}
                      </span>
                    </div>
                  )}
                  {selectedMarkerLocation.images && selectedMarkerLocation.images.length > 0 && (
                    <div className="flex flex-col gap-2 pt-2">
                      <span className="text-gray-400">الصور:</span>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedMarkerLocation.images.map((image: string, index: number) => (
                          <img
                            key={index}
                            src={image}
                            alt={`صورة ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(image, '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedMarkerLocation.notes && (
                    <div className="flex flex-col gap-1 pt-2">
                      <span className="text-gray-400">ملاحظات:</span>
                      <span className="text-white bg-gray-900/50 p-2 rounded-lg">
                        {selectedMarkerLocation.notes}
                      </span>
                    </div>
                  )}
                  {selectedMarkerLocation.user && (
                    <div className="flex items-start gap-2 pt-2 border-t border-gray-700">
                      <span className="text-gray-400 shrink-0">
                        أضيف بواسطة:
                      </span>
                      <span className="text-white">
                        {selectedMarkerLocation.user.name} (
                        {selectedMarkerLocation.user.email})
                      </span>
                    </div>
                  )}
                  {selectedMarkerLocation.createdAt && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 shrink-0">
                        تاريخ الإضافة:
                      </span>
                      <span className="text-white text-md">
                        {new Date(
                          selectedMarkerLocation.createdAt
                        ).toLocaleString("ar-SY").replaceAll('/', '-')}
                      </span>
                    </div>
                  )}
                  {selectedMarkerLocation.updatedAt &&
                    selectedMarkerLocation.updatedAt !==
                    selectedMarkerLocation.createdAt && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-400 shrink-0">
                          آخر تحديث:
                        </span>
                        <span className="text-white text-md">
                          {new Date(
                            selectedMarkerLocation.updatedAt
                          ).toLocaleString("ar-SY").replaceAll('/', '-')}
                        </span>
                      </div>
                    )}
                </div>

                {/* Open in Google Maps button - always visible */}
                <div className="mt-4">
                  <button
                    onClick={() => {
                      const googleMapsUrl = `https://www.google.com/maps?q=${selectedMarkerLocation.latitude},${selectedMarkerLocation.longitude}`;
                      window.open(googleMapsUrl, '_blank');
                    }}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    فتح في خرائط جوجل
                  </button>
                </div>

                {/* Edit and Delete buttons - show if user owns this location or is admin */}
                {(selectedMarkerLocation.userId === user?.id || user?.role === 'ADMIN') && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => {
                        const locationToEdit = selectedMarkerLocation;
                        setSelectedMarkerLocation(null);

                        setTimeout(() => {
                          setIsEditMode(true);
                          setEditingLocationId(locationToEdit.id);
                          setCity(locationToEdit.city || "");
                          setPopularPlaceName(locationToEdit.name || "");
                          setFormalPlaceName(
                            locationToEdit.formalPlaceName || ""
                          );
                          setStreet(locationToEdit.street || "");
                          setSide(locationToEdit.side || "");
                          setPath(locationToEdit.path || "");
                          setDir(locationToEdit.dir || "");
                          setLine(locationToEdit.line || "");
                          setCategory(locationToEdit.category || "");
                          setBelongsToRoute(
                            locationToEdit.belongsToRoute || ""
                          );
                          setPhotoConfidence(
                            (locationToEdit.photoConfidence || "100") as
                            | "100"
                            | "90"
                          );
                          setNotes(locationToEdit.notes || "");
                          setPointType(
                            (locationToEdit.pointType || "edit") as
                            | "new"
                            | "edit"
                          );

                          if (map) {
                            map.panTo({
                              lat: locationToEdit.latitude,
                              lng: locationToEdit.longitude,
                            });
                          }

                          setSelectedLocation({
                            lat: locationToEdit.latitude,
                            lng: locationToEdit.longitude,
                          });
                        }, 50);
                      }}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      تعديل الموقع
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(selectedMarkerLocation.id)
                      }
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      حذف الموقع
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : searchQuery.trim() ? (
            <div className="flex-1 overflow-y-auto bg-gray-900">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-400" dir="rtl">
                    نتائج البحث ({filteredLocations.length})
                  </h3>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    مسح
                  </button>
                </div>

                {filteredLocations.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-600 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-400 text-sm">لا توجد نتائج</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredLocations.map((location) => (
                      <div
                        key={location.id}
                        onClick={() => {
                          if (map) {
                            map.panTo({
                              lat: location.latitude,
                              lng: location.longitude,
                            });
                            map.setZoom(17);
                          }
                          setSelectedMarkerLocation(location);
                        }}
                        className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-2xl p-4 cursor-pointer transition-all hover:border-gray-600 group"
                        dir="rtl"
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                            <svg
                              className="w-5 h-5 text-gray-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-sm mb-1 truncate">
                              {location.name}
                            </h4>
                            <div className="space-y-1">
                              {location.city && (
                                <p className="text-gray-400 text-xs flex items-center gap-1">
                                  <span>📍</span>
                                  <span className="truncate">
                                    {location.city}
                                  </span>
                                </p>
                              )}
                              {location.street && (
                                <p className="text-gray-400 text-xs flex items-center gap-1">
                                  <span>🛣️</span>
                                  <span className="truncate">
                                    {location.street}
                                  </span>
                                </p>
                              )}
                              {location.category && (
                                <p className="text-gray-500 text-xs truncate">
                                  {location.category}
                                </p>
                              )}
                            </div>
                            <div className="mt-2">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs ${location.status === "APPROVED"
                                    ? "bg-green-500/20 text-green-400"
                                    : location.status === "REJECTED"
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-yellow-500/20 text-yellow-400"
                                  }`}
                              >
                                {location.status === "APPROVED"
                                  ? "✓ موافق"
                                  : location.status === "REJECTED"
                                    ? "✗ مرفوض"
                                    : "⏳ قيد المراجعة"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Stats Section */}
              <div className="px-6 py-4 border-b border-gray-800">
                <div className="grid grid-cols-2 gap-3">
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

              <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
                {formContent}
              </div>
            </>
          )}
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />


        {/* Mobile Header */}
        <div className="md:hidden absolute top-0 left-0 right-0 bg-transparent">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
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
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="بحث عن موقع"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-700/50 rounded-full text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600"
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
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <Sheet
          ref={sheetRef}
          isOpen={isBottomSheetOpen}
          onClose={() => {
            // Callback required but sheet won't close due to disableDismiss
          }}
          onSnap={(index) => {
            setCurrentSnapIndex(index);
          }}
          snapPoints={[0, 0.2, 0.3, 0.5, 0.85, 1]}
          initialSnap={3}
          disableDismiss={true}
        >
          <Sheet.Container style={{ backgroundColor: "rgb(17, 24, 39)" }}>
            <Sheet.Header
              style={{
                backgroundColor: "rgb(17, 24, 39)",
                borderBottom: "1px solid rgb(31, 41, 55)",
              }}
            >
              <div className="flex items-center justify-between px-4 pt-3">

                <div className="flex-1 flex justify-center">
                  <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
                </div>
              </div>

              {/* Coordinates Display */}
              <div className="px-4  text-center border-b border-gray-800 flex items-center justify-between relative h-12">
                <button
                  onClick={() => {
                    setSelectedLocation(null);
                    setSelectedMarkerLocation(null);
                    if (markerRef.current) {
                      markerRef.current.setMap(null);
                      markerRef.current = null;
                    }
                    setIsBottomSheetOpen(false);
                  }}
                  className="w-8 h-8 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-750 transition-colors absolute left-4 top-1/2 -translate-y-1/2 z-10"
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
                <div className="flex items-center justify-center gap-4 text-sm flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Lat:</span>
                    <span className="text-white font-bold">
                      {selectedLocation?.lat.toFixed(6) ||
                        map?.getCenter()?.lat().toFixed(6) ||
                        "0.000000"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Lng:</span>
                    <span className="text-white font-bold">
                      {selectedLocation?.lng.toFixed(6) ||
                        map?.getCenter()?.lng().toFixed(6) ||
                        "0.000000"}
                    </span>
                  </div>
                </div>
              </div>
            </Sheet.Header>
            <Sheet.Content style={{ backgroundColor: "rgb(17, 24, 39)" }}>
              <div className="overflow-y-auto">
                {/* Selected Marker Location Info */}
                {selectedMarkerLocation && (
                  <div className="px-4 py-4 border-b border-gray-800 bg-gray-800/50">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-white" dir="rtl">
                        {selectedMarkerLocation.name || "موقع"}
                      </h3>
                      <button
                        onClick={() => {
                          setSelectedMarkerLocation(null);
                        }}
                        className="text-gray-400 hover:text-white"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-2 text-sm" dir="rtl">
                      {selectedMarkerLocation.category && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 shrink-0">الفئة:</span>
                          <span className="text-white flex items-center gap-2">
                            {getCategoryDisplay(selectedMarkerLocation.category)}
                          </span>
                        </div>
                      )}
                      {selectedMarkerLocation.formalPlaceName && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 shrink-0">
                            الاسم الرسمي:
                          </span>
                          <span className="text-white">
                            {selectedMarkerLocation.formalPlaceName}
                          </span>
                        </div>
                      )}
                      {selectedMarkerLocation.city && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 shrink-0">
                            المدينة:
                          </span>
                          <span className="text-white">
                            {selectedMarkerLocation.city}
                          </span>
                        </div>
                      )}
                      {selectedMarkerLocation.side && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 shrink-0">
                            الحي / المنطقة:
                          </span>
                          <span className="text-white">
                            {selectedMarkerLocation.side}
                          </span>
                        </div>
                      )}
                      {selectedMarkerLocation.street && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 shrink-0">
                            الشارع:
                          </span>
                          <span className="text-white">
                            {selectedMarkerLocation.street}
                          </span>
                        </div>
                      )}
                      {selectedMarkerLocation.path && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 shrink-0">
                            بجانب:
                          </span>
                          <span className="text-white">
                            {selectedMarkerLocation.path}
                          </span>
                        </div>
                      )}
                      {selectedMarkerLocation.dir && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 shrink-0">
                            باتجاه:
                          </span>
                          <span className="text-white">
                            {selectedMarkerLocation.dir}
                          </span>
                        </div>
                      )}
                      {selectedMarkerLocation.line && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 shrink-0">خط سرفيس / باص:</span>
                          <span className="text-white">
                            {selectedMarkerLocation.line}
                          </span>
                        </div>
                      )}
                      {selectedMarkerLocation.belongsToRoute && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 shrink-0">
                            ينتمي للمسار:
                          </span>
                          <span className="text-white">
                            {selectedMarkerLocation.belongsToRoute}
                          </span>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <span className="text-gray-400 shrink-0">
                          الإحداثيات:
                        </span>
                        <span className="text-white font-mono text-xs">
                          {selectedMarkerLocation.latitude.toFixed(6)},{" "}
                          {selectedMarkerLocation.longitude.toFixed(6)}
                        </span>
                      </div>
                      {selectedMarkerLocation.photoConfidence && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 shrink-0">
                            الدقة:
                          </span>
                          <span className="text-white">
                            {selectedMarkerLocation.photoConfidence}%
                          </span>
                        </div>
                      )}
                      {selectedMarkerLocation.isSponsored && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 shrink-0">
                            ممول:
                          </span>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                            نعم
                          </span>
                        </div>
                      )}
                      {selectedMarkerLocation.status && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 shrink-0">
                            الحالة:
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${selectedMarkerLocation.status === "APPROVED"
                                ? "bg-green-500/20 text-green-400"
                                : selectedMarkerLocation.status === "REJECTED"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                              }`}
                          >
                            {selectedMarkerLocation.status === "APPROVED"
                              ? "موافق عليه"
                              : selectedMarkerLocation.status === "REJECTED"
                                ? "مرفوض"
                                : "قيد المراجعة"}
                          </span>
                        </div>
                      )}
                      {selectedMarkerLocation.images && selectedMarkerLocation.images.length > 0 && (
                        <div className="flex flex-col gap-2 pt-2">
                          <span className="text-gray-400">الصور:</span>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedMarkerLocation.images.map((image: string, index: number) => (
                              <img
                                key={index}
                                src={image}
                                alt={`صورة ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => window.open(image, '_blank')}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedMarkerLocation.notes && (
                        <div className="flex flex-col gap-1 pt-2">
                          <span className="text-gray-400">ملاحظات:</span>
                          <span className="text-white bg-gray-900/50 p-2 rounded-lg">
                            {selectedMarkerLocation.notes}
                          </span>
                        </div>
                      )}
                      {selectedMarkerLocation.user && (
                        <div className="flex items-start gap-2 pt-2 border-t border-gray-700">
                          <span className="text-gray-400 shrink-0">
                            أضيف بواسطة:
                          </span>
                          <span className="text-white">
                            {selectedMarkerLocation.user.name} (
                            {selectedMarkerLocation.user.email})
                          </span>
                        </div>
                      )}
                      {selectedMarkerLocation.createdAt && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 shrink-0">
                            تاريخ الإضافة:
                          </span>
                          <span className="text-white text-md">
                            {new Date(
                              selectedMarkerLocation.createdAt
                            ).toLocaleString("ar-SY").replaceAll('/', '-')}
                          </span>
                        </div>
                      )}
                      {selectedMarkerLocation.updatedAt &&
                        selectedMarkerLocation.updatedAt !==
                        selectedMarkerLocation.createdAt && (
                          <div className="flex items-start gap-2">
                            <span className="text-gray-400 shrink-0">
                              آخر تحديث:
                            </span>
                            <span className="text-white text-md">
                              {new Date(
                                selectedMarkerLocation.updatedAt
                              ).toLocaleString("ar-SY").replaceAll('/', '-')}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Open in Google Maps button - always visible */}
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          const googleMapsUrl = `https://www.google.com/maps?q=${selectedMarkerLocation.latitude},${selectedMarkerLocation.longitude}`;
                          window.open(googleMapsUrl, '_blank');
                        }}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        فتح في خرائط جوجل
                      </button>
                    </div>

                    {/* Edit and Delete buttons - show if user owns this location or is admin */}
                    {(selectedMarkerLocation.userId === user?.id || user?.role === 'ADMIN') && (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => {
                            console.log(
                              "Loading location for editing:",
                              selectedMarkerLocation
                            );

                            // First, clear selected marker to show the form
                            const locationToEdit = selectedMarkerLocation;
                            setSelectedMarkerLocation(null);

                            // Then load the location data after a brief delay to ensure form is visible
                            setTimeout(() => {
                              setIsEditMode(true);
                              setEditingLocationId(locationToEdit.id);
                              setCity(locationToEdit.city || "");
                              setPopularPlaceName(locationToEdit.name || "");
                              setFormalPlaceName(
                                locationToEdit.formalPlaceName || ""
                              );
                              setStreet(locationToEdit.street || "");
                              setSide(locationToEdit.side || "");
                              setPath(locationToEdit.path || "");
                              setDir(locationToEdit.dir || "");
                              setLine(locationToEdit.line || "");
                              setCategory(locationToEdit.category || "");
                              setBelongsToRoute(
                                locationToEdit.belongsToRoute || ""
                              );
                              setPhotoConfidence(
                                (locationToEdit.photoConfidence || "100") as
                                | "100"
                                | "90"
                              );
                              setNotes(locationToEdit.notes || "");
                              setPointType(
                                (locationToEdit.pointType || "edit") as
                                | "new"
                                | "edit"
                              );

                              if (map) {
                                map.panTo({
                                  lat: locationToEdit.latitude,
                                  lng: locationToEdit.longitude,
                                });
                              }

                              setSelectedLocation({
                                lat: locationToEdit.latitude,
                                lng: locationToEdit.longitude,
                              });
                            }, 50);
                          }}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          تعديل الموقع
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(selectedMarkerLocation.id)
                          }
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          حذف الموقع
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Search Results or Stats/Form Section */}
                {searchQuery.trim() ? (
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-3">
                      <h3
                        className="text-sm font-semibold text-gray-400"
                        dir="rtl"
                      >
                        نتائج البحث ({filteredLocations.length})
                      </h3>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                      >
                        مسح
                      </button>
                    </div>

                    {filteredLocations.length === 0 ? (
                      <div className="text-center py-12">
                        <svg
                          className="w-16 h-16 mx-auto text-gray-600 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-gray-400 text-sm">لا توجد نتائج</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredLocations.map((location) => (
                          <div
                            key={location.id}
                            onClick={() => {
                              // Navigate to location on map
                              if (map) {
                                map.panTo({
                                  lat: location.latitude,
                                  lng: location.longitude,
                                });
                                map.setZoom(16);
                              }
                              // Clear search and show location details
                              setSearchQuery("");
                              setSelectedMarkerLocation(location);
                            }}
                            className="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:bg-gray-750 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4
                                className="text-white font-semibold text-sm"
                                dir="rtl"
                              >
                                {location.name || "موقع"}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs shrink-0 mr-2 ${location.status === "APPROVED"
                                    ? "bg-green-500/20 text-green-400"
                                    : location.status === "REJECTED"
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-yellow-500/20 text-yellow-400"
                                  }`}
                              >
                                {location.status === "APPROVED"
                                  ? "موافق"
                                  : location.status === "REJECTED"
                                    ? "مرفوض"
                                    : "انتظار"}
                              </span>
                            </div>
                            <div className="space-y-1 text-xs">
                              {location.city && (
                                <p className="text-gray-400" dir="rtl">
                                  <span className="text-gray-500">
                                    المدينة:
                                  </span>{" "}
                                  {location.city}
                                </p>
                              )}
                              {location.street && (
                                <p className="text-gray-400" dir="rtl">
                                  <span className="text-gray-500">الشارع:</span>{" "}
                                  {location.street}
                                </p>
                              )}
                              {location.category && (
                                <p className="text-gray-400" dir="rtl">
                                  <span className="text-gray-500">الفئة:</span>{" "}
                                  {location.category}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Stats Section */}
                    <div className="px-4 pb-3 border-b border-gray-800">
                      <div className="grid grid-cols-4 gap-2">
                        <div className="bg-gray-800 rounded-2xl p-3 text-center border border-gray-700">
                          <div className="text-2xl font-bold text-white">
                            {stats.total}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            المجموع
                          </div>
                        </div>
                        <div className="bg-green-900/30 rounded-2xl p-3 text-center border border-green-800">
                          <div className="text-2xl font-bold text-green-400">
                            {stats.approved}
                          </div>
                          <div className="text-xs text-green-400 mt-1">
                            موافق
                          </div>
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
                    <div className="p-4 bg-gray-900">{formContent}</div>
                  </>
                )}
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
