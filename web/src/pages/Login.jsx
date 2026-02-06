import { useState } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Stack,
  Input,
  Button,
  Link,
  HStack,
} from "@chakra-ui/react";

import { useAuth } from "../context/AuthContext";
import { apiLogin } from "../api/auth"; // ✅ você precisa ter isso no seu api/auth.js

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, reloadMe } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1) chama backend para autenticar
      const res = await apiLogin({ email, password });

      // 2) normaliza o payload para o formato que seu AuthContext espera
      const payload = {
        access: res?.access ?? res?.tokens?.access ?? res?.data?.access,
        refresh: res?.refresh ?? res?.tokens?.refresh ?? res?.data?.refresh,
        user: res?.user ?? res?.data?.user,
      };

      if (!payload.access) {
        throw new Error("Login succeeded but no access token was returned.");
      }

      // 3) salva tokens + user no AuthContext
      login(payload);

      // 4) se seu backend não retorna user, busca /me
      if (!payload.user) {
        await reloadMe();
      }

      // 5) redirect
      const redirectTo = location.state?.from?.pathname || "/professionals";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please check your credentials.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-b, #eeccb3 0%, #BFD9C9 100%)"
      py={{ base: 10, md: 16 }}
    >
      <Container maxW="container.md">
        <Flex align="center" justify="center">
          <Box
            w="100%"
            bg="#eeccb3"
            border="1px solid"
            borderColor="blackAlpha.100"
            borderRadius="18px"
            boxShadow="0 18px 50px rgba(0,0,0,0.10)"
            px={{ base: 6, md: 10 }}
            py={{ base: 7, md: 10 }}
          >
            <form onSubmit={handleSubmit}>
              <Stack spacing={6}>
                <Stack spacing={1} textAlign="center">
                  <Heading fontSize={{ base: "2xl", md: "3xl" }} color="#1A202C">
                    Sign In to Newborn Care Hub
                  </Heading>
                  <Text color="blackAlpha.700">
                    Access your account to continue
                  </Text>
                </Stack>

                <Stack spacing={4}>
                  <Box>
                    <Text mb={2} fontWeight="600" color="blackAlpha.800">
                      Email
                    </Text>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="you@example.com"
                      bg="#E9F1FF"
                      borderColor="blackAlpha.200"
                      autoComplete="email"
                      _focusVisible={{
                        borderColor: "#C6856D",
                        boxShadow: "0 0 0 3px rgba(198,133,109,0.25)",
                      }}
                    />
                  </Box>

                  <Box>
                    <Text mb={2} fontWeight="600" color="blackAlpha.800">
                      Password
                    </Text>
                    <Input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      placeholder="••••••••"
                      bg="#E9F1FF"
                      borderColor="blackAlpha.200"
                      autoComplete="current-password"
                      _focusVisible={{
                        borderColor: "#C6856D",
                        boxShadow: "0 0 0 3px rgba(198,133,109,0.25)",
                      }}
                    />
                  </Box>

                  {errorMsg ? (
                    <Text color="red.600" fontWeight="600">
                      {errorMsg}
                    </Text>
                  ) : null}

                  <HStack justify="space-between">
                    <Text fontSize="sm" color="blackAlpha.700">
                      Remember me
                    </Text>

                    <Link
                      href="#"
                      fontSize="sm"
                      color="#C6856D"
                      fontWeight="600"
                      _hover={{ textDecoration: "underline" }}
                    >
                      Forgot password
                    </Link>
                  </HStack>

                  <Button
                    type="submit"
                    w="100%"
                    bg="#C6856D"
                    color="white"
                    borderRadius="12px"
                    size="lg"
                    isLoading={isSubmitting}
                    _hover={{ bg: "#B4745F" }}
                    _active={{ bg: "#A76652" }}
                  >
                    Sign In
                  </Button>

                  <Text textAlign="center" color="blackAlpha.700">
                    Don&apos;t have an account?{" "}
                    <Link
                      as={RouterLink}
                      to="/signup?role=family"
                      color="#C6856D"
                      fontWeight="700"
                      _hover={{ textDecoration: "underline" }}
                    >
                      Sign up here
                    </Link>
                  </Text>
                </Stack>
              </Stack>
            </form>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
