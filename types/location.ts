export interface Location {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  category: string;
  isSponsored: boolean;
  images: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  belongsToRoute?: string;
  formalPlaceName?: string;
  notes?: string;
  photoConfidence?: number;
  pointType?: string;
  side?: string;
  street?: string;
  path?: string;
  dir?: string;
  line?: string;
}

export interface LocationFormData {
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  category: string;
  isSponsored: boolean;
  images: File[];
}

export const CATEGORIES = [
  "Restaurant",
  "Cafe",
  "Park",
  "Museum",
  "Shopping",
  "Entertainment",
  "Hotel",
  "Landmark",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
