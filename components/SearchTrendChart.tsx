import dynamic from 'next/dynamic';
import styled from 'styled-components';
import type { SearchTrendPoint } from '../lib/searchMetrics';

const ChartContainer = styled.div`
  height: 320px;
  width: 100%;
`;

const ResponsiveLine = dynamic(() => import('@nivo/line').then((mod) => mod.ResponsiveLine), {
  ssr: false,
});

interface SearchTrendChartProps {
  data: { id: string; color?: string; data: { x: string; y: number }[] }[];
}

export function SearchTrendChart({ data }: SearchTrendChartProps) {
  const colors = data.map((series) => series.color ?? '#8ecae6');

  return (
    <ChartContainer>
      <ResponsiveLine
        data={data}
        margin={{ top: 50, right: 24, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', stacked: false, min: 'auto', max: 'auto' }}
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        axisBottom={{ tickRotation: -45, tickSize: 6, tickPadding: 12 }}
        colors={colors}
        pointSize={6}
        pointBorderWidth={2}
        useMesh
        theme={{
          axis: {
            ticks: {
              text: {
                fill: '#f1f5f9',
              },
            },
            legend: {
              text: {
                fill: '#f1f5f9',
              },
            },
          },
          grid: {
            line: {
              stroke: '#312f4b',
            },
          },
        }}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateY: 60,
            itemsSpacing: 16,
            itemDirection: 'left-to-right',
            itemWidth: 100,
            itemHeight: 16,
            itemTextColor: '#cbd5f5',
            symbolSize: 12,
            symbolShape: 'circle',
            symbolBorderColor: 'rgba(0, 0, 0, .5)',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: '#ffffff',
                },
              },
            ],
          },
        ]}
      />
    </ChartContainer>
  );
}

export function toLineSeries(name: string, points: SearchTrendPoint[], color: string) {
  return {
    id: name,
    color,
    data: points.map((point) => ({ x: point.month, y: point.value })),
  };
}
