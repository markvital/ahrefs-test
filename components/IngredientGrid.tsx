import styled from 'styled-components';
import type { IngredientData } from '../lib/ingredients';
import { IngredientCard } from './IngredientCard';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
`;

interface IngredientGridProps {
  ingredients: IngredientData[];
}

export function IngredientGrid({ ingredients }: IngredientGridProps) {
  return (
    <Grid>
      {ingredients.map((ingredient) => (
        <IngredientCard key={ingredient.slug} ingredient={ingredient} />
      ))}
    </Grid>
  );
}
