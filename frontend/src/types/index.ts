export type UserRole = "tug_owner" | "barge_owner" | "shipper";
export type VesselType = "tug" | "barge";
export type ShipmentStatus = "open" | "matched" | "booked" | "completed" | "cancelled";
export type BookingStatus = "pending" | "confirmed" | "in_transit" | "completed" | "cancelled";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  company_name: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Port {
  id: string;
  name: string;
  code: string;
  city: string;
  province: string;
  island: string;
  latitude: number;
  longitude: number;
  is_major: boolean;
}

export interface Vessel {
  id: string;
  owner_id: string;
  vessel_type: VesselType;
  name: string;
  registration_number: string;
  capacity_tons: number;
  length_m: number;
  beam_m: number;
  draft_m: number;
  horsepower: number | null;
  home_port: string;
  current_location: string;
  is_available: boolean;
  daily_rate_usd: number;
  description: string | null;
  created_at: string;
}

export interface Shipment {
  id: string;
  shipper_id: string;
  commodity_type: string;
  cargo_weight_tons: number;
  origin_port_id: string;
  destination_port_id: string;
  origin_port?: Port;
  destination_port?: Port;
  departure_date: string;
  arrival_deadline: string;
  special_requirements: string | null;
  status: ShipmentStatus;
  created_at: string;
}

export interface AIMatch {
  id: string;
  shipment_id: string;
  vessel_id: string;
  match_score: number;
  ai_reasoning: string;
  estimated_route: {
    waypoints?: Array<{ name: string; latitude: number; longitude: number; type: string }>;
    distance_nm?: number;
    duration_days?: number;
    sea_lanes?: string[];
    risk_notes?: string[];
    best_season?: string;
  };
  estimated_distance_nm: number | null;
  estimated_duration_days: number | null;
  estimated_price_usd: number | null;
  price_breakdown: {
    base_freight?: number;
    fuel_surcharge?: number;
    port_fees?: number;
    total?: number;
  };
  vessel?: Vessel;
  created_at: string;
}

export interface Booking {
  id: string;
  shipment_id: string;
  vessel_id: string;
  match_id: string | null;
  shipper_id: string;
  agreed_price_usd: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}
