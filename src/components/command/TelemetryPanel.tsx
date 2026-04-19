import {
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  FaBatteryEmpty,
  FaBatteryFull,
  FaBatteryHalf,
  FaMapMarkerAlt,
  FaPlane,
  FaSatelliteDish,
} from "react-icons/fa";
import { VideoFeed } from "./VideoFeed";
import type { DroneTelemetry } from "../../hooks/use-drone-socket";

interface Props {
  telemetry: DroneTelemetry;
  videoUrl: string | null;
  cameraOn: boolean;
  cameraBusy: boolean;
  onToggleCamera: () => void;
  onToggleArm: () => void;
  onSetGuided: () => void;
  onStartMission: () => void;
  onRefreshMission: () => void;
  startMissionLabel: string;
  startMissionDisabled: boolean;
}

const fmtCoord = (v: number | null | undefined) =>
  v !== undefined && v !== null ? v.toFixed(6) : "--";
const fmtAlt = (v: number | null | undefined) =>
  v !== undefined && v !== null ? `${v.toFixed(1)} m` : "--";
const fmtDeg = (v: number | null | undefined) =>
  v !== undefined && v !== null ? `${v.toFixed(1)}°` : "--";

function Card({
  label,
  value,
  icon,
  color = "accent.500",
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <Box bg="gray.50" p={3} rounded="xl" textAlign="center">
      <HStack justify="center" mb={1}>
        <Icon as={icon} color={color} boxSize={3} />
        <Text
          fontSize="9px"
          fontWeight="black"
          color="gray.500"
          letterSpacing="widest"
          textTransform="uppercase"
        >
          {label}
        </Text>
      </HStack>
      <Text fontSize="md" fontWeight="bold" fontFamily="mono">
        {value}
      </Text>
    </Box>
  );
}

export function TelemetryPanel({
  telemetry,
  videoUrl,
  cameraOn,
  cameraBusy,
  onToggleCamera,
  onToggleArm,
  onSetGuided,
  onStartMission,
  onRefreshMission,
  startMissionLabel,
  startMissionDisabled,
}: Props) {
  const { attitude, position, battery_status, state } = telemetry;
  const pct = battery_status?.["remaining_%"] ?? null;
  const batteryIcon =
    pct === null ? FaBatteryEmpty : pct > 50 ? FaBatteryFull : pct > 20 ? FaBatteryHalf : FaBatteryEmpty;
  const batteryColor =
    pct === null ? "gray.400" : pct > 50 ? "green.400" : pct > 20 ? "orange.400" : "red.400";

  return (
    <Stack spacing={3} p={3}>
      <HStack justify="space-between">
        <Badge
          colorScheme={state?.armed ? "red" : "green"}
          variant="solid"
          rounded="full"
          px={2}
        >
          {state?.armed === undefined ? "--" : state.armed ? "ARMED" : "DISARMED"}
        </Badge>
        <Badge variant="subtle" colorScheme="teal" rounded="full" px={2}>
          {state?.mode ?? "—"}
        </Badge>
      </HStack>

      <SimpleGrid columns={3} spacing={2}>
        <Card
          label="Batería"
          value={pct !== null ? `${Math.round(pct)}%` : "--"}
          icon={batteryIcon}
          color={batteryColor}
        />
        <Card
          label="Alt REL"
          value={fmtAlt(position?.alt_rel_m)}
          icon={FaMapMarkerAlt}
        />
        <Card
          label="GPS"
          value={state?.gps_lock ? `Fix ${state.gps_lock_level ?? ""}` : "Sin fix"}
          icon={FaSatelliteDish}
          color={state?.gps_lock ? "green.400" : "red.400"}
        />
        <Card
          label="Lat"
          value={fmtCoord(position?.lat_deg)}
          icon={FaSatelliteDish}
        />
        <Card
          label="Lon"
          value={fmtCoord(position?.lon_deg)}
          icon={FaSatelliteDish}
        />
        <Card
          label="Alt MSL"
          value={fmtAlt(position?.alt_msl_m)}
          icon={FaMapMarkerAlt}
        />
        <Card
          label="Roll"
          value={fmtDeg(attitude?.roll_deg)}
          icon={FaPlane}
          color="blue.400"
        />
        <Card
          label="Pitch"
          value={fmtDeg(attitude?.pitch_deg)}
          icon={FaPlane}
          color="accent.500"
        />
        <Card
          label="Yaw"
          value={fmtDeg(attitude?.yaw_deg)}
          icon={FaPlane}
          color="purple.400"
        />
      </SimpleGrid>

      <Box bg="gray.50" rounded="xl" p={3}>
        <HStack justify="space-between" mb={1}>
          <Text fontSize="9px" color="gray.400" fontWeight="black" letterSpacing="widest">
            BATERÍA
          </Text>
          <Text fontFamily="mono" fontSize="xs" color="gray.700">
            {battery_status ? `${battery_status.voltage_v.toFixed(1)} V · ${battery_status.current_a.toFixed(1)} A` : "—"}
          </Text>
        </HStack>
        <Box h="6px" bg="gray.200" rounded="full" overflow="hidden">
          <Box
            h="100%"
            w={`${Math.max(0, Math.min(100, pct ?? 0))}%`}
            bg={
              pct === null
                ? "gray.500"
                : pct < 20
                  ? "red.400"
                  : pct < 40
                    ? "orange.400"
                    : "accent.500"
            }
          />
        </Box>
      </Box>

      <VideoFeed url={videoUrl} enabled={cameraOn} />

      <Stack spacing={2}>
        <Button
          size="sm"
          colorScheme={cameraOn ? "red" : "teal"}
          onClick={onToggleCamera}
          isDisabled={cameraBusy}
          rounded="lg"
        >
          {cameraOn ? "Apagar cámara" : "Encender cámara"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          borderColor="gray.200"
          onClick={onSetGuided}
          rounded="lg"
        >
          Set GUIDED
        </Button>
        <Button
          size="sm"
          colorScheme={state?.armed ? "red" : "green"}
          onClick={onToggleArm}
          rounded="lg"
        >
          {state?.armed ? "Disarm" : "Armar"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          borderColor="gray.200"
          onClick={onRefreshMission}
          rounded="lg"
        >
          ↻ Refrescar misión
        </Button>
        <Button
          size="sm"
          colorScheme="orange"
          onClick={onStartMission}
          isDisabled={startMissionDisabled}
          rounded="lg"
        >
          {startMissionLabel}
        </Button>
      </Stack>
    </Stack>
  );
}
