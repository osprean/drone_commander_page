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

export function DronesListPage() {
  const { data, isLoading, error } = useMyDrones();
  const navigate = useNavigate();

  return (
    <AppShell title="Flota de vigilancia">
      <Box p={6} overflowY="auto" h="100%">
        {isLoading && (
          <Center h="60vh">
            <Spinner size="xl" color="accent.500" />
          </Center>
        )}
        {error && (
          <Text color="red.400">Error cargando drones: {(error as Error).message}</Text>
        )}
        {!isLoading && data && data.length === 0 && (
          <Center h="40vh">
            <Stack align="center" spacing={2}>
              <Text color="gray.500">No hay drones de vigilancia asignados.</Text>
            </Stack>
          </Center>
        )}
        <Grid templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap={4}>
          {data?.map((d) => {
            const online = !!d.is_online;
            return (
              <Box
                key={d.resource_id}
                role="button"
                onClick={() => navigate(`/drones/${d.resource_id}`)}
                bg="#10151d"
                border="1px solid"
                borderColor={online ? "accent.500" : "#1f2733"}
                rounded="md"
                p={4}
                cursor="pointer"
                _hover={{ borderColor: "accent.500", transform: "translateY(-1px)" }}
                transition="all 0.15s"
              >
                <HStack justify="space-between" mb={2}>
                  <Heading size="sm">{d.name}</Heading>
                  <Badge
                    bg={online ? "accent.500" : "#1f2733"}
                    color={online ? "#0a0e14" : "gray.400"}
                    rounded="full"
                    px={2}
                  >
                    {online ? "ONLINE" : "OFFLINE"}
                  </Badge>
                </HStack>
                <Stack spacing={1} fontSize="xs" color="gray.400">
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
