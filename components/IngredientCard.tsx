import styled from 'styled-components';
import type { IngredientData } from '../lib/ingredients';
import { Sparkline } from './Sparkline';

const Card = styled.button`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  color: inherit;
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:hover,
  &:focus {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.colors.accent};
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
`;

const Name = styled.h2`
  margin: 0;
  font-size: 1.35rem;
`;

const SuperIngredient = styled.p`
  margin: 0;
  font-size: 0.95rem;
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
`;

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.95rem;
  line-height: 1.4;
`;

interface IngredientCardProps {
  ingredient: IngredientData;
  onSelect: (ingredient: IngredientData) => void;
}

export function IngredientCard({ ingredient, onSelect }: IngredientCardProps) {
  const descriptionSnippet = ingredient.description
    ? `${ingredient.description.slice(0, 160)}${ingredient.description.length > 160 ? '…' : ''}`
    : 'No summary available yet. Tap to explore detailed metadata.';

  return (
    <Card type="button" onClick={() => onSelect(ingredient)}>
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
    </Card>
  );
}
