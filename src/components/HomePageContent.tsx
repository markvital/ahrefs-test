"use client";

import { Box, Container, Stack, Typography } from "@mui/material";

import { Additive } from "@/types/additive";
import AdditiveCard from "./AdditiveCard";

interface HomePageContentProps {
  additives: Additive[];
}

export default function HomePageContent({ additives }: HomePageContentProps) {
  return (
    <Container maxWidth="lg">
      <Stack spacing={4}>
        <Stack spacing={1.5} textAlign={{ xs: "left", md: "center" }}>
          <Typography variant="h3" component="h1" color="text.primary">
            Food additives
          </Typography>
          <Typography variant="body1" color="text.secondary" maxWidth={640} mx={{ xs: 0, md: "auto" }}>
            Discover the essential facts about widely used food additives. Compare their E-numbers,
            common functions, and names to better understand what goes into everyday products.
          </Typography>
        </Stack>
        <Box
          sx={{
            display: "grid",
            gap: { xs: 3, md: 4 },
            gridTemplateColumns: {
              xs: "repeat(1, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
              xl: "repeat(6, minmax(0, 1fr))",
            },
          }}
        >
          {additives.map((additive) => (
            <AdditiveCard key={additive.slug} additive={additive} />
          ))}
        </Box>
      </Stack>
    </Container>
  );
}
