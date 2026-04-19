import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
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
  battery: BatteryPayload | null;
  state: StatePayload | null;
  online: boolean | null;
  lastResponse: CommandResponse | null;
}

const emptyTelemetry: DroneTelemetry = {
  attitude: null,
  position: null,
  battery: null,
  state: null,
  online: null,
  lastResponse: null,
};

export interface UseDroneSocket {
  socket: Socket | null;
  connected: boolean;
  subscribed: boolean;
  telemetry: DroneTelemetry;
  onResponse: (cb: (r: CommandResponse) => void) => () => void;
}

function getJwt(): string | undefined {
  const m = document.cookie.match(/(?:^|;\s*)access_token_cookie=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : undefined;
}

export function useDroneSocket(droneId: number | undefined): UseDroneSocket {
  const [connected, setConnected] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [telemetry, setTelemetry] = useState<DroneTelemetry>(emptyTelemetry);
  const socketRef = useRef<Socket | null>(null);
  const respListeners = useRef<Set<(r: CommandResponse) => void>>(new Set());

  useEffect(() => {
    if (!droneId) return;
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
    s.on("drone:subscribed", (d: { drone_id?: number; online: boolean }) => {
      setSubscribed(true);
      setTelemetry((t) => ({ ...t, online: d.online }));
    });
    s.on(
      "drone:attitude",
      (msg: { drone_id: string; data: AttitudePayload }) =>
        setTelemetry((t) => ({ ...t, attitude: msg.data })),
    );
    s.on(
      "drone:position",
      (msg: { drone_id: string; data: PositionPayload }) =>
        setTelemetry((t) => ({ ...t, position: msg.data })),
    );
    s.on(
      "drone:battery_status",
      (msg: { drone_id: string; data: BatteryPayload }) =>
        setTelemetry((t) => ({ ...t, battery: msg.data })),
    );
    s.on(
      "drone:state",
      (msg: { drone_id: string; data: StatePayload }) =>
        setTelemetry((t) => ({ ...t, state: msg.data })),
    );
    s.on("drone:online", (msg: { drone_id: string; online: boolean }) =>
      setTelemetry((t) => ({ ...t, online: msg.online })),
    );
    s.on(
      "drone:response",
      (msg: { drone_id: string; action: string; data: any }) => {
        const payload = msg.data ?? {};
        const r: CommandResponse = {
          action: msg.action,
          success: !!payload.success,
          message: payload.message,
          data: payload.data ?? payload,
        };
        setTelemetry((t) => ({ ...t, lastResponse: r }));
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
      setTelemetry(emptyTelemetry);
    };
  }, [droneId]);

  const onResponse = (cb: (r: CommandResponse) => void) => {
    respListeners.current.add(cb);
    return () => {
      respListeners.current.delete(cb);
    };
  };

  return { socket: socketRef.current, connected, subscribed, telemetry, onResponse };
}
