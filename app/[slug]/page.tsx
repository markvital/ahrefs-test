import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Box, Chip, Link as MuiLink, Stack, Typography } from '@mui/material';

import { getAdditiveBySlug, getAdditiveSlugs } from '../../lib/additives';
import { getSearchHistory } from '../../lib/search-history';
import { SearchHistoryChart } from '../../components/SearchHistoryChart';

interface AdditivePageProps {
  params: Promise<{ slug: string }>;
}

const formatAdditiveDisplayName = (eNumber: string, title: string): string => {
  const parts = [eNumber, title]
    .map((part) => part.trim())
    .filter((part, index, list) => part.length > 0 && list.indexOf(part) === index);

  return parts.join(' - ') || 'Additive';
};

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

  const displayName = formatAdditiveDisplayName(additive.eNumber, additive.title);

  return {
    title: displayName,
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
  const searchHistory = getSearchHistory(additive.slug);
  const searchKeyword = searchHistory?.keyword?.trim();
  const hasSearchHistory =
    !!searchHistory &&
    searchHistory.metrics.length > 0 &&
    !!searchKeyword;
  const displayName = formatAdditiveDisplayName(additive.eNumber, additive.title);
  return (
    <Box component="article" display="flex" flexDirection="column" gap={4} alignItems="center" width="100%">
      <Box sx={{ width: '100%', maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box display="flex" flexDirection="column" gap={1.5}>
          <Typography component="h1" variant="h1">
            {displayName}
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
      </Box>

      {hasSearchHistory && searchHistory && searchKeyword && (
        <Box
          id="search-history"
          sx={{
            width: '100%',
            maxWidth: { xs: 760, md: 960 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            px: { xs: 0, md: 2 },
          }}
        >
          <SearchHistoryChart metrics={searchHistory.metrics} />

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Interest over time on &ldquo;{searchKeyword}&rdquo; in the U.S. for the last 10 years
          </Typography>
        </Box>
      )}

      <Box sx={{ width: '100%', maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 3 }}>
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
    </Box>
  );
}
