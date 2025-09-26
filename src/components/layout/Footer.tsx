"use client";

import { Box, Container, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: "1px solid",
        borderColor: "grey.200",
        backgroundColor: "background.paper",
        py: 3,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Food Additives © {new Date().getFullYear()}. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
