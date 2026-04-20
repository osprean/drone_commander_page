import { api } from "./client";
import type { DroneConnection, MissionBody } from "./types";

export async function fetchDroneConnection(id: number): Promise<DroneConnection> {
  const { data } = await api.get(`/api/drone-connections/${id}`);
  return data;
}

export async function fetchTelemetrySeed(id: number) {
  const { data } = await api.get(`/api/drones/${id}/telemetry`);
  return data;
}

export interface StreamInfo {
  camera_on: boolean;
  stream_url: string | null;
  stream_id?: string | null;
}

export async function fetchDroneStream(id: number): Promise<StreamInfo> {
  const { data } = await api.get(`/api/drones/${id}/stream`);
  return data as StreamInfo;
}

export async function sendGenericCommand(id: number, action: string, payload: unknown = {}) {
  const { data } = await api.post(`/api/drones/${id}/command/${action}`, payload);
  return data;
}

export async function cmdArm(id: number) {
  const { data } = await api.post(`/api/drones/${id}/arm`, {});
  return data;
}

export async function cmdDisarm(id: number) {
  return sendGenericCommand(id, "disarm");
}

export async function cmdSetGuided(id: number) {
  return sendGenericCommand(id, "set_mode/guided");
}

export async function cmdTakeoff(id: number, altM: number) {
  const { data } = await api.post(`/api/drones/${id}/takeoff`, { alt_m: altM });
  return data;
}

export async function cmdLand(id: number) {
  const { data } = await api.post(`/api/drones/${id}/land`, {});
  return data;
}

export async function cmdStartMission(id: number) {
  const { data } = await api.post(`/api/drones/${id}/start-mission`, {});
  return data;
}

export async function cmdUploadMission(id: number, body: MissionBody) {
  const { data } = await api.post(`/api/drones/${id}/mission`, body);
  return data;
}

export async function cmdGetDroneMission(id: number) {
  return sendGenericCommand(id, "mission/get");
}

export async function cmdCameraOn(id: number) {
  const { data } = await api.post(`/api/drones/${id}/camera/on`, {});
  return data;
}

export async function cmdCameraOff(id: number) {
  const { data } = await api.post(`/api/drones/${id}/camera/off`, {});
  return data;
}

export async function cmdCameraStatus(id: number) {
  const { data } = await api.get(`/api/drones/${id}/camera/status`);
  return data;
}

export async function cmdDetectionOn(id: number) {
  const { data } = await api.post(`/api/drones/${id}/detection/on`, {});
  return data;
}

export async function cmdDetectionOff(id: number) {
  const { data } = await api.post(`/api/drones/${id}/detection/off`, {});
  return data;
}

export async function cmdDetectionStatus(id: number) {
  const { data } = await api.get(`/api/drones/${id}/detection/status`);
  return data;
}
