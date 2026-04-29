import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CommandResponse,
  DroneConnection,
  MissionBody,
  MissionItem,
} from "../api/types";
import type { DroneTelemetry } from "./use-drone-socket";

export const DUMMY_PARAM = "dummy";
export const DUMMY_RESOURCE_ID = -1;

export function isDummyParam(param: string | undefined) {
  return param === DUMMY_PARAM;
}

const HOME_LAT = 40.4168;
const HOME_LON = -3.7038;
const TICK_MS = 100;
const DT = TICK_MS / 1000;
const CLIMB_MS = 2;
const DESCENT_MS = 1.5;
const BATTERY_DRAIN_PER_SEC = 0.05;

type Phase =
  | "idle"
  | "taking_off_solo"
  | "taking_off_mission"
  | "cruising"
  | "going_to_lz"
  | "landing";

interface DummyState {
  armed: boolean;
  flight_mode: string;
  lat: number;
  lon: number;
  alt_rel: number;
  yaw: number;
  battery_pct: number;
  phase: Phase;
  targetAlt: number;
  mission: MissionItem[] | null;
  routeIdx: number;
  speed_ms: number;
}

function initialState(): DummyState {
  return {
    armed: false,
    flight_mode: "STABILIZE",
    lat: HOME_LAT,
    lon: HOME_LON,
    alt_rel: 0,
    yaw: 0,
    battery_pct: 95,
    phase: "idle",
    targetAlt: 0,
    mission: null,
    routeIdx: 0,
    speed_ms: 5,
  };
}

function distMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const f1 = (lat1 * Math.PI) / 180;
  const f2 = (lat2 * Math.PI) / 180;
  const df = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(df / 2) ** 2 +
    Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingDeg(lat1: number, lon1: number, lat2: number, lon2: number) {
  const f1 = (lat1 * Math.PI) / 180;
  const f2 = (lat2 * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dl) * Math.cos(f2);
  const x =
    Math.cos(f1) * Math.sin(f2) -
    Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function moveTowards(
  lat: number,
  lon: number,
  tlat: number,
  tlon: number,
  meters: number,
) {
  const d = distMeters(lat, lon, tlat, tlon);
  if (d <= meters || d < 0.1) {
    return { lat: tlat, lon: tlon, reached: true };
  }
  const f = meters / d;
  return {
    lat: lat + (tlat - lat) * f,
    lon: lon + (tlon - lon) * f,
    reached: false,
  };
}

function getWaypoints(items: MissionItem[]) {
  return items.filter((it) => it.type === "waypoint") as Array<{
    type: "waypoint";
    lat: number;
    lon: number;
    alt: number;
    hold_time?: number;
  }>;
}

function getTakeoffAlt(items: MissionItem[], fallback = 10) {
  const t = items.find((it) => it.type === "takeoff") as
    | { type: "takeoff"; alt: number }
    | undefined;
  return t?.alt ?? fallback;
}

function getLanding(items: MissionItem[]) {
  const l = items.find((it) => it.type === "land") as
    | { type: "land"; lat: number | null; lon: number | null; alt: number }
    | undefined;
  if (!l || l.lat == null || l.lon == null) return null;
  return { lat: l.lat, lon: l.lon, alt: l.alt };
}

interface MutateOpts<TData = unknown> {
  onSuccess?: (data: TData) => void;
  onError?: (err: unknown) => void;
}

interface DummyMutation<TArg = unknown, TData = unknown> {
  mutate: (arg?: TArg, opts?: MutateOpts<TData>) => void;
  mutateAsync: (arg?: TArg) => Promise<TData>;
}

export interface DummyCmds {
  arm: DummyMutation;
  disarm: DummyMutation;
  setGuided: DummyMutation;
  takeoff: DummyMutation<number>;
  land: DummyMutation;
  startMission: DummyMutation;
  uploadMission: DummyMutation<MissionBody>;
  getMission: DummyMutation;
  cameraOn: DummyMutation;
  cameraOff: DummyMutation;
  cameraStatus: DummyMutation;
  stream: DummyMutation;
  detectionOn: DummyMutation;
  detectionOff: DummyMutation;
  detectionStatus: DummyMutation;
}

export interface UseDummyDrone {
  conn: DroneConnection;
  telemetry: DroneTelemetry;
  connected: boolean;
  subscribed: boolean;
  online: boolean;
  onResponse: (cb: (r: CommandResponse) => void) => () => void;
  cmds: DummyCmds;
}

const dummyConn: DroneConnection = {
  resource_id: DUMMY_RESOURCE_ID,
  name: "Dron Demo",
  mqtt_namespace: "demo/dummy",
  is_online: true,
  last_heartbeat: null,
  has_thermal_camera: false,
  has_hires_camera: false,
  flight_range_km: 5,
  flight_ceiling_m: 120,
  activated: true,
  serial: "DEMO-0001",
};

export function useDummyDrone(opts: { enabled: boolean }): UseDummyDrone {
  const { enabled } = opts;
  const stateRef = useRef<DummyState>(initialState());
  const [, force] = useState(0);
  const respListeners = useRef<Set<(r: CommandResponse) => void>>(new Set());

  const rerender = useCallback(() => force((n) => (n + 1) % 1_000_000), []);

  const emitResp = useCallback(
    (action: string, success: boolean, message?: string, data?: unknown) => {
      respListeners.current.forEach((cb) =>
        cb({ action, success, message, data }),
      );
    },
    [],
  );

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      const cur = stateRef.current;
      const next: DummyState = { ...cur };
      const events: Array<{ action: string; success: boolean; message?: string }> = [];

      if (cur.armed) {
        next.battery_pct = Math.max(0, cur.battery_pct - BATTERY_DRAIN_PER_SEC * DT);
      }

      if (cur.phase === "taking_off_solo" || cur.phase === "taking_off_mission") {
        const climb = CLIMB_MS * DT;
        if (cur.alt_rel + climb >= cur.targetAlt) {
          next.alt_rel = cur.targetAlt;
          if (cur.phase === "taking_off_mission" && cur.mission) {
            next.phase = "cruising";
            next.routeIdx = 0;
          } else {
            next.phase = "idle";
          }
        } else {
          next.alt_rel = cur.alt_rel + climb;
        }
      } else if (cur.phase === "cruising" && cur.mission) {
        const wps = getWaypoints(cur.mission);
        if (cur.routeIdx >= wps.length) {
          const lz = getLanding(cur.mission);
          next.phase = lz ? "going_to_lz" : "landing";
        } else {
          const wp = wps[cur.routeIdx];
          const meters = cur.speed_ms * DT;
          const m = moveTowards(cur.lat, cur.lon, wp.lat, wp.lon, meters);
          next.lat = m.lat;
          next.lon = m.lon;
          next.yaw = bearingDeg(cur.lat, cur.lon, wp.lat, wp.lon);
          const dAlt = wp.alt - cur.alt_rel;
          const step = Math.sign(dAlt) * Math.min(Math.abs(dAlt), CLIMB_MS * DT);
          next.alt_rel = cur.alt_rel + step;
          if (m.reached) next.routeIdx = cur.routeIdx + 1;
        }
      } else if (cur.phase === "going_to_lz" && cur.mission) {
        const lz = getLanding(cur.mission);
        if (!lz) {
          next.phase = "landing";
        } else {
          const meters = cur.speed_ms * DT;
          const m = moveTowards(cur.lat, cur.lon, lz.lat, lz.lon, meters);
          next.lat = m.lat;
          next.lon = m.lon;
          next.yaw = bearingDeg(cur.lat, cur.lon, lz.lat, lz.lon);
          if (m.reached) next.phase = "landing";
        }
      } else if (cur.phase === "landing") {
        const desc = DESCENT_MS * DT;
        if (cur.alt_rel - desc <= 0) {
          next.alt_rel = 0;
          next.armed = false;
          next.flight_mode = "STABILIZE";
          next.phase = "idle";
          events.push({ action: "land_complete", success: true, message: "Touchdown" });
        } else {
          next.alt_rel = cur.alt_rel - desc;
        }
      }

      stateRef.current = next;
      rerender();
      events.forEach((e) => emitResp(e.action, e.success, e.message));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [enabled, emitResp, rerender]);

  const onResponse = useCallback(
    (cb: (r: CommandResponse) => void) => {
      respListeners.current.add(cb);
      return () => {
        respListeners.current.delete(cb);
      };
    },
    [],
  );

  const wrap = useCallback(
    <TArg = unknown, TData = unknown>(
      fn: (arg: TArg) => TData,
    ): DummyMutation<TArg, TData> => ({
      mutate: (arg, opts2) => {
        try {
          const data = fn(arg as TArg);
          queueMicrotask(() => opts2?.onSuccess?.(data));
        } catch (e) {
          queueMicrotask(() => opts2?.onError?.(e));
        }
      },
      mutateAsync: (arg) => {
        try {
          return Promise.resolve(fn(arg as TArg));
        } catch (e) {
          return Promise.reject(e);
        }
      },
    }),
    [],
  );

  const setS = useCallback(
    (mut: (s: DummyState) => DummyState) => {
      stateRef.current = mut(stateRef.current);
      rerender();
    },
    [rerender],
  );

  const cmds: DummyCmds = useMemo(() => ({
    arm: wrap(() => {
      setS((c) => ({ ...c, armed: true, flight_mode: "GUIDED" }));
      setTimeout(() => emitResp("arm", true, "Armed (demo)"), 30);
      return { success: true };
    }),
    disarm: wrap(() => {
      setS((c) => ({
        ...c,
        armed: false,
        phase: c.alt_rel > 0 ? c.phase : "idle",
      }));
      setTimeout(() => emitResp("disarm", true, "Disarmed (demo)"), 30);
      return { success: true };
    }),
    setGuided: wrap(() => {
      setS((c) => ({ ...c, flight_mode: "GUIDED" }));
      setTimeout(() => emitResp("set_mode/guided", true), 30);
      return { success: true };
    }),
    takeoff: wrap<number>((altM) => {
      const cur = stateRef.current;
      if (!cur.armed) {
        setTimeout(
          () => emitResp("takeoff", false, "Drone disarmed"),
          30,
        );
        throw new Error("Drone disarmed");
      }
      setS((c) => ({
        ...c,
        phase: "taking_off_solo",
        targetAlt: altM,
        flight_mode: "GUIDED",
      }));
      setTimeout(() => emitResp("takeoff", true), 30);
      return { success: true };
    }),
    land: wrap(() => {
      setS((c) => ({ ...c, phase: "landing", flight_mode: "LAND" }));
      setTimeout(() => emitResp("land", true), 30);
      return { success: true };
    }),
    startMission: wrap(() => {
      const cur = stateRef.current;
      if (!cur.mission || cur.mission.length === 0) {
        setTimeout(
          () => emitResp("start_mission", false, "No mission uploaded"),
          30,
        );
        throw new Error("No mission");
      }
      const tAlt = getTakeoffAlt(cur.mission, 10);
      setS((c) => ({
        ...c,
        armed: true,
        flight_mode: "AUTO",
        phase: "taking_off_mission",
        targetAlt: tAlt,
        routeIdx: 0,
      }));
      setTimeout(() => emitResp("start_mission", true, "Mission started"), 30);
      return { success: true };
    }),
    uploadMission: wrap<MissionBody>((body) => {
      setS((c) => ({
        ...c,
        mission: body.mission_items,
        speed_ms: body.speed_ms ?? c.speed_ms,
      }));
      setTimeout(
        () => emitResp("mission", true, "Mission uploaded (demo)"),
        30,
      );
      return { success: true };
    }),
    getMission: wrap(() => {
      const cur = stateRef.current;
      const items = cur.mission ?? [];
      setTimeout(
        () =>
          emitResp("mission/get", true, undefined, {
            mission_items: items,
            speed_ms: cur.speed_ms,
          }),
        30,
      );
      return { success: true, data: { mission_items: items, speed_ms: cur.speed_ms } };
    }),
    cameraOn: wrap(() => {
      throw new Error("Cámara no disponible en demo");
    }),
    cameraOff: wrap(() => ({ success: true })),
    cameraStatus: wrap(() => ({ camera_on: false })),
    stream: wrap(() => ({ camera_on: false, stream_url: null })),
    detectionOn: wrap(() => ({
      success: false,
      message: "Detección no disponible en demo",
    })),
    detectionOff: wrap(() => ({ success: true })),
    detectionStatus: wrap(() => ({ data: { detection_on: false } })),
  }), [emitResp, setS, wrap]);

  const s = stateRef.current;
  const telemetry: DroneTelemetry = {
    attitude: { roll_deg: 0, pitch_deg: 0, yaw_deg: s.yaw },
    position: {
      lat_deg: s.lat,
      lon_deg: s.lon,
      alt_rel_m: s.alt_rel,
      alt_msl_m: s.alt_rel + 600,
    },
    battery_status: {
      voltage_v: 14 + (s.battery_pct / 100) * 2.8,
      current_a: s.armed ? 12 : 0.5,
      "remaining_%": s.battery_pct,
    },
    state: {
      armed: s.armed,
      arming_ready: true,
      gps_lock: true,
      gps_lock_level: 3,
      flight_mode: s.flight_mode,
      mission_speed_ms: s.speed_ms,
    },
  };

  return {
    conn: dummyConn,
    telemetry,
    connected: enabled,
    subscribed: enabled,
    online: enabled,
    onResponse,
    cmds,
  };
}
