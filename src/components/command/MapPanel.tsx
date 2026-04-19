import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import L from "leaflet";
import type { MissionItem } from "../../api/types";

export interface MapPanelHandle {
  map: L.Map | null;
  panTo: (lat: number, lon: number) => void;
  fit: (coords: Array<[number, number]>) => void;
}

interface Props {
  dronePos: { lat: number; lon: number } | null;
  droneYaw: number;
  mode: "telemetry" | "mission";
  editableWps: Array<{ lat: number; lon: number; alt: number; hold?: number }>;
  land: { lat: number | null; lon: number | null; alt: number };
  missionOverlay?: MissionItem[] | null;
  onMapClick?: (lat: number, lon: number) => void;
  onWpDrag?: (idx: number, lat: number, lon: number) => void;
  onLandDrag?: (lat: number, lon: number) => void;
}

export const MapPanel = forwardRef<MapPanelHandle, Props>(function MapPanel(
  {
    dronePos,
    droneYaw,
    mode,
    editableWps,
    land,
    missionOverlay,
    onMapClick,
    onWpDrag,
    onLandDrag,
  },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const droneMarkerRef = useRef<L.Marker | null>(null);
  const editMarkersRef = useRef<L.Marker[]>([]);
  const editPolyRef = useRef<L.Polyline | null>(null);
  const landMarkerRef = useRef<L.Marker | null>(null);
  const overlayRef = useRef<L.LayerGroup | null>(null);

  useImperativeHandle(ref, () => ({
    get map() {
      return mapRef.current;
    },
    panTo(lat: number, lon: number) {
      mapRef.current?.panTo([lat, lon]);
    },
    fit(coords) {
      if (!coords.length || !mapRef.current) return;
      mapRef.current.fitBounds(coords, { padding: [40, 40] });
    },
  }));

  useEffect(() => {
    if (!hostRef.current || mapRef.current) return;
    const map = L.map(hostRef.current, { zoomControl: true }).setView(
      [40.4168, -3.7038],
      13,
    );
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Esri, Maxar, Earthstar Geographics", maxZoom: 22 },
    ).addTo(map);
    mapRef.current = map;
    overlayRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = (e: L.LeafletMouseEvent) => {
      if (mode === "mission" && onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [mode, onMapClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!dronePos) {
      droneMarkerRef.current?.remove();
      droneMarkerRef.current = null;
      return;
    }
    if (!droneMarkerRef.current) {
      const icon = L.divIcon({
        html: `<div style="width:20px;height:20px;background:#00e8cc;border:2px solid #0a0e14;border-radius:50%;box-shadow:0 0 6px #00e8cc"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        className: "",
      });
      droneMarkerRef.current = L.marker([dronePos.lat, dronePos.lon], { icon }).addTo(map);
    } else {
      droneMarkerRef.current.setLatLng([dronePos.lat, dronePos.lon]);
    }
    const el = droneMarkerRef.current.getElement()?.firstElementChild as HTMLElement | null;
    if (el) el.style.transform = `rotate(${droneYaw}deg)`;
  }, [dronePos, droneYaw]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    editMarkersRef.current.forEach((m) => m.remove());
    editMarkersRef.current = [];
    editPolyRef.current?.remove();
    editPolyRef.current = null;

    if (mode !== "mission") {
      landMarkerRef.current?.remove();
      landMarkerRef.current = null;
      return;
    }

    editableWps.forEach((wp, i) => {
      const icon = L.divIcon({
        html: `<div style="width:22px;height:22px;background:#00e8cc;color:#0a0e14;border-radius:50%;border:2px solid #0a0e14;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;font-family:monospace">${i + 1}</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        className: "",
      });
      const marker = L.marker([wp.lat, wp.lon], { icon, draggable: true })
        .addTo(map)
        .on("dragend", (e) => {
          const ll = (e.target as L.Marker).getLatLng();
          onWpDrag?.(i, ll.lat, ll.lng);
        });
      editMarkersRef.current.push(marker);
    });
    if (editableWps.length >= 2) {
      editPolyRef.current = L.polyline(
        editableWps.map((w) => [w.lat, w.lon]),
        { color: "#00e8cc", weight: 2, dashArray: "6 4", opacity: 0.8 },
      ).addTo(map);
    }

    if (land.lat != null && land.lon != null) {
      if (!landMarkerRef.current) {
        const icon = L.divIcon({
          html: `<div style="padding:2px 6px;background:#cc5500;color:#0a0e14;border:1px solid #0a0e14;border-radius:3px;font-size:10px;font-weight:bold;font-family:monospace">LND</div>`,
          iconSize: [34, 20],
          iconAnchor: [17, 10],
          className: "",
        });
        landMarkerRef.current = L.marker([land.lat, land.lon], { icon, draggable: true })
          .addTo(map)
          .on("dragend", (e) => {
            const ll = (e.target as L.Marker).getLatLng();
            onLandDrag?.(ll.lat, ll.lng);
          });
      } else {
        landMarkerRef.current.setLatLng([land.lat, land.lon]);
      }
    } else {
      landMarkerRef.current?.remove();
      landMarkerRef.current = null;
    }
  }, [mode, editableWps, land, onWpDrag, onLandDrag]);

  useEffect(() => {
    const map = mapRef.current;
    const overlay = overlayRef.current;
    if (!map || !overlay) return;
    overlay.clearLayers();
    if (!missionOverlay || missionOverlay.length === 0 || mode !== "telemetry") return;

    const coords: Array<[number, number]> = [];
    let wpIdx = 0;
    missionOverlay.forEach((it) => {
      if (it.type === "waypoint") {
        wpIdx += 1;
        coords.push([it.lat, it.lon]);
        const icon = L.divIcon({
          html: `<div style="width:20px;height:20px;background:#ff9900;color:#0a0e14;border-radius:50%;border:2px solid #0a0e14;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;font-family:monospace">${wpIdx}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          className: "",
        });
        L.marker([it.lat, it.lon], { icon, interactive: false }).addTo(overlay);
      } else if (it.type === "land" && it.lat != null && it.lon != null) {
        coords.push([it.lat, it.lon]);
        const icon = L.divIcon({
          html: `<div style="padding:2px 6px;background:#ff9900;color:#0a0e14;border-radius:3px;font-size:10px;font-weight:bold;font-family:monospace">LND</div>`,
          iconSize: [34, 20],
          iconAnchor: [17, 10],
          className: "",
        });
        L.marker([it.lat, it.lon], { icon, interactive: false }).addTo(overlay);
      }
    });
    if (coords.length >= 2) {
      L.polyline(coords, { color: "#ff9900", weight: 2, opacity: 0.7 }).addTo(overlay);
    }
  }, [missionOverlay, mode]);

  return <div ref={hostRef} style={{ width: "100%", height: "100%" }} />;
});
