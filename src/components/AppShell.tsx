import { Box, Button, Flex, HStack, Heading, Spacer, Text } from "@chakra-ui/react";
import { useAuth } from "../hooks/use-auth";
import type { ReactNode } from "react";

export function AppShell({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  return (
    <Flex direction="column" h="100vh" bg="#0a0e14">
      <HStack
        as="header"
        px={6}
        py={3}
        bg="#10151d"
        borderBottom="1px solid"
        borderColor="#1f2733"
        spacing={6}
      >
        <Heading size="sm" color="accent.500" letterSpacing="wider">
          DRONE COMMANDER
        </Heading>
        <Text fontSize="sm" color="gray.500">
          {title}
        </Text>
        <Spacer />
        {actions}
        <Text fontSize="xs" color="gray.500">
          {user?.email}
        </Text>
        <Button size="sm" variant="outline" borderColor="#1f2733" onClick={() => logout()}>
          Salir
        </Button>
      </HStack>
      <Box flex="1" overflow="hidden">
        {children}
      </Box>
    </Flex>
  );
}
