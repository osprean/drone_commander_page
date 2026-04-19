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
      <ModalContent bg="white">
        <ModalHeader color="gray.800">Misiones guardadas</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {missions.length === 0 && (
            <Text color="gray.500" textAlign="center" py={8}>
              No hay misiones guardadas
            </Text>
          )}
          <Stack spacing={3}>
            {missions.map((m, i) => {
              const items = m.mission_items ?? [];
              const wpCount = items.filter((it) => it.type === "waypoint").length;
              return (
                <Box
                  key={m.id}
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  rounded="md"
                  p={3}
                >
                  <HStack justify="space-between" mb={1}>
                    <Box>
                      <Text fontWeight="bold" color="gray.800">
                        {m.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {wpCount} waypoints · {new Date(m.created).toLocaleString()}
                      </Text>
                    </Box>
                    <HStack>
                      <Button size="xs" variant="outline" borderColor="gray.200" onClick={() => onEdit(i)}>
                        Editar
                      </Button>
                      <Button size="xs" colorScheme="green" onClick={() => onSend(i)}>
                        Enviar
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="red"
                        onClick={() => onDelete(i)}
                      >
                        Borrar
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
