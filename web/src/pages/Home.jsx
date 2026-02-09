import heroImg from "../assets/hero.jpg";
import logo from "../assets/newbornHublogo.svg";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Flex,
  HStack,
  Button,
  Spacer,
  Text,
  Heading,
  Stack,
  Image,
} from "@chakra-ui/react";

export default function Home() {
  // 🎨 Paleta suave
  const PAGE_GRADIENT =
    "linear-gradient(90deg, #F2C9A9 0%, #F7E6D6 45%, #BFE3CF 100%)";

  const NAV_BG = "#f5e6d8";
  const INK = "#2F3A45";
  const MUTED = "#5F6C78";
  const BORDER = "rgba(47,58,69,0.18)";

  const TERRACOTTA = "#B88975";
  const TERRACOTTA_DARK = "#A97561";
  const TERRACOTTA_TEXT = "#B07B67";

  return (
    <Box minH="100vh" bgGradient={PAGE_GRADIENT} color={INK}>
      {/* ================= NAVBAR ================= */}
      <Box bg={NAV_BG} borderBottom="1px solid" borderColor={BORDER}>
        <Container maxW="1100px" py={4}>
          <Flex align="center">
            {/* Logo */}
            <HStack spacing={3}>
              <RouterLink to="/">
                <img
                  src={logo}
                  alt="Newborn Care Hub logo"
                  style={{
                    height: "60px",
                    width: "auto",
                    display: "block",
                  }}
                />
              </RouterLink>
            </HStack>

            <Spacer />

            {/* Links (underline only on hover) */}
            <HStack
              spacing={7}
              fontSize="lg"
              fontWeight="500"
              color={INK}
              display={{ base: "none", md: "flex" }}
              opacity={0.85}
            >
              <Box
                as={RouterLink}
                to="/"
                _hover={{
                  opacity: 1,
                  textDecoration: "underline",
                  textUnderlineOffset: "6px",
                }}
              >
                Home
              </Box>

              <Box
                as={RouterLink}
                to="/blog"
                _hover={{
                  opacity: 1,
                  textDecoration: "underline",
                  textUnderlineOffset: "6px",
                }}
              >
                Blog
              </Box>
            </HStack>

            <Spacer />

            {/* Auth */}
            <HStack spacing={3}>
              <Button
                as={RouterLink}
                to="/login"
                size="sm"
                variant="outline"
                borderColor={INK}
                color={INK}
                borderRadius="12px"
                _hover={{ bg: "rgba(255,255,255,0.55)" }}
              >
                Sign In
              </Button>

              <Button
                as={RouterLink}
                to="/signup?role=family"
                size="sm"
                bg={TERRACOTTA}
                color="white"
                borderRadius="12px"
                _hover={{ bg: TERRACOTTA_DARK }}
              >
                Sign Up
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* ================= HERO ================= */}
      <Box pt={{ base: 14, md: 18 }} pb={{ base: 18, md: 26 }}>
        <Container maxW="1100px">
          <Stack spacing={7} align="center" textAlign="center">
            <Heading
              as="h1"
              fontWeight="600"
              letterSpacing="-0.4px"
              lineHeight="1.15"
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              maxW="900px"
            >
              Connecting families to birth and postpartum care professionals,
              all in one place.
            </Heading>

            <Text
              fontSize={{ base: "md", md: "lg" }}
              color={MUTED}
              maxW="760px"
              lineHeight="1.7"
            >
 >
              Connecting families and healthcare professionals in a network of
              care, support and growth during the journey of motherhood and child
              development. Enter your ZIP code or city to explore professionals
              in your area.
            </Text>

            <HStack spacing={4} pt={2} flexWrap="wrap" justify="center">
              <Button
                as={RouterLink}
                to="/professionals"
                bg={TERRACOTTA}
                color="white"
                _hover={{ bg: TERRACOTTA_DARK }}
                borderRadius="12px"
                px={8}
                h="44px"
                boxShadow="0 10px 22px rgba(0,0,0,0.10)"
              >
                Find Professionals
              </Button>

              <Button
                as={RouterLink}
                to="/signup?role=family"
                bg="rgba(255,255,255,0.6)"
                border="1px solid"
                borderColor={TERRACOTTA_TEXT}
                color={TERRACOTTA_TEXT}
                _hover={{ bg: "rgba(255,255,255,0.8)" }}
                borderRadius="12px"
                px={8}
                h="44px"
              >
                Sign Up for Free
              </Button>
            </HStack>

            <Box
              pt={{ base: 6, md: 8 }}
              w="100%"
              display="flex"
              justifyContent="center"
            >
              <Box
                w={{ base: "100%", md: "760px" }}
                borderRadius="18px"
                overflow="hidden"
                boxShadow="0 18px 45px rgba(0,0,0,0.16)"
                border="1px solid"
                borderColor="rgba(255,255,255,0.55)"
                bg="rgba(255,255,255,0.20)"
              >
                <Image
                  src={heroImg}
                  alt="Family and provider support"
                  w="100%"
                  h={{ base: "240px", md: "360px" }}
                  objectFit="cover"
                />
              </Box>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* ================= FOOTER ================= */}
      <Box bg="white" borderTop="1px solid" borderColor={BORDER}>
        <Container maxW="1100px" py={6}>
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={6}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
          >
            <Box>
              <Text fontSize="sm" color={MUTED}>
                📧 newbornhub2026@gmail.com
              </Text>
            </Box>

            <Box textAlign={{ base: "left", md: "right" }}>
              <Text fontSize="sm" color={MUTED}>
                © 2026 Newborn Care Hub. All rights reserved.
              </Text>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
