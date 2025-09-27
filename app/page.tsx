import Link from 'next/link';
import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';

import { getAdditives } from '../lib/additives';
import { SearchSparkline } from '../components/SearchSparkline';

const additives = getAdditives();

export default function HomePage() {
  return (
    <Box component="section" display="flex" flexDirection="column" gap={4}>
      <Box display="flex" flexDirection="column" gap={1.5} maxWidth={720}>
        <Typography component="h1" variant="h1">
          Food additives
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore the essential information behind common food additives. Compare their purposes and quickly
          access in-depth resources to make informed decisions about what goes into your food.
        </Typography>
      </Box>

      <Box
        display="grid"
        gap={{ xs: 2, sm: 3 }}
        sx={{
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          '@media (min-width: 1600px)': {
            gridTemplateColumns: 'repeat(6, 1fr)',
          },
        }}
      >
        {additives.map((additive) => {
          const hasSparkline =
            Array.isArray(additive.searchSparkline) &&
            additive.searchSparkline.some((value) => value !== null);

          return (
            <Card key={additive.slug} sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardActionArea component={Link} href={`/${additive.slug}`} sx={{ flexGrow: 1 }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box display="flex" flexDirection="column" gap={0.5}>
                    <Typography variant="overline" color="text.secondary" letterSpacing={1.2}>
                      {additive.eNumber}
                    </Typography>
                    <Typography component="h2" variant="h2">
                      {additive.title}
                    </Typography>
                  </Box>
                  {additive.functions.length > 0 ? (
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {additive.functions.map((fn) => (
                        <Chip key={fn} label={fn} variant="outlined" />
                      ))}
                    </Stack>
                  ) : (
                    <Box sx={{ minHeight: '1.5rem' }} />
                  )}
                </CardContent>
              </CardActionArea>
              {hasSparkline && (
                <Box
                  component={Link}
                  href={`/${additive.slug}#search-history`}
                  sx={{
                    px: 2,
                    pb: 1.5,
                    pt: 1,
                    display: 'block',
                  }}
                >
                  <SearchSparkline values={additive.searchSparkline ?? []} />
                </Box>
              )}
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
