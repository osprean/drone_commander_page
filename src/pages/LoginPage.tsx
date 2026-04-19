import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate("/", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        "Credenciales incorrectas";
      toast({ status: "error", title: "Error", description: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Center h="100vh" bg="#0a0e14">
      <Box
        as="form"
        onSubmit={onSubmit}
        bg="#10151d"
        border="1px solid"
        borderColor="#1f2733"
        p={8}
        rounded="lg"
        w="100%"
        maxW="380px"
      >
        <Stack spacing={6}>
          <Stack spacing={1}>
            <Heading size="md" color="accent.500" letterSpacing="wider">
              DRONE COMMANDER
            </Heading>
            <Text fontSize="sm" color="gray.400">
              Inicia sesión para ver tus drones
            </Text>
          </Stack>
          <FormControl isRequired>
            <FormLabel fontSize="sm">Usuario o email</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              bg="#0a0e14"
              borderColor="#1f2733"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel fontSize="sm">Contraseña</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              bg="#0a0e14"
              borderColor="#1f2733"
            />
          </FormControl>
          <Button
            type="submit"
            isLoading={loading}
            bg="accent.500"
            color="#0a0e14"
            _hover={{ bg: "accent.700" }}
          >
            Entrar
          </Button>
        </Stack>
      </Box>
    </Center>
  );
}
