import {
  Box,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { MissionItem } from "../../api/types";

export interface SavedMission {
  id: number;
  name: string;
  created: string;
  mission_items: MissionItem[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  missions: SavedMission[];
  onEdit: (idx: number) => void;
  onSend: (idx: number) => void;
  onDelete: (idx: number) => void;
}

export function SavedMissionsModal({
  isOpen,
  onClose,
  missions,
  onEdit,
  onSend,
  onDelete,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg="#10151d" border="1px solid" borderColor="#1f2733">
        <ModalHeader>Missions</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {missions.length === 0 && (
            <Text color="gray.500" textAlign="center" py={8}>
              NO SAVED MISSIONS
            </Text>
          )}
          <Stack spacing={3}>
            {missions.map((m, i) => {
              const items = m.mission_items ?? [];
              const wpCount = items.filter((it) => it.type === "waypoint").length;
              return (
                <Box
                  key={m.id}
                  bg="#0a0e14"
                  border="1px solid"
                  borderColor="#1f2733"
                  rounded="md"
                  p={3}
                >
                  <HStack justify="space-between" mb={1}>
                    <Box>
                      <Text fontWeight="bold">{m.name}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {wpCount} waypoints · {new Date(m.created).toLocaleString()}
                      </Text>
                    </Box>
                    <HStack>
                      <Button size="xs" onClick={() => onEdit(i)}>
                        ✏ EDIT
                      </Button>
                      <Button size="xs" bg="#00aa55" color="#0a0e14" onClick={() => onSend(i)}>
                        ↑ SEND
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        borderColor="#cc5500"
                        color="#cc5500"
                        onClick={() => onDelete(i)}
                      >
                        🗑
                      </Button>
                    </HStack>
                  </HStack>
                </Box>
              );
            })}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
