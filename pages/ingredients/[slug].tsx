import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import styled, { css } from 'styled-components';
import { Layout } from '../../components/Layout';
import { SearchTrendChart, toLineSeries } from '../../components/SearchTrendChart';
import type { IngredientData } from '../../lib/ingredients';
import { getIngredientBySlug, getIngredientSlugs } from '../../lib/ingredients';

const Header = styled.header<{ $hasImage: boolean }>`
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
  grid-template-columns: 1fr;
  align-items: start;

  ${({ $hasImage }) =>
    $hasImage &&
    css`
      @media (min-width: 768px) {
        grid-template-columns: minmax(0, 320px) minmax(0, 1fr);
      }
    `};
`;

const Visual = styled.div`
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255, 183, 3, 0.16), rgba(142, 202, 230, 0.14));
  aspect-ratio: 16 / 9;
  max-width: 420px;
`;

const HeroImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const HeaderContent = styled.div`
  display: grid;
  gap: 1rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(1.8rem, 4.5vw, 2.6rem);
`;

const Metadata = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.25rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.95rem;
  line-height: 1.5;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionLink = styled.a`
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.accent};
  color: #0d0d12;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

const Grid = styled.div`
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`;

const AttributeCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 1.2rem;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.textSecondary};

  strong {
    display: block;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 0.95rem;
  }
`;

interface IngredientPageProps {
  ingredient: IngredientData;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getIngredientSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<IngredientPageProps> = async ({ params }) => {
  const slug = params?.slug as string;
  const ingredient = await getIngredientBySlug(slug);

  if (!ingredient) {
    return { notFound: true };
  }

  return {
    props: {
      ingredient,
    },
  };
};

export default function IngredientPage({ ingredient }: IngredientPageProps) {
  const series = [toLineSeries(ingredient.displayName, ingredient.trend, '#8ecae6')];

  return (
    <Layout>
      <Head>
        <title>{ingredient.displayName} search interest</title>
      </Head>
      <Header $hasImage={Boolean(ingredient.imageUrl)}>
        {ingredient.imageUrl && (
          <Visual>
            <HeroImage src={ingredient.imageUrl} alt={ingredient.displayName} />
          </Visual>
        )}
        <HeaderContent>
          <Title>{ingredient.displayName}</Title>
          <Metadata>
            <span>Rank #{ingredient.search.rank}</span>
            <span>
              {ingredient.search.averageMonthlySearches.toLocaleString()} average monthly searches •{' '}
              {ingredient.search.totalMonthlySearches.toLocaleString()} searches over 12 months
            </span>
            {ingredient.superIngredients.length > 0 && (
              <span>Super ingredient: {ingredient.superIngredients.join(', ')}</span>
            )}
          </Metadata>
          <Actions>
            <Link href={{ pathname: '/compare', query: { base: ingredient.slug } }} passHref legacyBehavior>
              <ActionLink>Compare to another ingredient</ActionLink>
            </Link>
            {ingredient.wikipediaUrl && (
              <ActionLink href={ingredient.wikipediaUrl} target="_blank" rel="noreferrer">
                Read on Wikipedia
              </ActionLink>
            )}
          </Actions>
        </HeaderContent>
      </Header>
      <Section>
        <h2>Search interest</h2>
        <SearchTrendChart data={series} />
      </Section>
      {ingredient.description && (
        <Section>
          <h2>Description</h2>
          <p>{ingredient.description}</p>
        </Section>
      )}
      <Section>
        <h2>Taxonomy &amp; metadata</h2>
        <Grid>
          {ingredient.attributes.map((attribute) => (
            <AttributeCard key={attribute.label}>
              <strong>{attribute.label}</strong>
              <p>{attribute.values.join(', ')}</p>
            </AttributeCard>
          ))}
          {ingredient.wikidataId && (
            <AttributeCard>
              <strong>Wikidata</strong>
              <p>
                <a href={`https://www.wikidata.org/wiki/${ingredient.wikidataId}`} target="_blank" rel="noreferrer">
                  {ingredient.wikidataId}
                </a>
              </p>
            </AttributeCard>
          )}
        </Grid>
      </Section>
    </Layout>
  );
}
