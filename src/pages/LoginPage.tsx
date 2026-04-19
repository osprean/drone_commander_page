import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Progress,
  Text,
  VStack,
} from "@chakra-ui/react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

const carouselImages = [
  "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1400&q=80",
  "https://images.unsplash.com/photo-1548613053-22087dd8edb8?w=1400&q=80",
  "https://images.unsplash.com/photo-1542219550-37153d387c27?w=1400&q=80",
  "https://images.unsplash.com/photo-1523978591478-c753949ff840?w=1400&q=80",
];

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += interval;
      const newProgress = (elapsed / duration) * 100;
      if (newProgress >= 100) {
        const nextIndex = (currentImageIndex + 1) % carouselImages.length;
        setNextImageIndex(nextIndex);
        setProgress(0);
        elapsed = 0;
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentImageIndex(nextIndex);
          setIsTransitioning(false);
        }, 800);
      } else {
        setProgress(newProgress);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [currentImageIndex]);

  const handleDotClick = (idx: number) => {
    if (idx === currentImageIndex || isTransitioning) return;
    setNextImageIndex(idx);
    setProgress(0);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(idx);
      setIsTransitioning(false);
    }, 800);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});
    try {
      await login(formData.username.trim(), formData.password);
      navigate("/", { replace: true });
    } catch (err: any) {
      setFormErrors({
        general:
          err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Error al iniciar sesión.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Flex h="100vh" overflow="hidden">
      <Flex
        flex={{ base: "1", lg: "1" }}
        direction="column"
        align="center"
        justify="center"
        bg="white"
        px={{ base: 6, md: 12, lg: 16 }}
        py={8}
      >
        <Box w="full" maxW="420px">
          <Box mb={10}>
            <Heading
              fontFamily="'OspreanFont', Inter, sans-serif"
              fontSize="2xl"
              color="teal.500"
              letterSpacing="0.5px"
            >
              OSPREAN · DRONES
            </Heading>
          </Box>

          <Heading
            fontSize="2xl"
            fontWeight="normal"
            color="teal.500"
            mb={8}
            letterSpacing="normal"
          >
            Entrar con
          </Heading>

          <VStack as="form" onSubmit={handleSubmit} spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel
                fontSize="sm"
                fontWeight="normal"
                color="gray.700"
                mb={2}
              >
                Usuario o correo electrónico
              </FormLabel>
              <Input
                type="email"
                name="username"
                placeholder="Introduce tu usuario o correo electrónico"
                value={formData.username}
                onChange={handleInputChange}
                size="md"
                borderColor="gray.300"
                _hover={{ borderColor: "gray.400" }}
                _focus={{ borderColor: "teal.500", boxShadow: "none" }}
                rounded="md"
                fontSize="sm"
                color="gray.700"
                autoComplete="username"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel
                fontSize="sm"
                fontWeight="normal"
                color="gray.700"
                mb={2}
              >
                Contraseña
              </FormLabel>
              <InputGroup size="md">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleInputChange}
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                  _focus={{ borderColor: "teal.500", boxShadow: "none" }}
                  rounded="md"
                  fontSize="sm"
                  color="gray.700"
                  autoComplete="current-password"
                />
                <InputRightElement h="full">
                  <IconButton
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    icon={showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword((v) => !v)}
                    _hover={{ bg: "transparent", color: "teal.500" }}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Flex justify="space-between" align="center" pt={1}>
              <Checkbox
                colorScheme="teal"
                isChecked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                size="sm"
              >
                <Text fontSize="sm" color="gray.600">
                  Recuérdame.
                </Text>
              </Checkbox>
              <Link
                fontSize="sm"
                color="teal.500"
                fontWeight="normal"
                cursor="not-allowed"
                opacity={0.6}
              >
                Olvidé mi contraseña
              </Link>
            </Flex>

            {formErrors.general && (
              <Text color="red.500" fontSize="sm" textAlign="center">
                {formErrors.general}
              </Text>
            )}

            <Button
              type="submit"
              size="md"
              w="full"
              bg="teal.500"
              color="white"
              fontWeight="semibold"
              rounded="md"
              _hover={{ bg: "teal.600" }}
              _active={{ bg: "teal.700" }}
              isLoading={isLoading}
              mt={2}
              textTransform="uppercase"
              fontSize="sm"
              letterSpacing="wide"
            >
              Iniciar sesión
            </Button>

            <Flex align="center" my={4}>
              <Divider borderColor="gray.300" />
              <Text
                px={4}
                fontSize="xs"
                color="gray.500"
                whiteSpace="nowrap"
              >
                Osprean · Drone Commander
              </Text>
              <Divider borderColor="gray.300" />
            </Flex>

            <Text fontSize="xs" color="gray.600" textAlign="center">
              Plataforma de operación y monitorización de drones de vigilancia.
            </Text>
          </VStack>
        </Box>
      </Flex>

      <Box
        flex={{ base: "0", lg: "0 0 40%" }}
        display={{ base: "none", lg: "block" }}
        position="relative"
        overflow="hidden"
      >
        <Box
          as="img"
          src={carouselImages[currentImageIndex]}
          alt="Drone vigilancia"
          objectFit="cover"
          w="full"
          h="full"
          position="absolute"
          top={0}
          left={0}
        />
        <Box
          as="img"
          src={carouselImages[nextImageIndex]}
          alt="Drone vigilancia"
          objectFit="cover"
          w="full"
          h="full"
          position="absolute"
          top={0}
          left={0}
          opacity={isTransitioning ? 1 : 0}
          transition="opacity 0.8s ease-in-out"
        />
        <Box position="absolute" inset={0} bg="blackAlpha.200" />
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="200px"
          bgGradient="linear(to-t, blackAlpha.700, transparent)"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom={0}
          left="50%"
          transform="translateX(-50%)"
          px={6}
          pb={6}
          w={150}
          zIndex={2}
        >
          <Progress
            value={progress}
            size="xs"
            colorScheme="teal"
            bg="whiteAlpha.300"
            borderRadius="full"
            transition="none"
          />
        </Box>
        <HStack
          position="absolute"
          bottom={12}
          left="50%"
          transform="translateX(-50%)"
          spacing={2}
          zIndex={2}
        >
          {carouselImages.map((_, index) => (
            <Box
              key={index}
              w="8px"
              h="8px"
              borderRadius="full"
              bg={currentImageIndex === index ? "white" : "whiteAlpha.400"}
              cursor="pointer"
              onClick={() => handleDotClick(index)}
              transition="all 0.3s"
              _hover={{ bg: "white" }}
            />
          ))}
        </HStack>
      </Box>
    </Flex>
  );
}
