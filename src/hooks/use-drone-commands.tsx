import { useMutation } from "@tanstack/react-query";
import {
  cmdArm,
  cmdCameraOff,
  cmdCameraOn,
  cmdCameraStatus,
  cmdDetectionOff,
  cmdDetectionOn,
  cmdDetectionStatus,
  cmdDisarm,
  cmdGetDroneMission,
  cmdLand,
  cmdSetGuided,
  cmdStartMission,
  cmdTakeoff,
  cmdUploadMission,
  fetchDroneStream,
} from "../api/drones";
import type { MissionBody } from "../api/types";

export function useDroneCommands(droneId: number | undefined) {
  const arm = useMutation({ mutationFn: () => cmdArm(droneId!) });
  const disarm = useMutation({ mutationFn: () => cmdDisarm(droneId!) });
  const setGuided = useMutation({ mutationFn: () => cmdSetGuided(droneId!) });
  const takeoff = useMutation({ mutationFn: (altM: number) => cmdTakeoff(droneId!, altM) });
  const land = useMutation({ mutationFn: () => cmdLand(droneId!) });
  const startMission = useMutation({ mutationFn: () => cmdStartMission(droneId!) });
  const uploadMission = useMutation({
    mutationFn: (body: MissionBody) => cmdUploadMission(droneId!, body),
  });
  const getMission = useMutation({ mutationFn: () => cmdGetDroneMission(droneId!) });
  const cameraOn = useMutation({ mutationFn: () => cmdCameraOn(droneId!) });
  const cameraOff = useMutation({ mutationFn: () => cmdCameraOff(droneId!) });
  const cameraStatus = useMutation({ mutationFn: () => cmdCameraStatus(droneId!) });
  const stream = useMutation({ mutationFn: () => fetchDroneStream(droneId!) });
  const detectionOn = useMutation({ mutationFn: () => cmdDetectionOn(droneId!) });
  const detectionOff = useMutation({ mutationFn: () => cmdDetectionOff(droneId!) });
  const detectionStatus = useMutation({ mutationFn: () => cmdDetectionStatus(droneId!) });

  return {
    arm,
    disarm,
    setGuided,
    takeoff,
    land,
    startMission,
    uploadMission,
    getMission,
    cameraOn,
    cameraOff,
    cameraStatus,
    stream,
    detectionOn,
    detectionOff,
    detectionStatus,
  };
}
