'use client';

import { useMemo } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { Box, useTheme } from '@mui/material';

interface SearchSparklineProps {
  values: Array<number | null>;
}

const buildSparklineData = (values: Array<number | null>) => {
  const endYear = new Date().getUTCFullYear();
  const startYear = endYear - values.length + 1;

  return values.map((value, index) => ({
    x: startYear + index,
    y: value,
  }));
};

export function SearchSparkline({ values }: SearchSparklineProps) {
  const theme = useTheme();
  const series = useMemo(() => buildSparklineData(values), [values]);

  return (
    <Box sx={{ width: '100%', height: 56 }}>
      <ResponsiveLine
        data={[
          {
            id: 'sparkline',
            data: series,
          },
        ]}
        margin={{ top: 8, right: 0, bottom: 8, left: 0 }}
        xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
        yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
        axisBottom={null}
        axisLeft={null}
        colors={[theme.palette.primary.main]}
        theme={{
          axis: { ticks: { text: { fill: theme.palette.text.secondary } } },
        }}
        curve="monotoneX"
        enableArea
        areaOpacity={0.08}
        enablePoints={false}
        useMesh={false}
        isInteractive={false}
      />
    </Box>
  );
}
