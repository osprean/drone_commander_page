import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { MapPanel, type MapPanelHandle } from "../components/command/MapPanel";
import { MissionEditor, type EditWP } from "../components/command/MissionEditor";
import { SavedMissionsModal, type SavedMission } from "../components/command/SavedMissionsModal";
import { TelemetryPanel } from "../components/command/TelemetryPanel";
import { useDroneConnection } from "../hooks/use-drones";
import { useDroneCommands } from "../hooks/use-drone-commands";
import { useDroneSocket } from "../hooks/use-drone-socket";
import { isDummyParam, useDummyDrone } from "../hooks/use-dummy-drone";
import type { CommandResponse, MissionBody, MissionItem } from "../api/types";

type StartSeq = null | "arming" | "starting";
type DroneKey = number | "dummy";

function loadSaved(key: DroneKey): SavedMission[] {
  try {
    const raw = localStorage.getItem(`gcs_missions_${key}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistSaved(key: DroneKey, missions: SavedMission[]) {
  try {
    localStorage.setItem(`gcs_missions_${key}`, JSON.stringify(missions));
  } catch {}
}

export function DroneCommandPage() {
  const { id: idParam } = useParams();
  const isDummy = isDummyParam(idParam);
  const realDroneId =
    !isDummy && idParam ? parseInt(idParam, 10) : undefined;
  const droneKey: DroneKey | undefined = isDummy
    ? "dummy"
    : realDroneId;
  const navigate = useNavigate();
  const toast = useToast();

  const { data: realConn } = useDroneConnection(realDroneId);
  const realSocket = useDroneSocket(realDroneId, realConn?.mqtt_namespace);
  const realCmds = useDroneCommands(realDroneId);
  const dummy = useDummyDrone({ enabled: isDummy });

  const conn = isDummy ? dummy.conn : realConn;
  const telemetry = isDummy ? dummy.telemetry : realSocket.telemetry;
  const connected = isDummy ? dummy.connected : realSocket.connected;
  const subscribed = isDummy ? dummy.subscribed : realSocket.subscribed;
  const online = isDummy ? dummy.online : realSocket.online;
  const onResponse = isDummy ? dummy.onResponse : realSocket.onResponse;
  const cmds = (isDummy ? dummy.cmds : realCmds) as ReturnType<
    typeof useDroneCommands
  >;

  const [tabIdx, setTabIdx] = useState(0);

  // Mission edit state
  const [missionName, setMissionName] = useState("Unnamed Mission");
  const [missionSpeed, setMissionSpeed] = useState(5);
  const [takeoffAlt, setTakeoffAlt] = useState(10);
  const [wps, setWps] = useState<EditWP[]>([]);
  const [land, setLand] = useState<{ lat: number | null; lon: number | null; alt: number }>({
    lat: null,
    lon: null,
    alt: 5,
  });
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [savedMissions, setSavedMissions] = useState<SavedMission[]>([]);
  const [savedOpen, setSavedOpen] = useState(false);

  // Drone mission overlay (read-only)
  const [droneMission, setDroneMission] = useState<MissionItem[] | null>(null);

  // Camera / video
  const [cameraOn, setCameraOn] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Fire detection
  const [detectionOn, setDetectionOn] = useState(false);
  const [detectionBusy, setDetectionBusy] = useState(false);

  // Follow drone on map
  const [followDrone, setFollowDrone] = useState(false);

  // Start mission sequence
  const [startSeq, setStartSeq] = useState<StartSeq>(null);
  const [startBtnLabel, setStartBtnLabel] = useState("Iniciar misión");

  const mapRef = useRef<MapPanelHandle>(null);
  const missionLoadToEditor = useRef(false);

  useEffect(() => {
    if (droneKey != null) setSavedMissions(loadSaved(droneKey));
  }, [droneKey]);

  // React to drone command responses (socket drone:response)
  useEffect(() => {
    const off = onResponse((r: CommandResponse) => {
      if (r.action === "arm") {
        if (startSeq === "arming") {
          if (!r.success) {
            setStartSeq(null);
            setStartBtnLabel("Iniciar misión");
            toast({ status: "error", title: "Armado falló", description: r.message });
            return;
          }
          setStartSeq("starting");
          setStartBtnLabel("Arrancando misión…");
          cmds.startMission.mutate(undefined, {
            onError: (e: any) => {
              setStartSeq(null);
              setStartBtnLabel("Iniciar misión");
              toast({ status: "error", title: "Start failed", description: e?.message });
            },
          });
        } else if (!r.success) {
          toast({ status: "error", title: "Armado falló", description: r.message });
        } else {
          toast({ status: "success", title: "Armado OK" });
        }
      } else if (r.action === "disarm") {
        toast({
          status: r.success ? "success" : "error",
          title: r.success ? "Desarmado OK" : "Desarmado falló",
          description: r.message,
        });
      } else if (r.action === "start_mission") {
        if (startSeq === "starting") {
          setStartSeq(null);
          if (r.success) {
            setStartBtnLabel("✓ Misión iniciada");
            setTimeout(() => setStartBtnLabel("Iniciar misión"), 3000);
            toast({ status: "success", title: "Misión iniciada" });
          } else {
            setStartBtnLabel("Iniciar misión");
            toast({ status: "error", title: "Arranque de misión falló", description: r.message });
          }
        } else {
          toast({
            status: r.success ? "success" : "error",
            title: r.success ? "Misión iniciada" : "Arranque falló",
            description: r.message,
          });
        }
      } else if (r.action === "set_mode/guided" || r.action === "set_mode") {
        toast({
          status: r.success ? "success" : "error",
          title: r.success ? "Modo GUIDED OK" : "Set GUIDED falló",
          description: r.message,
        });
      } else if (r.action === "takeoff") {
        toast({
          status: r.success ? "success" : "error",
          title: r.success ? "Despegando" : "Despegue falló",
          description: r.message,
        });
      } else if (r.action === "land") {
        toast({
          status: r.success ? "success" : "error",
          title: r.success ? "Aterrizando" : "Aterrizaje falló",
          description: r.message,
        });
      } else if (r.action === "mission/get") {
        const data = (r.data ?? {}) as { mission_items?: MissionItem[]; speed_ms?: number };
        const items = data.mission_items ?? [];
        if (!r.success) {
          toast({ status: "error", title: "Leer misión falló", description: r.message });
          missionLoadToEditor.current = false;
        } else if (missionLoadToEditor.current) {
          missionLoadToEditor.current = false;
          applyMissionToEditor(items, data.speed_ms ?? 5);
          toast({ status: "success", title: `Misión cargada (${items.length} items)` });
        } else {
          setDroneMission(items);
        }
      } else if (r.action === "mission") {
        toast({
          status: r.success ? "success" : "error",
          title: r.success ? "Misión subida" : "Subida falló",
          description: r.message,
        });
      } else if (r.action === "camera/on" || r.action === "camera/off") {
        if (!r.success) {
          toast({ status: "error", title: "Cámara falló", description: r.message });
        }
      } else if (!r.success) {
        toast({ status: "error", title: `${r.action} falló`, description: r.message });
      }
    });
    return off;
  }, [onResponse, startSeq, cmds.startMission, toast]);

  // Connection state toast
  const prevConn = useRef<{ connected: boolean; subscribed: boolean; online: boolean }>({
    connected: false,
    subscribed: false,
    online: false,
  });
  useEffect(() => {
    const prev = prevConn.current;
    if (!connected && prev.connected) {
      toast({ status: "warning", title: "WebSocket desconectado" });
    } else if (connected && !prev.connected) {
      toast({ status: "success", title: "WebSocket conectado" });
    }
    if (subscribed && !prev.subscribed) {
      toast({ status: "info", title: `Suscrito al dron${online ? "" : " (offline)"}` });
    }
    if (prev.online && !online && prev.subscribed) {
      toast({ status: "warning", title: "Dron offline" });
    } else if (!prev.online && online && subscribed) {
      toast({ status: "success", title: "Dron online" });
    }
    prevConn.current = { connected, subscribed, online };
  }, [connected, subscribed, online, toast]);

  // Auto-load current drone mission once subscribed + online
  const didAutoLoadMission = useRef(false);
  useEffect(() => {
    if (didAutoLoadMission.current) return;
    if (!subscribed || !online || droneKey == null) return;
    didAutoLoadMission.current = true;
    missionLoadToEditor.current = false;
    cmds.getMission.mutate(undefined, { onError: () => {} });
  }, [subscribed, online, droneKey, cmds.getMission]);

  // Auto-center on drone first fix
  const didCenter = useRef(false);
  useEffect(() => {
    const pos = telemetry.position;
    if (pos?.lat_deg == null || pos?.lon_deg == null || !mapRef.current?.map) return;
    if (!didCenter.current) {
      mapRef.current.map.setView([pos.lat_deg, pos.lon_deg], 17);
      didCenter.current = true;
    } else if (followDrone) {
      mapRef.current.map.panTo([pos.lat_deg, pos.lon_deg], { animate: true });
    }
  }, [telemetry.position, followDrone]);

  const dronePos = useMemo(() => {
    const p = telemetry.position;
    if (p?.lat_deg == null || p?.lon_deg == null) return null;
    return { lat: p.lat_deg, lon: p.lon_deg };
  }, [telemetry.position]);

  // Map handlers
  const onMapClick = useCallback(
    (lat: number, lon: number) => {
      setWps((prev) => [...prev, { lat, lon, alt: 30, hold: 0 }]);
    },
    [],
  );
  const onWpDrag = useCallback(
    (idx: number, lat: number, lon: number) => {
      setWps((prev) => prev.map((w, i) => (i === idx ? { ...w, lat, lon } : w)));
    },
    [],
  );
  const onLandDrag = useCallback((lat: number, lon: number) => {
    setLand((l) => ({ ...l, lat, lon }));
  }, []);

  const updateWp = (i: number, field: keyof EditWP, value: number) => {
    setWps((prev) => prev.map((w, idx) => (idx === i ? { ...w, [field]: value } : w)));
  };
  const removeWp = (i: number) => setWps((prev) => prev.filter((_, idx) => idx !== i));

  function applyMissionToEditor(items: MissionItem[], speedMs: number) {
    clearEditor();
    const newWps: EditWP[] = [];
    let newTakeoff = takeoffAlt;
    let newLand = { lat: null as number | null, lon: null as number | null, alt: 5 };
    items.forEach((it) => {
      if (it.type === "takeoff") newTakeoff = it.alt ?? 10;
      else if (it.type === "waypoint")
        newWps.push({ lat: it.lat, lon: it.lon, alt: it.alt, hold: it.hold_time ?? 0 });
      else if (it.type === "land")
        newLand = { lat: it.lat, lon: it.lon, alt: it.alt ?? 5 };
    });
    setTakeoffAlt(newTakeoff);
    setWps(newWps);
    setLand(newLand);
    setMissionSpeed(speedMs);
    setMissionName("Mission from Drone");
    if (newWps.length > 0) {
      mapRef.current?.fit(newWps.map((w) => [w.lat, w.lon]));
    }
    setTabIdx(1);
  }

  function clearEditor() {
    setWps([]);
    setLand({ lat: null, lon: null, alt: 5 });
    setTakeoffAlt(10);
    setMissionSpeed(5);
    setEditingIdx(null);
    setMissionName("Unnamed Mission");
  }

  function buildBody(): MissionBody {
    const items: MissionItem[] = [
      { type: "takeoff", alt: takeoffAlt },
      ...wps.map<MissionItem>((w) => ({
        type: "waypoint",
        lat: w.lat,
        lon: w.lon,
        alt: w.alt,
        hold_time: w.hold ?? 0,
      })),
      { type: "land", lat: land.lat, lon: land.lon, alt: land.alt },
    ];
    return { name: missionName.trim() || "Unnamed Mission", mission_items: items, speed_ms: missionSpeed };
  }

  function nameTaken(name: string, excl: number | null = null) {
    const n = name.trim().toLowerCase();
    return savedMissions.some(
      (m, i) => i !== excl && m.name.trim().toLowerCase() === n,
    );
  }

  function saveMission() {
    if (wps.length === 0) return toast({ status: "warning", title: "Add at least one WP" });
    const body = buildBody();
    if (nameTaken(body.name!))
      return toast({ status: "warning", title: `"${body.name}" already exists` });
    const next: SavedMission = {
      id: Date.now(),
      name: body.name!,
      created: new Date().toISOString(),
      mission_items: body.mission_items,
    };
    const list = [...savedMissions, next];
    setSavedMissions(list);
    persistSaved(droneKey!, list);
    toast({ status: "success", title: "Mission saved" });
  }

  function updateMission() {
    if (editingIdx == null) return;
    const body = buildBody();
    if (nameTaken(body.name!, editingIdx))
      return toast({ status: "warning", title: "Name already exists" });
    const list = savedMissions.map((m, i) =>
      i === editingIdx
        ? { ...m, name: body.name!, mission_items: body.mission_items }
        : m,
    );
    setSavedMissions(list);
    persistSaved(droneKey!, list);
    toast({ status: "success", title: "Mission updated" });
  }

  function saveAsNew() {
    const newName = prompt("New mission name:", "");
    if (!newName) return;
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (nameTaken(trimmed))
      return toast({ status: "warning", title: "Name already exists" });
    const body = buildBody();
    const next: SavedMission = {
      id: Date.now(),
      name: trimmed,
      created: new Date().toISOString(),
      mission_items: body.mission_items,
    };
    const list = [...savedMissions, next];
    setSavedMissions(list);
    persistSaved(droneKey!, list);
    setEditingIdx(null);
    setMissionName(trimmed);
  }

  function loadSavedIntoEditor(idx: number) {
    const m = savedMissions[idx];
    if (!m) return;
    applyMissionToEditor(m.mission_items, missionSpeed);
    setMissionName(m.name);
    setSavedOpen(false);
  }
  function editSaved(idx: number) {
    loadSavedIntoEditor(idx);
    setEditingIdx(idx);
  }
  function deleteSaved(idx: number) {
    const list = savedMissions.filter((_, i) => i !== idx);
    setSavedMissions(list);
    persistSaved(droneKey!, list);
  }

  function sendMission(body: MissionBody) {
    const landIt = body.mission_items.find((it) => it.type === "land") as any;
    if (!landIt || landIt.lat == null || landIt.lon == null) {
      return toast({ status: "warning", title: "Set landing position first" });
    }
    cmds.uploadMission.mutate(body, {
      onSuccess: () => toast({ status: "success", title: "Misión subida" }),
      onError: httpErr("Subida de misión falló"),
    });
  }

  function sendSaved(idx: number) {
    const m = savedMissions[idx];
    if (!m) return;
    sendMission({ name: m.name, mission_items: m.mission_items, speed_ms: missionSpeed });
  }

  function sendCurrent() {
    if (wps.length === 0) return toast({ status: "warning", title: "No waypoints" });
    sendMission(buildBody());
  }

  const httpErr = useCallback(
    (title: string) => (e: any) => {
      const msg =
        e?.response?.data?.error ??
        e?.response?.data?.message ??
        e?.message ??
        "error";
      toast({ status: "error", title, description: msg });
    },
    [toast],
  );

  function loadFromDrone() {
    missionLoadToEditor.current = true;
    cmds.getMission.mutate(undefined, {
      onError: (e) => {
        missionLoadToEditor.current = false;
        httpErr("Leer misión falló")(e);
      },
    });
  }
  function refreshDroneMission() {
    missionLoadToEditor.current = false;
    cmds.getMission.mutate(undefined, { onError: httpErr("Refrescar misión falló") });
  }

  function toggleArm() {
    if (telemetry.state?.armed) {
      if (!confirm("¿Forzar desarmado?")) return;
      cmds.disarm.mutate(undefined, { onError: httpErr("Desarmado falló") });
    } else {
      if (!confirm("¿Armar dron en modo GUIDED?")) return;
      cmds.arm.mutate(undefined, { onError: httpErr("Armado falló") });
    }
  }
  function setGuided() {
    if (telemetry.state?.flight_mode === "GUIDED") {
      toast({ status: "info", title: "Ya en GUIDED" });
      return;
    }
    cmds.setGuided.mutate(undefined, { onError: httpErr("Set GUIDED falló") });
  }
  function doTakeoff() {
    if (!telemetry.state?.armed) {
      toast({ status: "warning", title: "Dron desarmado", description: "Arma primero" });
      return;
    }
    const alt = takeoffAlt > 0 ? takeoffAlt : 10;
    if (!confirm(`¿Despegar a ${alt} m?`)) return;
    cmds.takeoff.mutate(alt, { onError: httpErr("Despegue falló") });
  }
  function doLand() {
    if (!confirm("¿Aterrizar ahora?")) return;
    cmds.land.mutate(undefined, { onError: httpErr("Aterrizaje falló") });
  }
  function startMission() {
    if (!confirm("This will ARM the drone and start the mission loaded on the FCU. Are you sure?"))
      return;
    setStartSeq("arming");
    setStartBtnLabel("⚡ Arming…");
    cmds.arm.mutate(undefined, {
      onError: (e: any) => {
        setStartSeq(null);
        setStartBtnLabel("▶▶ START MISSION");
        toast({ status: "error", title: "Arm error", description: e?.message });
      },
    });
  }

  const [cameraBusy, setCameraBusy] = useState(false);
  async function toggleCamera() {
    if (!droneKey) return;
    setCameraBusy(true);
    try {
      if (cameraOn) {
        await cmds.cameraOff.mutateAsync();
        setCameraOn(false);
        setVideoUrl(null);
      } else {
        const resp: any = await cmds.cameraOn.mutateAsync();
        const url =
          resp?.https_url ??
          resp?.data?.stream_url ??
          resp?.stream_url ??
          null;
        if (!url) {
          const fallback = await cmds.stream.mutateAsync();
          setVideoUrl(fallback.stream_url ?? null);
        } else {
          setVideoUrl(url);
        }
        setCameraOn(true);
      }
    } catch (e: any) {
      toast({
        status: "error",
        title: "Camera error",
        description: e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message,
      });
    } finally {
      setCameraBusy(false);
    }
  }

  // Restore active stream on mount
  const didRestoreStream = useRef(false);
  useEffect(() => {
    if (didRestoreStream.current) return;
    if (droneKey == null) return;
    didRestoreStream.current = true;
    cmds.stream.mutate(undefined, {
      onSuccess: (info) => {
        if (info.camera_on && info.stream_url) {
          setVideoUrl(info.stream_url);
          setCameraOn(true);
          toast({ status: "info", title: "Stream activo restaurado" });
        }
      },
      onError: () => {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [droneKey]);

  async function toggleDetection() {
    if (!droneKey) return;
    setDetectionBusy(true);
    try {
      if (detectionOn) {
        const r: any = await cmds.detectionOff.mutateAsync();
        if (r?.success !== false) setDetectionOn(false);
        toast({
          status: r?.success === false ? "error" : "success",
          title: r?.success === false ? "Detección apagó falló" : "Detección apagada",
          description: r?.message,
        });
      } else {
        const r: any = await cmds.detectionOn.mutateAsync();
        if (r?.success !== false) setDetectionOn(true);
        toast({
          status: r?.success === false ? "error" : "success",
          title: r?.success === false ? "Detección encendido falló" : "Detección activa",
          description: r?.message,
        });
      }
    } catch (e: any) {
      toast({
        status: "error",
        title: "Detección error",
        description: e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message,
      });
    } finally {
      setDetectionBusy(false);
    }
  }

  // Poll detection status once on mount
  const didCheckDetection = useRef(false);
  useEffect(() => {
    if (didCheckDetection.current || droneKey == null) return;
    didCheckDetection.current = true;
    cmds.detectionStatus.mutate(undefined, {
      onSuccess: (r: any) => {
        const on = r?.data?.detection_on ?? r?.detection_on ?? false;
        setDetectionOn(!!on);
      },
      onError: () => {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [droneKey]);

  function setLandFromDrone() {
    if (dronePos == null) return toast({ status: "warning", title: "No drone position" });
    setLand((l) => ({ ...l, lat: dronePos.lat, lon: dronePos.lon }));
  }

  const wsStatusColor = subscribed
    ? "teal.500"
    : connected
      ? "yellow.400"
      : "red.400";

  const mode: "telemetry" | "mission" = tabIdx === 1 ? "mission" : "telemetry";

  return (
    <AppShell
      title={conn?.name ?? `Drone ${droneKey}`}
      actions={
        <HStack spacing={3}>
          <Button size="sm" variant="ghost" onClick={() => navigate("/")}>
            ← Flota
          </Button>
          <Badge bg={wsStatusColor} color="white" rounded="full" px={2}>
            {subscribed ? "LIVE" : connected ? "CONN" : "OFF"}
          </Badge>
          <Badge
            colorScheme={online ? "green" : "red"}
            variant="solid"
            rounded="full"
            px={2}
          >
            {online ? "ONLINE" : "OFFLINE"}
          </Badge>
          <Text fontSize="xs" color="gray.500" fontFamily="mono">
            {conn?.mqtt_namespace ?? ""}
          </Text>
        </HStack>
      }
    >
      <Flex h="100%">
        <Box flex="1" position="relative">
          <MapPanel
            ref={mapRef}
            dronePos={dronePos}
            droneYaw={telemetry.attitude?.yaw_deg ?? 0}
            mode={mode}
            editableWps={wps}
            land={land}
            missionOverlay={droneMission}
            onMapClick={onMapClick}
            onWpDrag={onWpDrag}
            onLandDrag={onLandDrag}
          />
        </Box>
        <Flex
          w="360px"
          bg="white"
          borderLeft="1px solid"
          borderColor="gray.200"
          direction="column"
          h="100%"
          minH={0}
        >
          <HStack
            spacing={0}
            bg="gray.50"
            borderBottom="1px solid"
            borderColor="gray.200"
            flexShrink={0}
          >
            {(["TELEMETRY", "MISSION"] as const).map((label, i) => (
              <Button
                key={label}
                flex="1"
                size="sm"
                variant="ghost"
                rounded={0}
                fontFamily="mono"
                fontSize="xs"
                letterSpacing="wider"
                color={tabIdx === i ? "teal.600" : "gray.500"}
                bg={tabIdx === i ? "white" : "transparent"}
                borderBottom="2px solid"
                borderColor={tabIdx === i ? "teal.500" : "transparent"}
                onClick={() => setTabIdx(i)}
              >
                {label}
              </Button>
            ))}
          </HStack>
          <Box flex="1" minH={0} overflowY="auto" overflowX="hidden">
            {tabIdx === 0 ? (
              <TelemetryPanel
                telemetry={telemetry}
                videoUrl={videoUrl}
                cameraOn={cameraOn}
                cameraBusy={cameraBusy}
                takeoffAlt={takeoffAlt}
                detectionOn={detectionOn}
                detectionBusy={detectionBusy}
                followDrone={followDrone}
                onToggleFollow={() => setFollowDrone((v) => !v)}
                onToggleDetection={toggleDetection}
                onToggleCamera={toggleCamera}
                onToggleArm={toggleArm}
                onSetGuided={setGuided}
                onTakeoff={doTakeoff}
                onLand={doLand}
                onStartMission={startMission}
                onRefreshMission={refreshDroneMission}
                startMissionLabel={startBtnLabel}
                startMissionDisabled={startSeq !== null}
              />
            ) : (
              <MissionEditor
                missionName={missionName}
                setMissionName={setMissionName}
                missionSpeed={missionSpeed}
                setMissionSpeed={setMissionSpeed}
                takeoffAlt={takeoffAlt}
                setTakeoffAlt={setTakeoffAlt}
                wps={wps}
                updateWp={updateWp}
                removeWp={removeWp}
                land={land}
                setLandField={(f, v) => setLand((l) => ({ ...l, [f]: v }))}
                setLandFromDrone={setLandFromDrone}
                editing={editingIdx !== null}
                onSave={saveMission}
                onUpdate={updateMission}
                onSaveAs={saveAsNew}
                onClear={clearEditor}
                onOpenSaved={() => setSavedOpen(true)}
                onSend={sendCurrent}
                onLoadFromDrone={loadFromDrone}
              />
            )}
          </Box>
        </Flex>
      </Flex>

      <SavedMissionsModal
        isOpen={savedOpen}
        onClose={() => setSavedOpen(false)}
        missions={savedMissions}
        onEdit={editSaved}
        onSend={sendSaved}
        onDelete={deleteSaved}
      />
    </AppShell>
  );
}
