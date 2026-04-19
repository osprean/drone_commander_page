import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
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
import type { CommandResponse, MissionBody, MissionItem } from "../api/types";

type StartSeq = null | "arming" | "starting";

function loadSaved(droneId: number): SavedMission[] {
  try {
    const raw = localStorage.getItem(`gcs_missions_${droneId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistSaved(droneId: number, missions: SavedMission[]) {
  try {
    localStorage.setItem(`gcs_missions_${droneId}`, JSON.stringify(missions));
  } catch {}
}

export function DroneCommandPage() {
  const { id: idParam } = useParams();
  const droneId = idParam ? parseInt(idParam, 10) : undefined;
  const navigate = useNavigate();
  const toast = useToast();

  const { data: conn } = useDroneConnection(droneId);
  const { telemetry, connected, subscribed, onResponse } = useDroneSocket(droneId);
  const cmds = useDroneCommands(droneId);

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

  // Start mission sequence
  const [startSeq, setStartSeq] = useState<StartSeq>(null);
  const [startBtnLabel, setStartBtnLabel] = useState("Iniciar misión");

  const mapRef = useRef<MapPanelHandle>(null);
  const missionLoadToEditor = useRef(false);

  useEffect(() => {
    if (droneId != null) setSavedMissions(loadSaved(droneId));
  }, [droneId]);

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
          toast({ status: "error", title: "Arm failed", description: r.message });
        }
      } else if (r.action === "start_mission") {
        if (startSeq === "starting") {
          setStartSeq(null);
          if (r.success) {
            setStartBtnLabel("✓ Misión iniciada");
            setTimeout(() => setStartBtnLabel("Iniciar misión"), 3000);
          } else {
            setStartBtnLabel("Iniciar misión");
            toast({ status: "error", title: "Mission start failed", description: r.message });
          }
        }
      } else if (r.action === "set_mode/guided" || r.action === "set_mode") {
        if (!r.success) {
          toast({ status: "error", title: "Set GUIDED failed", description: r.message });
        }
      } else if (r.action === "mission/get") {
        const data = (r.data ?? {}) as { mission_items?: MissionItem[]; speed_ms?: number };
        const items = data.mission_items ?? [];
        if (missionLoadToEditor.current) {
          missionLoadToEditor.current = false;
          applyMissionToEditor(items, data.speed_ms ?? 5);
        } else {
          setDroneMission(items);
        }
      } else if (r.action === "camera/on" || r.action === "camera/off") {
        if (!r.success) {
          toast({ status: "error", title: "Camera cmd failed", description: r.message });
        }
      }
    });
    return off;
  }, [onResponse, startSeq, cmds.startMission, toast]);

  // Auto-center on drone first fix
  const didCenter = useRef(false);
  useEffect(() => {
    if (didCenter.current) return;
    const pos = telemetry.position;
    if (pos?.lat_deg != null && pos?.lon_deg != null && mapRef.current?.map) {
      mapRef.current.map.setView([pos.lat_deg, pos.lon_deg], 17);
      didCenter.current = true;
    }
  }, [telemetry.position]);

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
    persistSaved(droneId!, list);
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
    persistSaved(droneId!, list);
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
    persistSaved(droneId!, list);
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
    persistSaved(droneId!, list);
  }

  function sendMission(body: MissionBody) {
    const landIt = body.mission_items.find((it) => it.type === "land") as any;
    if (!landIt || landIt.lat == null || landIt.lon == null) {
      return toast({ status: "warning", title: "Set landing position first" });
    }
    cmds.uploadMission.mutate(body, {
      onSuccess: () => toast({ status: "success", title: "Mission uploaded" }),
      onError: (e: any) =>
        toast({ status: "error", title: "Upload failed", description: e?.message }),
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

  function loadFromDrone() {
    missionLoadToEditor.current = true;
    cmds.getMission.mutate();
  }
  function refreshDroneMission() {
    missionLoadToEditor.current = false;
    cmds.getMission.mutate();
  }

  function toggleArm() {
    if (telemetry.state?.armed) {
      if (!confirm("Force-disarm the drone?")) return;
      cmds.disarm.mutate();
    } else {
      if (!confirm("Arm the drone in GUIDED mode?")) return;
      cmds.arm.mutate();
    }
  }
  function setGuided() {
    cmds.setGuided.mutate();
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
    if (!droneId) return;
    setCameraBusy(true);
    try {
      if (cameraOn) {
        await cmds.cameraOff.mutateAsync();
        setCameraOn(false);
        setVideoUrl(null);
      } else {
        await cmds.cameraOn.mutateAsync();
        const stream = await cmds.stream.mutateAsync();
        setVideoUrl(stream?.url ?? null);
        setCameraOn(true);
      }
    } catch (e: any) {
      toast({ status: "error", title: "Camera error", description: e?.message });
    } finally {
      setCameraBusy(false);
    }
  }

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
      title={conn?.name ?? `Drone ${droneId}`}
      actions={
        <HStack spacing={3}>
          <Button size="sm" variant="ghost" onClick={() => navigate("/")}>
            ← Flota
          </Button>
          <Badge bg={wsStatusColor} color="white" rounded="full" px={2}>
            {subscribed ? "LIVE" : connected ? "CONN" : "OFF"}
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
        <Box
          w="360px"
          bg="white"
          borderLeft="1px solid"
          borderColor="gray.200"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          <Tabs
            index={tabIdx}
            onChange={setTabIdx}
            variant="line"
            colorScheme="teal"
            flex="1"
            display="flex"
            flexDirection="column"
          >
            <TabList bg="gray.50" borderColor="gray.200">
              <Tab fontSize="xs" fontFamily="mono" letterSpacing="wider">
                TELEMETRY
              </Tab>
              <Tab fontSize="xs" fontFamily="mono" letterSpacing="wider">
                MISSION
              </Tab>
            </TabList>
            <TabPanels flex="1" overflow="hidden">
              <TabPanel p={0} h="100%" overflowY="auto">
                <TelemetryPanel
                  telemetry={telemetry}
                  videoUrl={videoUrl}
                  cameraOn={cameraOn}
                  cameraBusy={cameraBusy}
                  onToggleCamera={toggleCamera}
                  onToggleArm={toggleArm}
                  onSetGuided={setGuided}
                  onStartMission={startMission}
                  onRefreshMission={refreshDroneMission}
                  startMissionLabel={startBtnLabel}
                  startMissionDisabled={startSeq !== null}
                />
              </TabPanel>
              <TabPanel p={0} h="100%" overflow="hidden">
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
                  setLandField={(f, v) =>
                    setLand((l) => ({ ...l, [f]: v }))
                  }
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
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
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
