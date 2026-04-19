import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { apiBaseUrl } from "../api/client";
import type {
  AttitudePayload,
  BatteryPayload,
  CommandResponse,
  OnlinePayload,
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

export function useDroneSocket(droneId: number | undefined): UseDroneSocket {
  const [connected, setConnected] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [telemetry, setTelemetry] = useState<DroneTelemetry>(emptyTelemetry);
  const socketRef = useRef<Socket | null>(null);
  const respListeners = useRef<Set<(r: CommandResponse) => void>>(new Set());

  useEffect(() => {
    if (!droneId) return;
    const base = apiBaseUrl();
    const s = io(base, {
      transports: ["websocket"],
      withCredentials: true,
      path: "/socket.io",
      reconnection: true,
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
    s.on("drone:subscribed", (d: { drone_id: number; online: boolean }) => {
      if (d.drone_id === droneId) {
        setSubscribed(true);
        setTelemetry((t) => ({ ...t, online: d.online }));
      }
    });
    s.on("drone:attitude", (p: AttitudePayload) =>
      setTelemetry((t) => ({ ...t, attitude: p })),
    );
    s.on("drone:position", (p: PositionPayload) =>
      setTelemetry((t) => ({ ...t, position: p })),
    );
    s.on("drone:battery_status", (p: BatteryPayload) =>
      setTelemetry((t) => ({ ...t, battery: p })),
    );
    s.on("drone:state", (p: StatePayload) =>
      setTelemetry((t) => ({ ...t, state: p })),
    );
    s.on("drone:online", (p: OnlinePayload) =>
      setTelemetry((t) => ({ ...t, online: p.online })),
    );
    s.on("drone:response", (p: CommandResponse) => {
      setTelemetry((t) => ({ ...t, lastResponse: p }));
      respListeners.current.forEach((cb) => cb(p));
    });

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
