import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Box, Chip, Divider, Link as MuiLink, Stack, Typography } from '@mui/material';

import { getAdditiveBySlug, getAdditiveSlugs } from '../../lib/additives';

interface AdditivePageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAdditiveSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: AdditivePageProps): Promise<Metadata> {
  const { slug } = params;
  const additive = getAdditiveBySlug(slug);

  if (!additive) {
    return {
      title: 'Additive not found',
    };
  }

  return {
    title: `${additive.eNumber} - ${additive.title}`,
    description: additive.description,
    alternates: {
      canonical: `/${additive.slug}`,
    },
  };
}

export default function AdditivePage({ params }: AdditivePageProps) {
  const { slug } = params;
  const additive = getAdditiveBySlug(slug);

  if (!additive) {
    notFound();
  }

  const synonymList = additive.synonyms.filter((value, index, list) => list.indexOf(value) === index);

  return (
    <Box component="article" display="flex" flexDirection="column" gap={3} maxWidth={760}>
      <Box display="flex" flexDirection="column" gap={1}>
        <Typography component="h1" variant="h1">
          {additive.eNumber} - {additive.title}
        </Typography>
        {synonymList.length > 0 && (
          <Typography variant="body1" color="text.secondary">
            <strong>Synonyms:</strong> {synonymList.join(', ')}
          </Typography>
        )}
      </Box>

      {additive.functions.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {additive.functions.map((fn) => (
            <Chip key={fn} label={fn} variant="outlined" />
          ))}
        </Stack>
      )}

      {additive.description && (
        <Typography variant="body1" color="text.primary" whiteSpace="pre-line">
          {additive.description}
        </Typography>
      )}

      {additive.wikipedia && (
        <Typography variant="body1">
          <MuiLink
            href={additive.wikipedia}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{ fontWeight: 500 }}
          >
            Read more on Wikipedia
          </MuiLink>
        </Typography>
      )}

      <Divider />

      <Typography variant="body2" color="text.secondary">
        This page is part of the Food Additives catalogue. More details and related resources will be added in future updates.
      </Typography>
    </Box>
  );
}
