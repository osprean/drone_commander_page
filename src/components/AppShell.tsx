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
    <Flex direction="column" h="100vh" bg="gray.50">
      <HStack
        as="header"
        px={6}
        py={3}
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        spacing={6}
        shadow="sm"
      >
        <Heading
          size="sm"
          color="teal.500"
          letterSpacing="widest"
          fontFamily="'OspreanFont', Inter, sans-serif"
        >
          OSPREAN · DRONES
        </Heading>
        <Text fontSize="sm" color="gray.500">
          {title}
        </Text>
        <Spacer />
        {actions}
        <Text fontSize="xs" color="gray.500">
          {user?.email}
        </Text>
        <Button
          size="sm"
          variant="outline"
          borderColor="gray.200"
          color="gray.600"
          onClick={() => logout()}
        >
          Salir
        </Button>
      </HStack>
      <Box flex="1" overflow="hidden">
        {children}
      </Box>
    </Flex>
  );
}
