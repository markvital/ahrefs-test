import Link from 'next/link';
import styled from 'styled-components';
import type { IngredientData } from '../lib/ingredients';
import { Sparkline } from './Sparkline';

const CardLink = styled.a`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.85rem;
  color: inherit;
  text-decoration: none;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 16px 32px rgba(8, 10, 20, 0.24);

  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &:focus-visible {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px rgba(255, 183, 3, 0.35);
    outline: none;
  }
`;

const Thumbnail = styled.div`
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255, 183, 3, 0.15), rgba(142, 202, 230, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ThumbnailFallback = styled.span`
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Rank = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
`;

const Name = styled.h2`
  margin: 0;
  font-size: 1.4rem;
  font-weight: ${({ theme }) => theme.typography.headingWeight};
  letter-spacing: -0.01em;
  line-height: 1.15;
`;

const SuperIngredient = styled.p`
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Metrics = styled.div`
  display: flex;
  gap: 1.5rem;
  font-size: 0.95rem;
  flex-wrap: wrap;
`;

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  span:first-child {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.7rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  strong {
    font-size: 1.05rem;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: ${({ theme }) => theme.typography.headingWeight};
  }
`;

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.94rem;
  line-height: 1.45;
`;

interface IngredientCardProps {
  ingredient: IngredientData;
}

export function IngredientCard({ ingredient }: IngredientCardProps) {
  const descriptionSnippet = ingredient.description
    ? `${ingredient.description.slice(0, 160)}${ingredient.description.length > 160 ? '…' : ''}`
    : 'Explore the ingredient page to see full metadata, taxonomy context, and search insights.';

  return (
    <Link href={`/ingredients/${ingredient.slug}`} passHref legacyBehavior>
      <CardLink>
        <Thumbnail>
          {ingredient.imageUrl ? (
            <ThumbnailImage src={ingredient.imageUrl} alt={ingredient.displayName} loading="lazy" />
          ) : (
            <ThumbnailFallback>No image</ThumbnailFallback>
          )}
        </Thumbnail>
        <Rank>
          <span>Rank #{ingredient.search.rank}</span>
          <span>•</span>
          <span>{ingredient.search.averageMonthlySearches.toLocaleString()} avg. monthly searches</span>
        </Rank>
        <Name>{ingredient.displayName}</Name>
        {ingredient.superIngredients.length > 0 && (
          <SuperIngredient>
            Super ingredient: {ingredient.superIngredients.map((item) => item).join(', ')}
          </SuperIngredient>
        )}
        <Metrics>
          <Metric>
            <span>Absolute demand</span>
            <strong>{ingredient.search.totalMonthlySearches.toLocaleString()} searches / 12 mo</strong>
          </Metric>
          <Metric>
            <span>Synonyms</span>
            <strong>{ingredient.synonyms.length ? ingredient.synonyms.slice(0, 3).join(', ') : 'None listed'}</strong>
          </Metric>
        </Metrics>
        <Sparkline data={ingredient.trend} />
        <Description>{descriptionSnippet}</Description>
      </CardLink>
    </Link>
  );
}
