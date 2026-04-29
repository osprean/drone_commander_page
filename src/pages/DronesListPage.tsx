import {
  Badge,
  Box,
  Center,
  Grid,
  HStack,
  Heading,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useMyDrones } from "../hooks/use-drones";
import { DUMMY_PARAM } from "../hooks/use-dummy-drone";

export function DronesListPage() {
  const { data, isLoading, error } = useMyDrones();
  const navigate = useNavigate();
  const showDummy = !isLoading && !!data && data.length === 0;

  return (
    <AppShell title="Flota de vigilancia">
      <Box p={6} overflowY="auto" h="100%">
        {isLoading && (
          <Center h="60vh">
            <Spinner size="xl" color="teal.500" />
          </Center>
        )}
        {error && (
          <Text color="red.500">Error cargando drones: {(error as Error).message}</Text>
        )}
        {showDummy && (
          <Stack align="center" spacing={2} mb={6}>
            <Text color="gray.500">
              No hay drones de vigilancia asignados. Prueba con el dron demo:
            </Text>
          </Stack>
        )}
        <Grid templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap={4}>
          {showDummy && (
            <Box
              role="button"
              onClick={() => navigate(`/drones/${DUMMY_PARAM}`)}
              bg="white"
              border="1px dashed"
              borderColor="purple.400"
              rounded="xl"
              p={4}
              cursor="pointer"
              shadow="sm"
              _hover={{ borderColor: "purple.500", transform: "translateY(-1px)", shadow: "md" }}
              transition="all 0.15s"
            >
              <HStack justify="space-between" mb={2}>
                <Heading size="sm" color="gray.800">
                  Dron Demo
                </Heading>
                <Badge colorScheme="purple" variant="solid" rounded="full" px={2}>
                  DEMO
                </Badge>
              </HStack>
              <Stack spacing={1} fontSize="xs" color="gray.500">
                <Text>Simulación local · sin cámara</Text>
                <Text>Misiones, armado y vuelo en mapa 2D</Text>
              </Stack>
            </Box>
          )}
          {data?.map((d) => {
            const online = !!d.is_online;
            return (
              <Box
                key={d.resource_id}
                role="button"
                onClick={() => navigate(`/drones/${d.resource_id}`)}
                bg="white"
                border="1px solid"
                borderColor={online ? "teal.500" : "gray.200"}
                rounded="xl"
                p={4}
                cursor="pointer"
                shadow="sm"
                _hover={{ borderColor: "teal.500", transform: "translateY(-1px)", shadow: "md" }}
                transition="all 0.15s"
              >
                <HStack justify="space-between" mb={2}>
                  <Heading size="sm" color="gray.800">
                    {d.name}
                  </Heading>
                  <Badge
                    colorScheme={online ? "teal" : "gray"}
                    variant="solid"
                    rounded="full"
                    px={2}
                  >
                    {online ? "ONLINE" : "OFFLINE"}
                  </Badge>
                </HStack>
                <Stack spacing={1} fontSize="xs" color="gray.500">
                  <Text>NS: {d.mqtt_namespace ?? "—"}</Text>
                  <Text>Serial: {d.serial ?? "—"}</Text>
                  <HStack spacing={2}>
                    {d.has_thermal_camera && (
                      <Badge colorScheme="orange" variant="subtle">
                        Térmica
                      </Badge>
                    )}
                    {d.has_hires_camera && (
                      <Badge colorScheme="teal" variant="subtle">
                        HiRes
                      </Badge>
                    )}
                  </HStack>
                </Stack>
              </Box>
            );
          })}
        </Grid>
      </Box>
    </AppShell>
  );
}
