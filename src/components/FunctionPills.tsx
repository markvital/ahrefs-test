"use client";

import { Chip, Stack } from "@mui/material";

interface FunctionPillsProps {
  functions: string[];
  emptyLabel?: string;
}

export default function FunctionPills({ functions, emptyLabel }: FunctionPillsProps) {
  if (!functions.length) {
    return emptyLabel ? (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip label={emptyLabel} size="small" variant="outlined" />
      </Stack>
    ) : null;
  }

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {functions.map((fn) => (
        <Chip key={fn} label={fn} size="small" />
      ))}
    </Stack>
  );
}
