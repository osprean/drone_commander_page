import { api } from "./client";
import type { DroneResource } from "./types";

export async function fetchOrgResources(): Promise<DroneResource[]> {
  const { data } = await api.get("/api/resources/org");
  return Array.isArray(data) ? data : (data?.resources ?? []);
}

export function isVigilanceDrone(r: DroneResource): boolean {
  return r.kind === "dron_vigilancia" && !!r.mqtt_namespace;
}
