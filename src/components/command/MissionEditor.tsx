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

const inputStyle = {
  bg: "white",
  borderColor: "gray.200",
} as const;

export function MissionEditor(p: Props) {
  return (
    <Stack spacing={3} p={3}>
      <HStack>
        <Input
          size="sm"
          placeholder="Nombre de la misión"
          value={p.missionName}
          onChange={(e) => p.setMissionName(e.target.value)}
          {...inputStyle}
        />
        <Input
          size="sm"
          w="80px"
          type="number"
          value={p.missionSpeed}
          onChange={(e) => p.setMissionSpeed(parseFloat(e.target.value) || 5)}
          {...inputStyle}
        />
      </HStack>

      <HStack>
        <Button size="xs" variant="outline" borderColor="gray.200" onClick={p.onOpenSaved}>
          Guardadas
        </Button>
        <Button size="xs" variant="outline" borderColor="gray.200" onClick={p.onLoadFromDrone}>
          ↓ Desde dron
        </Button>
        <Button size="xs" variant="outline" borderColor="gray.200" onClick={p.onClear}>
          Limpiar
        </Button>
      </HStack>

      <Stack spacing={1}>
        <Box
          bg="green.50"
          border="1px solid"
          borderColor="green.300"
          rounded="md"
          p={2}
          fontFamily="mono"
          fontSize="xs"
        >
          <HStack>
            <Text w="30px" color="green.600" fontWeight="bold">
              TKF
            </Text>
            <Text color="gray.500">ALT</Text>
            <Input
              size="xs"
              w="80px"
              type="number"
              value={p.takeoffAlt}
              onChange={(e) => p.setTakeoffAlt(parseFloat(e.target.value) || 10)}
              {...inputStyle}
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
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            rounded="md"
            p={2}
          >
            <HStack align="start">
              <Text
                w="30px"
                color="teal.500"
                fontWeight="bold"
                fontFamily="mono"
                fontSize="sm"
              >
                {i + 1}
              </Text>
              <Stack spacing={1} flex={1} fontSize="xs" fontFamily="mono">
                <HStack>
                  <Text w="40px" color="gray.500">
                    LAT
                  </Text>
                  <Input
                    size="xs"
                    type="number"
                    step="0.000001"
                    value={wp.lat}
                    onChange={(e) => p.updateWp(i, "lat", parseFloat(e.target.value) || 0)}
                    {...inputStyle}
                  />
                </HStack>
                <HStack>
                  <Text w="40px" color="gray.500">
                    LON
                  </Text>
                  <Input
                    size="xs"
                    type="number"
                    step="0.000001"
                    value={wp.lon}
                    onChange={(e) => p.updateWp(i, "lon", parseFloat(e.target.value) || 0)}
                    {...inputStyle}
                  />
                </HStack>
                <HStack>
                  <Text w="40px" color="gray.500">
                    ALT
                  </Text>
                  <Input
                    size="xs"
                    type="number"
                    value={wp.alt}
                    onChange={(e) => p.updateWp(i, "alt", parseFloat(e.target.value) || 0)}
                    {...inputStyle}
                  />
                </HStack>
                <HStack>
                  <Text w="40px" color="gray.500">
                    HOLD
                  </Text>
                  <Input
                    size="xs"
                    type="number"
                    value={wp.hold ?? 0}
                    onChange={(e) => p.updateWp(i, "hold", parseFloat(e.target.value) || 0)}
                    {...inputStyle}
                  />
                </HStack>
              </Stack>
              <IconButton
                size="xs"
                aria-label="remove"
                icon={<DeleteIcon />}
                onClick={() => p.removeWp(i)}
                variant="ghost"
                colorScheme="red"
              />
            </HStack>
          </Box>
        ))}

        <Box
          bg="orange.50"
          border="1px solid"
          borderColor="orange.300"
          rounded="md"
          p={2}
          fontFamily="mono"
          fontSize="xs"
        >
          <HStack align="start">
            <Text w="30px" color="orange.600" fontWeight="bold">
              LND
            </Text>
            <Stack spacing={1} flex={1}>
              <HStack>
                <Text w="40px" color="gray.500">
                  LAT
                </Text>
                <Input
                  size="xs"
                  type="number"
                  step="0.000001"
                  value={p.land.lat ?? ""}
                  placeholder="—"
                  onChange={(e) => p.setLandField("lat", parseFloat(e.target.value) || 0)}
                  {...inputStyle}
                />
              </HStack>
              <HStack>
                <Text w="40px" color="gray.500">
                  LON
                </Text>
                <Input
                  size="xs"
                  type="number"
                  step="0.000001"
                  value={p.land.lon ?? ""}
                  placeholder="—"
                  onChange={(e) => p.setLandField("lon", parseFloat(e.target.value) || 0)}
                  {...inputStyle}
                />
              </HStack>
              <HStack>
                <Text w="40px" color="gray.500">
                  ALT
                </Text>
                <Input
                  size="xs"
                  type="number"
                  value={p.land.alt}
                  onChange={(e) => p.setLandField("alt", parseFloat(e.target.value) || 5)}
                  {...inputStyle}
                />
              </HStack>
            </Stack>
            <Button size="xs" onClick={p.setLandFromDrone} title="Posición desde dron">
              📍
            </Button>
          </HStack>
        </Box>
      </Stack>

      <Stack spacing={2}>
        {!p.editing && (
          <Button size="sm" onClick={p.onSave} colorScheme="teal">
            Guardar misión
          </Button>
        )}
        {p.editing && (
          <>
            <Button size="sm" onClick={p.onUpdate} colorScheme="teal">
              Actualizar
            </Button>
            <Button
              size="sm"
              onClick={p.onSaveAs}
              variant="outline"
              borderColor="gray.200"
            >
              Guardar como nueva
            </Button>
          </>
        )}
        <Button size="sm" onClick={p.onSend} colorScheme="green">
          ↑ Enviar al dron
        </Button>
      </Stack>
    </Stack>
  );
}
