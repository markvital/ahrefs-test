"use client";

import NextLink from "next/link";
import { Chip, Container, Divider, Link, Stack, Typography } from "@mui/material";

import { Additive } from "@/types/additive";
import FunctionPills from "./FunctionPills";

interface AdditiveDetailContentProps {
  additive: Additive;
}

export default function AdditiveDetailContent({
  additive,
}: AdditiveDetailContentProps) {
  return (
    <Container maxWidth="md">
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary" letterSpacing={2}>
            {additive.eNumber}
          </Typography>
          <Typography variant="h3" component="h1" color="text.primary">
            {additive.title}
          </Typography>
        </Stack>

        {additive.synonyms.length > 0 && (
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" color="text.secondary">
              Synonyms
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {additive.synonyms.map((synonym) => (
                <Chip key={synonym} label={synonym} size="small" />
              ))}
            </Stack>
          </Stack>
        )}

        <Stack spacing={1.5}>
          <Typography variant="subtitle2" color="text.secondary">
            Functions
          </Typography>
          <FunctionPills
            functions={additive.functions}
            emptyLabel="Function class not specified"
          />
        </Stack>

        {additive.description && (
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {additive.description}
          </Typography>
        )}

        <Divider />

        <Link
          component={NextLink}
          href={additive.wikipedia}
          target="_blank"
          rel="noopener noreferrer"
          variant="body1"
          sx={{ fontWeight: 500 }}
        >
          Read more on Wikipedia
        </Link>
      </Stack>
    </Container>
  );
}
