export interface SessionUser {
  id: number;
  email: string;
  role: string;
  organization_id?: number | null;
}

export interface DroneResource {
  resource_id: number;
  name: string;
  kind: string;
  user_id?: number | null;
  organization_id?: number | null;
  mqtt_namespace: string | null;
  serial?: string | null;
  is_online?: boolean;
  last_heartbeat?: string | null;
  has_thermal_camera?: boolean;
  has_hires_camera?: boolean;
  flight_range_km?: number | null;
  flight_ceiling_m?: number | null;
  activated?: boolean;
  status?: string;
  localization?: { lat: number; lon: number } | null;
}

export interface DroneConnection {
  resource_id: number;
  name: string;
  mqtt_namespace: string;
  is_online: boolean;
  last_heartbeat: string | null;
  has_thermal_camera: boolean;
  has_hires_camera: boolean;
  flight_range_km: number | null;
  flight_ceiling_m: number | null;
  activated: boolean;
  serial: string | null;
}

export interface AttitudePayload {
  roll_deg: number;
  pitch_deg: number;
  yaw_deg: number;
  ts?: number;
}

export interface PositionPayload {
  lat_deg: number;
  lon_deg: number;
  alt_msl_m?: number;
  alt_rel_m?: number;
  ts?: number;
}

export interface BatteryPayload {
  voltage_v: number;
  current_a: number;
  "remaining_%": number;
  ts?: number;
}

export interface StatePayload {
  armed: boolean;
  arming_ready?: boolean;
  gps_lock?: boolean;
  gps_lock_level?: number | string;
  flight_mode?: string;
  mission_speed_ms?: number | null;
  ts?: number;
}

export interface OnlinePayload {
  online: boolean;
  ts?: number;
}

export interface CommandResponse {
  action: string;
  success: boolean;
  message?: string;
  data?: unknown;
}

export type MissionItem =
  | { type: "takeoff"; alt: number }
  | { type: "waypoint"; lat: number; lon: number; alt: number; hold_time?: number }
  | { type: "land"; lat: number | null; lon: number | null; alt: number };

export interface MissionBody {
  name?: string;
  mission_items: MissionItem[];
  speed_ms?: number;
}
