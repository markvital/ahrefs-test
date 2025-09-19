import Link from 'next/link';
import styled from 'styled-components';
import { numberWithSeparators } from '../lib/numberWithSeparators';

export type DrugSummary = {
  slug: string;
  rank: number;
  genericName: string;
  brandNames: string[];
  alternateNames: string[];
  molecularFormula?: string;
  searchVolume: number;
};

const CardLink = styled(Link)`
  display: block;
  border-radius: 18px;
  padding: 1.75rem;
  background: linear-gradient(145deg, rgba(148, 163, 255, 0.12), rgba(59, 130, 246, 0.08));
  border: 1px solid rgba(148, 163, 255, 0.2);
  height: 100%;
  transition: transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-4px);
    border-color: rgba(251, 191, 36, 0.6);
    box-shadow: 0 12px 25px rgba(14, 116, 144, 0.35);
  }
`;

const RankBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f59e0b;
  color: #0f172a;
  font-weight: 700;
  border-radius: 999px;
  padding: 0.25rem 0.85rem;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
`;

const Name = styled.h2`
  margin: 0 0 0.5rem;
  font-size: 1.6rem;
  font-weight: 700;
`;

const Meta = styled.p`
  margin: 0;
  color: #cbd5f5;
  font-size: 0.95rem;
  line-height: 1.4;
`;

const Metric = styled.div`
  margin-top: 1.4rem;
  font-size: 0.95rem;
  color: #e0e7ff;
`;

const MetricValue = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: #f8fafc;
  margin-top: 0.35rem;
`;

export function DrugCard({ drug }: { drug: DrugSummary }) {
  const firstAlt = drug.alternateNames[0];
  const extraAltCount = Math.max(0, drug.alternateNames.length - 1);
  const altLabel = firstAlt ? `${firstAlt}${extraAltCount > 0 ? ` +${extraAltCount} more` : ''}` : '—';

  return (
    <CardLink href={`/drugs/${drug.slug}`}>
      <RankBadge>#{drug.rank}</RankBadge>
      <Name>{drug.genericName}</Name>
      <Meta>
        Brand: {drug.brandNames.length > 0 ? drug.brandNames.join(', ') : '—'}
        <br />
        Alt name: {altLabel}
        <br />
        Formula: {drug.molecularFormula ?? 'Unavailable'}
      </Meta>
      <Metric>
        Monthly search volume
        <MetricValue>{numberWithSeparators(drug.searchVolume)}</MetricValue>
      </Metric>
    </CardLink>
  );
}
