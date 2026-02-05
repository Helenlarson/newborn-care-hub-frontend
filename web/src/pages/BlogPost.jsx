// src/pages/BlogPost.jsx
import { Link as RouterLink, useParams } from "react-router-dom";
import Topbar from "../components/Topbar";
import { blogPosts } from "../data/blogPosts";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Button,
  Badge,
} from "@chakra-ui/react";

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  // ✅ Turn on/off debug
  const DEBUG_MD = false;

  const PAGE_BG = "#F3E1D6";
  const INK = "#2F3A45";
  const MUTED = "#5F6C78";
  const CARD_BG = "rgba(255,255,255,0.45)";
  const BORDER = "rgba(47,58,69,0.18)";
  const TERRACOTTA = "#B88975";

  if (!post) {
    return (
      <Box minH="100vh" bg={PAGE_BG} color={INK}>
        <Topbar />
        <Container maxW="900px" py={{ base: 10, md: 14 }}>
          <Stack spacing={6}>
            <Button
              as={RouterLink}
              to="/blog"
              w="fit-content"
              borderRadius="999px"
              variant="outline"
              borderColor={BORDER}
              bg="rgba(255,255,255,0.25)"
              _hover={{ bg: "rgba(255,255,255,0.35)" }}
              size="sm"
            >
              ← Back to Blog
            </Button>

            <Box
              border="1px solid"
              borderColor={BORDER}
              bg={CARD_BG}
              borderRadius="18px"
              p={{ base: 6, md: 8 }}
              boxShadow="0 18px 45px rgba(0,0,0,0.10)"
            >
              <Heading fontWeight="800" fontSize={{ base: "xl", md: "2xl" }}>
                Post not found
              </Heading>
              <Text mt={2} color={MUTED} lineHeight="1.7">
                This post doesn’t exist (or the slug is wrong).
              </Text>
            </Box>
          </Stack>
        </Container>
      </Box>
    );
  }

  // ✅ Use markdown as-is (your content is already markdown)
  const markdown = typeof post.content === "string" ? post.content : "";

  return (
    <Box minH="100vh" bg={PAGE_BG} color={INK}>
      <Topbar />

      <Container maxW="900px" py={{ base: 10, md: 14 }}>
        <Stack spacing={6}>
          <Button
            as={RouterLink}
            to="/blog"
            w="fit-content"
            borderRadius="999px"
            variant="outline"
            borderColor={BORDER}
            bg="rgba(255,255,255,0.25)"
            _hover={{ bg: "rgba(255,255,255,0.35)" }}
            size="sm"
          >
            ← Back to Blog
          </Button>

          <Box
            border="1px solid"
            borderColor={BORDER}
            bg={CARD_BG}
            borderRadius="18px"
            overflow="hidden"
            boxShadow="0 18px 45px rgba(0,0,0,0.10)"
          >
            <Box p={{ base: 6, md: 9 }}>
              {post.featured ? (
                <Badge
                  bg="rgba(184,137,117,0.18)"
                  color={TERRACOTTA}
                  border="1px solid rgba(184,137,117,0.35)"
                  borderRadius="999px"
                  px={3}
                  py={1}
                  mb={4}
                  fontWeight="600"
                >
                  Featured Article
                </Badge>
              ) : null}

              <Heading
                fontWeight="800"
                letterSpacing="-0.6px"
                lineHeight="1.05"
                fontSize={{ base: "2xl", md: "4xl" }}
              >
                {post.title}
              </Heading>

              <Text mt={2} color="rgba(47,58,69,0.6)" fontSize="sm">
                {post.date}
                {post.readingTime ? ` • ${post.readingTime}` : ""}
              </Text>

              <Box h="1px" bg="rgba(47,58,69,0.12)" my={6} />

              {DEBUG_MD ? (
                <Box
                  as="pre"
                  p={4}
                  borderRadius="12px"
                  bg="rgba(255,255,255,0.35)"
                  border="1px solid rgba(47,58,69,0.12)"
                  overflowX="auto"
                  fontSize="12px"
                  color={INK}
                  whiteSpace="pre-wrap"
                >
                  {markdown}
                </Box>
              ) : null}

              <Box
                sx={{
                  color: MUTED,
                  fontSize: { base: "md", md: "lg" },
                  lineHeight: "1.9",

                  "& p": { mb: 4 },

                  // headings: your content uses ### => h3
                  "& h2": {
                    color: INK,
                    fontWeight: "800",
                    mt: 10,
                    mb: 3,
                    fontSize: { base: "xl", md: "2xl" },
                    letterSpacing: "-0.3px",
                  },
                  "& h3": {
                    color: INK,
                    fontWeight: "800",
                    mt: 8,
                    mb: 2,
                    fontSize: { base: "lg", md: "xl" },
                    letterSpacing: "-0.2px",
                  },

                  // Force list styles even if there is a global CSS reset
                  "& ul": {
                    paddingLeft: "24px !important",
                    marginBottom: "20px !important",
                    listStyleType: "disc !important",
                    listStylePosition: "outside !important",
                  },
                  "& ol": {
                    paddingLeft: "24px !important",
                    marginBottom: "20px !important",
                    listStyleType: "decimal !important",
                    listStylePosition: "outside !important",
                  },
                  "& li": { marginBottom: "8px !important" },
                  "& li::marker": {
                    color: `${INK} !important`,
                    fontSize: "1em !important",
                  },

                  "& a": {
                    color: `${TERRACOTTA} !important`,
                    fontWeight: "700",
                    textDecoration: "underline",
                  },

                  "& blockquote": {
                    borderLeft: "4px solid rgba(184,137,117,0.55)",
                    paddingLeft: "16px",
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    marginTop: "24px",
                    marginBottom: "24px",
                    background: "rgba(255,255,255,0.28)",
                    borderRadius: "12px",
                  },

                  "& hr": {
                    border: 0,
                    height: "1px",
                    background: "rgba(47,58,69,0.12)",
                    marginTop: "32px",
                    marginBottom: "32px",
                  },
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdown}
                </ReactMarkdown>
              </Box>

              <Box
                mt={10}
                p={5}
                border="1px solid rgba(47,58,69,0.12)"
                borderRadius="14px"
                bg="rgba(255,255,255,0.28)"
              >
                <Heading fontSize="lg" mb={2} color={INK}>
                  Want more newborn + postpartum tips?
                </Heading>
                <Text color={MUTED}>
                  Check back weekly for new articles and practical guidance.
                </Text>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
