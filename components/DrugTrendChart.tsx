import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { TrendPoint } from '../lib/types';

const ResponsiveLine = dynamic(() => import('@nivo/line').then((mod) => mod.ResponsiveLine), {
  ssr: false,
  loading: () => <Placeholder>Loading trend...</Placeholder>
});

const ChartContainer = styled.div`
  height: 320px;
  background: rgba(30, 64, 175, 0.25);
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 255, 0.2);
  padding: 1.25rem;
`;

const Placeholder = styled.div`
  height: 320px;
  border-radius: 18px;
  border: 1px dashed rgba(148, 163, 255, 0.3);
  display: grid;
  place-items: center;
  color: #cbd5f5;
  font-size: 0.95rem;
`;

type Props = {
  points?: TrendPoint[];
};

export function DrugTrendChart({ points }: Props) {
  if (!points || points.length === 0) {
    return <Placeholder>No trend data available.</Placeholder>;
  }

  const data = [
    {
      id: 'Search volume',
      data: points.map((point) => ({ x: point.month, y: point.value }))
    }
  ];

  return (
    <ChartContainer>
      <ResponsiveLine
        data={data}
        margin={{ top: 20, right: 20, bottom: 60, left: 70 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', stacked: false }}
        axisBottom={{
          tickRotation: -45,
          tickSize: 5,
          tickPadding: 12
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 12
        }}
        colors={['#38bdf8']}
        lineWidth={3}
        pointSize={4}
        useMesh
        theme={{
          text: {
            fill: '#f8fafc'
          },
          axis: {
            domain: {
              line: {
                stroke: 'rgba(148,163,255,0.4)'
              }
            },
            ticks: {
              line: {
                stroke: 'rgba(148,163,255,0.4)'
              }
            }
          },
          grid: {
            line: {
              stroke: 'rgba(148,163,255,0.2)'
            }
          },
          crosshair: {
            line: {
              stroke: 'rgba(148,163,255,0.6)'
            }
          }
        }}
      />
    </ChartContainer>
  );
}
