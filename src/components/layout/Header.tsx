"use client";

import Link from "next/link";
import { Box, Container, Typography } from "@mui/material";

export default function Header() {
  return (
    <Box
      component="header"
      sx={{
        borderBottom: "1px solid",
        borderColor: "grey.200",
        backgroundColor: "background.paper",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2 }}
      >
        <Typography
          component={Link}
          href="/"
          variant="h6"
          sx={{
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "text.primary",
          }}
        >
          Food Additives
        </Typography>
      </Container>
    </Box>
  );
}
