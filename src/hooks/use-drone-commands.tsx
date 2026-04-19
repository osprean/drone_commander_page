import { useMutation } from "@tanstack/react-query";
import {
  cmdArm,
  cmdCameraOff,
  cmdCameraOn,
  cmdCameraStatus,
  cmdDisarm,
  cmdGetDroneMission,
  cmdSetGuided,
  cmdStartMission,
  cmdUploadMission,
  fetchDroneStream,
} from "../api/drones";
import type { MissionBody } from "../api/types";

export function useDroneCommands(droneId: number | undefined) {
  const arm = useMutation({ mutationFn: () => cmdArm(droneId!) });
  const disarm = useMutation({ mutationFn: () => cmdDisarm(droneId!) });
  const setGuided = useMutation({ mutationFn: () => cmdSetGuided(droneId!) });
  const startMission = useMutation({ mutationFn: () => cmdStartMission(droneId!) });
  const uploadMission = useMutation({
    mutationFn: (body: MissionBody) => cmdUploadMission(droneId!, body),
  });
  const getMission = useMutation({ mutationFn: () => cmdGetDroneMission(droneId!) });
  const cameraOn = useMutation({ mutationFn: () => cmdCameraOn(droneId!) });
  const cameraOff = useMutation({ mutationFn: () => cmdCameraOff(droneId!) });
  const cameraStatus = useMutation({ mutationFn: () => cmdCameraStatus(droneId!) });
  const stream = useMutation({ mutationFn: () => fetchDroneStream(droneId!) });

  return {
    arm,
    disarm,
    setGuided,
    startMission,
    uploadMission,
    getMission,
    cameraOn,
    cameraOff,
    cameraStatus,
    stream,
  };
}
