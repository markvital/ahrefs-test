import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Box, Chip, Link as MuiLink, Stack, Typography } from '@mui/material';

import { getAdditiveBySlug, getAdditiveSlugs } from '../../lib/additives';

interface AdditivePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAdditiveSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: AdditivePageProps): Promise<Metadata> {
  const { slug } = await params;
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

export default async function AdditivePage({ params }: AdditivePageProps) {
  const { slug } = await params;
  const additive = getAdditiveBySlug(slug);

  if (!additive) {
    notFound();
  }

  const synonymList = additive.synonyms.filter((value, index, list) => list.indexOf(value) === index);

  return (
    <Box component="article" display="flex" flexDirection="column" gap={3} maxWidth={760}>
      <Box display="flex" flexDirection="column" gap={1.5}>
        <Typography component="h1" variant="h1">
          {additive.eNumber} - {additive.title}
        </Typography>
        {synonymList.length > 0 && (
          <Typography variant="body1" color="text.secondary">
            <Box component="span" sx={{ fontWeight: 600 }}>
              Synonyms:
            </Box>{' '}
            {synonymList.map((synonym) => (
              <Box
                component="span"
                key={synonym}
                sx={{
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  '&:not(:last-of-type)': {
                    marginRight: 2,
                    '&::after': {
                      content: '", "',
                    },
                  },
                }}
              >
                {synonym}
              </Box>
            ))}
          </Typography>
        )}
      </Box>

      {additive.functions.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontWeight: 600, whiteSpace: 'nowrap', marginRight: 1.5 }}
          >
            Function:
          </Typography>
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
    </Box>
  );
}
