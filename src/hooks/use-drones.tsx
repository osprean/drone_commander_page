import { useQuery } from "@tanstack/react-query";
import { fetchOrgResources, isVigilanceDrone } from "../api/resources";
import { fetchDroneConnection } from "../api/drones";
import type { DroneResource } from "../api/types";
import { useAuth } from "./use-auth";

export function useMyDrones() {
  const { user } = useAuth();
  return useQuery<DroneResource[]>({
    queryKey: ["my-drones", user?.id],
    queryFn: async () => {
      const all = await fetchOrgResources();
      return all.filter(isVigilanceDrone);
    },
    enabled: !!user,
    refetchInterval: 15_000,
  });
}

export function useDroneConnection(id: number | undefined) {
  return useQuery({
    queryKey: ["drone-connection", id],
    queryFn: () => fetchDroneConnection(id!),
    enabled: id != null,
    refetchInterval: 10_000,
  });
}
