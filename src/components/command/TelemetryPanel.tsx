import { Box, Button, Grid, HStack, Stack, Text } from "@chakra-ui/react";
import { AttitudeIndicator } from "./AttitudeIndicator";
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

function fmt(v: number | null | undefined, unit = "", d = 1) {
  if (v == null || Number.isNaN(v)) return "—";
  return v.toFixed(d) + unit;
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
  const { attitude, position, battery, state } = telemetry;

  const tiles: Array<{ label: string; value: string; color?: string }> = [
    {
      label: "Armed",
      value: state?.armed ? "ARMED" : "DISARMED",
      color: state?.armed ? "#ff5555" : "#00e8cc",
    },
    { label: "Mode", value: state?.flight_mode ?? "—" },
    { label: "GPS", value: state?.gps_lock ? `LOCK ${state?.gps_level ?? ""}` : "NO LOCK" },
    { label: "Alt MSL", value: fmt(position?.alt_msl, " m", 0) },
    { label: "Alt Rel", value: fmt(position?.alt_rel, " m", 0) },
    {
      label: "Speed",
      value: state?.mission_speed_ms != null ? state.mission_speed_ms.toFixed(1) + " m/s" : "—",
    },
  ];

  return (
    <Stack spacing={3} p={3}>
      <Box bg="#0a0e14" border="1px solid" borderColor="#1f2733" rounded="md" p={3}>
        <HStack justify="center">
          <AttitudeIndicator
            roll={attitude?.roll ?? 0}
            pitch={attitude?.pitch ?? 0}
            yaw={attitude?.yaw ?? 0}
          />
        </HStack>
      </Box>

      <Grid templateColumns="repeat(2, 1fr)" gap={2}>
        {tiles.map((t) => (
          <Box
            key={t.label}
            bg="#0a0e14"
            border="1px solid"
            borderColor="#1f2733"
            rounded="md"
            p={2}
          >
            <Text fontSize="9px" color="gray.500" letterSpacing="wider">
              {t.label.toUpperCase()}
            </Text>
            <Text
              fontFamily="mono"
              fontSize="sm"
              fontWeight="bold"
              color={t.color ?? "accent.500"}
            >
              {t.value}
            </Text>
          </Box>
        ))}
      </Grid>

      <Box bg="#0a0e14" border="1px solid" borderColor="#1f2733" rounded="md" p={2}>
        <HStack justify="space-between">
          <Text fontSize="9px" color="gray.500">
            BATTERY
          </Text>
          <Text fontFamily="mono" fontSize="xs">
            {fmt(battery?.voltage, " V", 1)} · {fmt(battery?.current, " A", 1)}
          </Text>
        </HStack>
        <Box h="8px" bg="#1f2733" rounded="full" mt={2} overflow="hidden">
          <Box
            h="100%"
            w={`${Math.max(0, Math.min(100, battery?.percentage ?? 0))}%`}
            bg={
              (battery?.percentage ?? 0) < 20
                ? "#ff5555"
                : (battery?.percentage ?? 0) < 40
                  ? "#ffcc00"
                  : "#00e8cc"
            }
          />
        </Box>
        <Text fontFamily="mono" fontSize="xs" mt={1}>
          {fmt(battery?.percentage, "%", 0)}
        </Text>
      </Box>

      <Box bg="#0a0e14" border="1px solid" borderColor="#1f2733" rounded="md" p={2}>
        <Text fontSize="9px" color="gray.500" mb={1}>
          POSITION
        </Text>
        <Text fontFamily="mono" fontSize="xs">
          LAT {position?.lat != null ? position.lat.toFixed(6) : "—"}
        </Text>
        <Text fontFamily="mono" fontSize="xs">
          LON {position?.lon != null ? position.lon.toFixed(6) : "—"}
        </Text>
      </Box>

      <VideoFeed url={videoUrl} enabled={cameraOn} />

      <Stack spacing={2}>
        <Button size="sm" onClick={onToggleCamera} isDisabled={cameraBusy}>
          {cameraOn ? "⏹ CAM OFF" : "▶ CAM ON"}
        </Button>
        <Button size="sm" onClick={onSetGuided} variant="outline" borderColor="#1f2733">
          SET GUIDED
        </Button>
        <Button
          size="sm"
          onClick={onToggleArm}
          bg={state?.armed ? "#ff5555" : "accent.500"}
          color="#0a0e14"
          _hover={{ opacity: 0.85 }}
        >
          {state?.armed ? "DISARM" : "ARM"}
        </Button>
        <Button size="sm" onClick={onRefreshMission} variant="outline" borderColor="#1f2733">
          ↻ REFRESH MISSION
        </Button>
        <Button
          size="sm"
          onClick={onStartMission}
          isDisabled={startMissionDisabled}
          bg="#00aa55"
          color="#0a0e14"
          _hover={{ opacity: 0.85 }}
          dangerouslySetInnerHTML={{ __html: startMissionLabel }}
        />
      </Stack>
    </Stack>
  );
}
