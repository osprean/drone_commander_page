import { Badge, Button, HStack, Text, useToast } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  simSpawn,
  simStatus,
  simStop,
  type SimPodStatus,
} from "../../api/drones";

const BADGE_COLOR: Record<SimPodStatus, string> = {
  pending: "orange",
  running: "green",
  stopping: "gray",
  stopped: "gray",
  failed: "red",
};

const BADGE_LABEL: Record<SimPodStatus, string> = {
  pending: "Arrancando",
  running: "Operativo",
  stopping: "Parando",
  stopped: "Detenido",
  failed: "Fallo",
};

interface Props {
  droneId: number;
}

// Compact sim-control widget for DroneCommandPage header. Polls /sim/status
// while transient (pending/stopping) at 3s, slower while running (10s), off
// otherwise. Renders nothing for non-sim drones (endpoint 400/404).
export function SimulatorPanel({ droneId }: Props) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["simStatus", droneId],
    queryFn: () => simStatus(droneId),
    refetchInterval: (q) => {
      const s = q.state.data?.sim_pod_status;
      if (s === "pending" || s === "stopping") return 3000;
      if (s === "running") return 10000;
      return false;
    },
    retry: false,
  });

  const spawn = useMutation({
    mutationFn: () => simSpawn(droneId),
    onSuccess: () => {
      toast({ status: "info", title: "Spawn solicitado", duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["simStatus", droneId] });
    },
    onError: (err: any) => {
      toast({
        status: "error",
        title: "Error en spawn",
        description: err?.response?.data?.error ?? String(err),
        duration: 6000,
      });
    },
  });

  const stop = useMutation({
    mutationFn: () => simStop(droneId),
    onSuccess: () => {
      toast({ status: "info", title: "Stop solicitado", duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["simStatus", droneId] });
    },
    onError: (err: any) => {
      toast({
        status: "error",
        title: "Error en stop",
        description: err?.response?.data?.error ?? String(err),
        duration: 6000,
      });
    },
  });

  // Hide for non-sim drones (backend returns 400 — query errors out).
  if (isError) return null;
  if (isLoading || !data) return null;
  if (!data.is_simulated) return null;

  const status: SimPodStatus = data.sim_pod_status ?? "stopped";
  // Show Stop for ANY non-terminal state (running, pending, stopping) so the
  // user can recover from a stuck pending (e.g. ImagePullBackOff loop). Spawn
  // is only available when the slot is truly idle (stopped/failed/null).
  const canStop = status === "running" || status === "pending" || status === "stopping";
  const canSpawn = !canStop;

  return (
    <HStack
      spacing={2}
      px={2}
      py={1}
      bg="purple.50"
      border="1px solid"
      borderColor="purple.200"
      rounded="md"
    >
      <Badge colorScheme="purple">SIM</Badge>
      <Badge colorScheme={BADGE_COLOR[status]}>{BADGE_LABEL[status]}</Badge>
      {canStop && (
        <Button
          size="xs"
          colorScheme="red"
          variant={status === "running" ? "solid" : "outline"}
          onClick={() => stop.mutate()}
          isLoading={stop.isPending}
          isDisabled={status === "stopping"}
        >
          {status === "pending" ? "Cancelar" : "Stop pod"}
        </Button>
      )}
      {canSpawn && (
        <Button
          size="xs"
          colorScheme="green"
          onClick={() => spawn.mutate()}
          isLoading={spawn.isPending}
        >
          {status === "failed" ? "Reintentar" : "Spawn pod"}
        </Button>
      )}
      {data.sim_pod_name && (
        <Text fontSize="xs" color="gray.500" fontFamily="mono">
          {data.sim_pod_name}
        </Text>
      )}
    </HStack>
  );
}
