"use client";

import Link from "next/link";
import { Card, CardActionArea, CardContent, Stack, Typography } from "@mui/material";

import { Additive } from "@/types/additive";
import FunctionPills from "./FunctionPills";

interface AdditiveCardProps {
  additive: Additive;
}

export default function AdditiveCard({ additive }: AdditiveCardProps) {
  return (
    <Card>
      <Link
        href={`/${additive.slug}`}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        <CardActionArea sx={{ p: 2 }}>
          <CardContent sx={{ p: 0, display: "flex", flexDirection: "column", gap: 2 }}>
            <Stack spacing={0.5}>
              <Typography variant="overline" color="text.secondary" letterSpacing={2}>
                {additive.eNumber}
              </Typography>
              <Typography variant="h6" color="text.primary">
                {additive.title}
              </Typography>
            </Stack>
            <FunctionPills functions={additive.functions} emptyLabel="Not specified" />
          </CardContent>
        </CardActionArea>
      </Link>
    </Card>
  );
}
