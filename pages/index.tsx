import type { GetStaticProps } from 'next';
import Head from 'next/head';
import styled from 'styled-components';
import { IngredientGrid } from '../components/IngredientGrid';
import { Layout } from '../components/Layout';
import type { IngredientData } from '../lib/ingredients';
import { getIngredients } from '../lib/ingredients';

const Intro = styled.section`
  margin-bottom: 2.5rem;
  display: grid;
  gap: 1.5rem;
`;

const HighlightCard = styled.div`
  background: rgba(27, 27, 41, 0.8);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
  padding: 1.5rem;
  line-height: 1.5;
`;

const GeneratedAt = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface HomePageProps {
  ingredients: IngredientData[];
  generatedAt: string;
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const ingredients = await getIngredients();

  return {
    props: {
      ingredients,
      generatedAt: new Date().toISOString(),
    },
  };
};

export default function HomePage({ ingredients, generatedAt }: HomePageProps) {
  return (
    <Layout>
      <Head>
        <title>Ingredient Explorer dashboard</title>
      </Head>
      <Intro>
        <HighlightCard>
          <p>
            This grid highlights the top 100 food ingredients ranked by simulated Ahrefs search
            demand. Each card surfaces the average monthly search volume, taxonomy parent (super
            ingredient), and a sparkline to visualise the recent trend.
          </p>
          <p>
            Metadata is sourced from the{' '}
            <a
              href="https://static.openfoodfacts.org/data/taxonomies/ingredients.full.json"
              target="_blank"
              rel="noreferrer"
            >
              Open Food Facts ingredient taxonomy
            </a>
            , which provides CIQUAL nutritional mappings, carbon footprint (FoodGES) data, synonyms
            per locale, and hierarchical relationships. Descriptions are fetched from Wikipedia using
            the ingredient label as a fallback when a direct taxonomy URL is absent.
          </p>
          <p>
            Click on any ingredient to inspect additional parameters such as CIQUAL names/codes,
            synonyms across languages, carbon impact values, and notable sub-ingredients.
          </p>
          <GeneratedAt>
            Dataset refreshed: {new Date(generatedAt).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </GeneratedAt>
        </HighlightCard>
      </Intro>
      <IngredientGrid ingredients={ingredients} />
    </Layout>
  );
}
