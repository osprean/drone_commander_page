import { Box, Button, HStack, IconButton, Input, Stack, Text } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

export interface EditWP {
  lat: number;
  lon: number;
  alt: number;
  hold?: number;
}

interface Props {
  missionName: string;
  setMissionName: (v: string) => void;
  missionSpeed: number;
  setMissionSpeed: (v: number) => void;
  takeoffAlt: number;
  setTakeoffAlt: (v: number) => void;
  wps: EditWP[];
  updateWp: (i: number, field: keyof EditWP, value: number) => void;
  removeWp: (i: number) => void;
  land: { lat: number | null; lon: number | null; alt: number };
  setLandField: (field: "lat" | "lon" | "alt", value: number) => void;
  setLandFromDrone: () => void;
  editing: boolean;
  onSave: () => void;
  onUpdate: () => void;
  onSaveAs: () => void;
  onClear: () => void;
  onOpenSaved: () => void;
  onSend: () => void;
  onLoadFromDrone: () => void;
}

export function MissionEditor(p: Props) {
  return (
    <Stack spacing={3} p={3} h="100%" overflowY="auto">
      <HStack>
        <Input
          size="sm"
          placeholder="Mission name"
          value={p.missionName}
          onChange={(e) => p.setMissionName(e.target.value)}
          bg="#0a0e14"
          borderColor="#1f2733"
        />
        <Input
          size="sm"
          w="80px"
          type="number"
          value={p.missionSpeed}
          onChange={(e) => p.setMissionSpeed(parseFloat(e.target.value) || 5)}
          bg="#0a0e14"
          borderColor="#1f2733"
        />
      </HStack>

      <HStack>
        <Button size="xs" onClick={p.onOpenSaved}>
          Saved
        </Button>
        <Button size="xs" onClick={p.onLoadFromDrone}>
          ↓ From Drone
        </Button>
        <Button size="xs" onClick={p.onClear}>
          Clear
        </Button>
      </HStack>

      <Stack spacing={1}>
        <Box
          bg="#0a1a10"
          border="1px solid"
          borderColor="#00aa55"
          rounded="md"
          p={2}
          fontFamily="mono"
          fontSize="xs"
        >
          <HStack>
            <Text w="30px" color="#00aa55" fontWeight="bold">
              TKF
            </Text>
            <Text color="gray.400">ALT</Text>
            <Input
              size="xs"
              w="80px"
              type="number"
              value={p.takeoffAlt}
              onChange={(e) => p.setTakeoffAlt(parseFloat(e.target.value) || 10)}
              bg="#0a0e14"
              borderColor="#1f2733"
            />
          </HStack>
        </Box>

        {p.wps.length === 0 && (
          <Box p={3} textAlign="center" color="gray.500" fontSize="xs">
            Click en el mapa para añadir waypoints
          </Box>
        )}

        {p.wps.map((wp, i) => (
          <Box
            key={i}
            bg="#0a0e14"
            border="1px solid"
            borderColor="#1f2733"
            rounded="md"
            p={2}
          >
            <HStack align="start">
              <Text
                w="30px"
                color="accent.500"
                fontWeight="bold"
                fontFamily="mono"
                fontSize="sm"
              >
                {i + 1}
              </Text>
              <Stack spacing={1} flex={1} fontSize="xs" fontFamily="mono">
                <HStack>
                  <Text w="40px" color="gray.400">
                    LAT
                  </Text>
                  <Input
                    size="xs"
                    type="number"
                    step="0.000001"
                    value={wp.lat}
                    onChange={(e) =>
                      p.updateWp(i, "lat", parseFloat(e.target.value) || 0)
                    }
                    bg="#10151d"
                    borderColor="#1f2733"
                  />
                </HStack>
                <HStack>
                  <Text w="40px" color="gray.400">
                    LON
                  </Text>
                  <Input
                    size="xs"
                    type="number"
                    step="0.000001"
                    value={wp.lon}
                    onChange={(e) =>
                      p.updateWp(i, "lon", parseFloat(e.target.value) || 0)
                    }
                    bg="#10151d"
                    borderColor="#1f2733"
                  />
                </HStack>
                <HStack>
                  <Text w="40px" color="gray.400">
                    ALT
                  </Text>
                  <Input
                    size="xs"
                    type="number"
                    value={wp.alt}
                    onChange={(e) =>
                      p.updateWp(i, "alt", parseFloat(e.target.value) || 0)
                    }
                    bg="#10151d"
                    borderColor="#1f2733"
                  />
                </HStack>
                <HStack>
                  <Text w="40px" color="gray.400">
                    HOLD
                  </Text>
                  <Input
                    size="xs"
                    type="number"
                    value={wp.hold ?? 0}
                    onChange={(e) =>
                      p.updateWp(i, "hold", parseFloat(e.target.value) || 0)
                    }
                    bg="#10151d"
                    borderColor="#1f2733"
                  />
                </HStack>
              </Stack>
              <IconButton
                size="xs"
                aria-label="remove"
                icon={<DeleteIcon />}
                onClick={() => p.removeWp(i)}
                variant="ghost"
              />
            </HStack>
          </Box>
        ))}

        <Box
          bg="#1a0a05"
          border="1px solid"
          borderColor="#cc5500"
          rounded="md"
          p={2}
          fontFamily="mono"
          fontSize="xs"
        >
          <HStack align="start">
            <Text w="30px" color="#cc5500" fontWeight="bold">
              LND
            </Text>
            <Stack spacing={1} flex={1}>
              <HStack>
                <Text w="40px" color="gray.400">
                  LAT
                </Text>
                <Input
                  size="xs"
                  type="number"
                  step="0.000001"
                  value={p.land.lat ?? ""}
                  placeholder="—"
                  onChange={(e) =>
                    p.setLandField("lat", parseFloat(e.target.value) || 0)
                  }
                  bg="#10151d"
                  borderColor="#1f2733"
                />
              </HStack>
              <HStack>
                <Text w="40px" color="gray.400">
                  LON
                </Text>
                <Input
                  size="xs"
                  type="number"
                  step="0.000001"
                  value={p.land.lon ?? ""}
                  placeholder="—"
                  onChange={(e) =>
                    p.setLandField("lon", parseFloat(e.target.value) || 0)
                  }
                  bg="#10151d"
                  borderColor="#1f2733"
                />
              </HStack>
              <HStack>
                <Text w="40px" color="gray.400">
                  ALT
                </Text>
                <Input
                  size="xs"
                  type="number"
                  value={p.land.alt}
                  onChange={(e) =>
                    p.setLandField("alt", parseFloat(e.target.value) || 5)
                  }
                  bg="#10151d"
                  borderColor="#1f2733"
                />
              </HStack>
            </Stack>
            <Button size="xs" onClick={p.setLandFromDrone} title="Set from drone">
              📍
            </Button>
          </HStack>
        </Box>
      </Stack>

      <Stack spacing={2}>
        {!p.editing && (
          <Button size="sm" onClick={p.onSave} bg="accent.500" color="#0a0e14">
            💾 SAVE MISSION
          </Button>
        )}
        {p.editing && (
          <>
            <Button size="sm" onClick={p.onUpdate} bg="accent.500" color="#0a0e14">
              ✏ UPDATE
            </Button>
            <Button size="sm" onClick={p.onSaveAs} variant="outline" borderColor="#1f2733">
              SAVE AS NEW
            </Button>
          </>
        )}
        <Button size="sm" onClick={p.onSend} bg="#00aa55" color="#0a0e14">
          ↑ SEND TO DRONE
        </Button>
      </Stack>
    </Stack>
  );
}
