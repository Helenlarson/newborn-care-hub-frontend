// src/pages/Blog.jsx
import { Link as RouterLink } from "react-router-dom";
import Topbar from "../components/Topbar";
import { blogPosts } from "../data/blogPosts";
import blogHero from "../assets/blog-hero.jpg";

import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  Badge,
  Image,
} from "@chakra-ui/react";

export default function Blog() {
  // 🎨 Colors
  const PAGE_BG = "#F3E1D6";
  const INK = "#2F3A45";
  const MUTED = "#5F6C78";
  const CARD_BG = "rgba(255,255,255,0.45)";
  const BORDER = "rgba(47,58,69,0.18)";
  const TERRACOTTA = "#B88975";

  const featured = blogPosts.find((p) => p.featured) || blogPosts[0];
  const rest = blogPosts.filter((p) => p.slug !== featured.slug);

  return (
    <Box minH="100vh" bg={PAGE_BG} color={INK}>
      <Topbar />

      {/* HERO */}
      <Box pt={{ base: 10, md: 14 }} pb={{ base: 10, md: 12 }}>
        <Container maxW="1100px">
          <Stack spacing={5} textAlign="center" align="center">
            <Heading
              fontWeight="700"
              letterSpacing="-0.6px"
              lineHeight="1.05"
              fontSize={{ base: "3xl", md: "5xl" }}
            >
              Blog{" "}
              <Box as="span" color={TERRACOTTA}>
                Newborn Care Hub
              </Box>
            </Heading>

            <Text maxW="820px" color={MUTED} fontSize={{ base: "md", md: "lg" }}>
              Stories, tips, and guidance for pregnancy, postpartum, and newborn care.
            </Text>

            <Box w="100%" maxW="960px" pt={{ base: 6, md: 8 }}>
              <Box
                borderRadius="18px"
                overflow="hidden"
                border="1px solid"
                borderColor="rgba(255,255,255,0.55)"
                boxShadow="0 18px 45px rgba(0,0,0,0.12)"
                bg="rgba(255,255,255,0.18)"
              >
                <Image
                  src={blogHero}
                  alt="Blog cover"
                  w="100%"
                  h={{ base: "220px", md: "360px" }}
                  objectFit="cover"
                />
              </Box>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* CONTENT */}
      <Box pb={{ base: 14, md: 18 }}>
        <Container maxW="1100px">
          <Stack spacing={8}>
            {/* FEATURED */}
            <Box
              as={RouterLink}
              to={`/blog/${featured.slug}`}
              _hover={{ textDecoration: "none" }}
            >
              <Box
                border="1px solid"
                borderColor={BORDER}
                bg={CARD_BG}
                borderRadius="16px"
                overflow="hidden"
                boxShadow="0 10px 28px rgba(0,0,0,0.08)"
              >
                {featured.image && (
                  <Image
                    src={featured.image}
                    alt={featured.title}
                    w="100%"
                    h={{ base: "180px", md: "280px" }}
                    objectFit="cover"
                  />
                )}

                <Box p={{ base: 5, md: 7 }}>
                  <Badge
                    bg="rgba(184,137,117,0.18)"
                    color={TERRACOTTA}
                    border="1px solid rgba(184,137,117,0.35)"
                    borderRadius="999px"
                    px={3}
                    py={1}
                    mb={3}
                    fontWeight="600"
                  >
                    Featured Article
                  </Badge>

                  <Heading fontSize={{ base: "xl", md: "2xl" }} fontWeight="700">
                    {featured.title}
                  </Heading>

                  <Text mt={2} color={MUTED} lineHeight="1.7">
                    {featured.excerpt}
                  </Text>

                  <Text mt={3} fontSize="sm" color="rgba(47,58,69,0.55)">
                    {featured.date}
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* OTHER POSTS */}
            <SimpleGrid
              minChildWidth={{ base: "100%", md: "520px" }}
              spacing={6}
              alignItems="stretch"
            >
              {rest.map((post) => (
                <Box
                  key={post.slug}
                  as={RouterLink}
                  to={`/blog/${post.slug}`}
                  _hover={{ textDecoration: "none" }}
                  h="100%"
                >
                  <Box
                    border="1px solid"
                    borderColor={BORDER}
                    bg={CARD_BG}
                    borderRadius="16px"
                    p={{ base: 5, md: 6 }}
                    boxShadow="0 10px 28px rgba(0,0,0,0.06)"
                    _hover={{ boxShadow: "0 14px 34px rgba(0,0,0,0.08)" }}
                    h="100%"
                    display="flex"
                    flexDirection="column"
                  >
                    <Heading fontSize="lg" fontWeight="700">
                      {post.title}
                    </Heading>

                    <Text mt={2} color={MUTED} lineHeight="1.7">
                      {post.excerpt}
                    </Text>

                    <Text mt="auto" fontSize="sm" color="rgba(47,58,69,0.55)">
                      {post.date}
                    </Text>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
