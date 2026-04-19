import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { fetchTelemetrySeed } from "../api/drones";
import type {
  AttitudePayload,
  BatteryPayload,
  CommandResponse,
  PositionPayload,
  StatePayload,
} from "../api/types";

export interface DroneTelemetry {
  attitude: AttitudePayload | null;
  position: PositionPayload | null;
  battery_status: BatteryPayload | null;
  state: StatePayload | null;
}

export interface UseDroneSocket {
  socket: Socket | null;
  connected: boolean;
  subscribed: boolean;
  online: boolean;
  telemetry: DroneTelemetry;
  lastResponse: CommandResponse | null;
  onResponse: (cb: (r: CommandResponse) => void) => () => void;
}

const emptyTelemetry: DroneTelemetry = {
  attitude: null,
  position: null,
  battery_status: null,
  state: null,
};

function getJwt(): string | undefined {
  const m = document.cookie.match(/(?:^|;\s*)access_token_cookie=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : undefined;
}

export function useDroneSocket(
  droneId: number | undefined,
  mqttNamespace: string | null | undefined,
): UseDroneSocket {
  const [connected, setConnected] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [online, setOnline] = useState(false);
  const [telemetry, setTelemetry] = useState<DroneTelemetry>(emptyTelemetry);
  const [lastResponse, setLastResponse] = useState<CommandResponse | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const respListeners = useRef<Set<(r: CommandResponse) => void>>(new Set());

  const { data: seed } = useQuery({
    queryKey: ["drone-telemetry-seed", droneId],
    queryFn: () => fetchTelemetrySeed(droneId!),
    enabled: !!droneId && !!mqttNamespace,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!seed) return;
    const s = seed as Partial<DroneTelemetry> & { is_online?: boolean };
    setTelemetry((prev) => ({
      attitude: prev.attitude ?? s.attitude ?? null,
      position: prev.position ?? s.position ?? null,
      battery_status: prev.battery_status ?? s.battery_status ?? null,
      state: prev.state ?? s.state ?? null,
    }));
    if (s.is_online !== undefined) setOnline(s.is_online);
  }, [seed]);

  useEffect(() => {
    if (!droneId || !mqttNamespace) return;

    const WS_URL = import.meta.env.DEV
      ? window.location.origin
      : (import.meta.env.VITE_WS_URL as string) || window.location.origin;

    const token = getJwt();
    const s = io(WS_URL, {
      transports: ["websocket"],
      withCredentials: true,
      auth: token ? { token } : undefined,
      query: token ? { token } : undefined,
    });
    socketRef.current = s;

    s.on("connect", () => {
      setConnected(true);
      s.emit("drone:subscribe", { drone_id: droneId });
    });
    s.on("disconnect", () => {
      setConnected(false);
      setSubscribed(false);
    });
    s.on("drone:subscribed", (d: { online: boolean }) => {
      setSubscribed(true);
      setOnline(d.online);
    });
    s.on("drone:attitude", (msg: { data: AttitudePayload }) =>
      setTelemetry((t) => ({ ...t, attitude: msg.data })),
    );
    s.on("drone:position", (msg: { data: PositionPayload }) =>
      setTelemetry((t) => ({ ...t, position: msg.data })),
    );
    s.on("drone:battery_status", (msg: { data: BatteryPayload }) =>
      setTelemetry((t) => ({ ...t, battery_status: msg.data })),
    );
    s.on("drone:state", (msg: { data: StatePayload }) =>
      setTelemetry((t) => ({ ...t, state: msg.data })),
    );
    s.on("drone:online", (msg: { online: boolean }) => setOnline(msg.online));
    s.on(
      "drone:response",
      (msg: { action: string; data: any }) => {
        const payload = msg.data ?? {};
        const r: CommandResponse = {
          action: msg.action,
          success: !!payload.success,
          message: payload.message,
          data: payload.data ?? payload,
        };
        setLastResponse(r);
        respListeners.current.forEach((cb) => cb(r));
      },
    );

    return () => {
      try {
        s.emit("drone:unsubscribe", { drone_id: droneId });
      } catch {}
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
      setConnected(false);
      setSubscribed(false);
      setOnline(false);
      setTelemetry(emptyTelemetry);
      setLastResponse(null);
    };
  }, [droneId, mqttNamespace]);

  const onResponse = (cb: (r: CommandResponse) => void) => {
    respListeners.current.add(cb);
    return () => {
      respListeners.current.delete(cb);
    };
  };

  return {
    socket: socketRef.current,
    connected,
    subscribed,
    online,
    telemetry,
    lastResponse,
    onResponse,
  };
}
