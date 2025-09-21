import styled from 'styled-components';
import type { SearchTrendPoint } from '../lib/searchMetrics';

const Svg = styled.svg`
  width: 100%;
  height: 48px;
`;

const Path = styled.path`
  fill: none;
  stroke: ${({ theme }) => theme.colors.accentSecondary};
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const Area = styled.path`
  fill: rgba(142, 202, 230, 0.2);
  stroke: none;
`;

interface SparklineProps {
  data: SearchTrendPoint[];
}

export function Sparkline({ data }: SparklineProps) {
  if (!data.length) {
    return null;
  }

  const values = data.map((point) => point.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const width = data.length - 1;

  const coordinates = data.map((point, index) => {
    const x = width === 0 ? 0 : (index / width) * 100;
    const y = max === min ? 50 : 100 - ((point.value - min) / (max - min)) * 100;
    return `${x},${y}`;
  });

  const pathD = `M${coordinates.join(' L')}`;
  const areaD = `M0,100 L${coordinates.join(' L')} L100,100 Z`;

  return (
    <Svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-hidden>
      <defs>
        <linearGradient id="sparklineGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(142, 202, 230, 0.4)" />
          <stop offset="100%" stopColor="rgba(142, 202, 230, 0)" />
        </linearGradient>
      </defs>
      <Area d={areaD} fill="url(#sparklineGradient)" />
      <Path d={pathD} />
      <circle
        cx="100"
        cy={coordinates.length ? coordinates[coordinates.length - 1].split(',')[1] : '50'}
        r="2.4"
        fill="#ffb703"
      />
    </Svg>
  );
}
