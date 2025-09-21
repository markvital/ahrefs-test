import { useState } from 'react';
import styled from 'styled-components';
import type { IngredientData } from '../lib/ingredients';
import { IngredientCard } from './IngredientCard';
import { IngredientModal } from './IngredientModal';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
`;

interface IngredientGridProps {
  ingredients: IngredientData[];
}

export function IngredientGrid({ ingredients }: IngredientGridProps) {
  const [activeIngredient, setActiveIngredient] = useState<IngredientData | null>(null);

  return (
    <>
      <Grid>
        {ingredients.map((ingredient) => (
          <IngredientCard key={ingredient.slug} ingredient={ingredient} onSelect={setActiveIngredient} />
        ))}
      </Grid>
      {activeIngredient && (
        <IngredientModal ingredient={activeIngredient} onClose={() => setActiveIngredient(null)} />
      )}
    </>
  );
}
