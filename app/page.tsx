import Link from 'next/link';
import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';

import { getAdditives } from '../lib/additives';

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
        gridTemplateColumns={{
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
          xl: 'repeat(6, 1fr)',
        }}
      >
        {additives.map((additive) => (
          <Card key={additive.slug} sx={{ display: 'flex', flexDirection: 'column' }}>
            <CardActionArea component={Link} href={`/${additive.slug}`} sx={{ height: '100%' }}>
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
                  <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
                    {additive.functions.map((fn) => (
                      <Chip key={fn} label={fn} variant="outlined" />
                    ))}
                  </Stack>
                ) : (
                  <Box minHeight={24} />
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
