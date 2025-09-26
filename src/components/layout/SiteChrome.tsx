"use client";

import { Box } from "@mui/material";
import { PropsWithChildren } from "react";

import Footer from "./Footer";
import Header from "./Header";

export default function SiteChrome({ children }: PropsWithChildren) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
      }}
    >
      <Header />
      <Box component="main" sx={{ flexGrow: 1, py: { xs: 4, md: 6 } }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
