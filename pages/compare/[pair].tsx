import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import styled from 'styled-components';
import { Layout } from '../../components/Layout';
import { SearchTrendChart, toLineSeries } from '../../components/SearchTrendChart';
import type { IngredientData } from '../../lib/ingredients';
import { getComparePairs, getIngredientBySlug } from '../../lib/ingredients';

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  margin: 0;
`;

const HeroRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const HeroCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(27, 27, 41, 0.65);
`;

const HeroImage = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
`;

const HeroFallback = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 183, 3, 0.18), rgba(142, 202, 230, 0.15));
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  flex-shrink: 0;
`;

const HeroLabel = styled.div`
  display: grid;
  gap: 0.2rem;

  strong {
    font-size: 1rem;
  }

  span {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const PairLabel = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const SecondaryLink = styled.a`
  padding: 0.6rem 1.1rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.accentSecondary};
  color: ${({ theme }) => theme.colors.accentSecondary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  font-weight: 600;
`;

const ComparisonGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const StatCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1.2rem;

  span {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 0.35rem;
  }

  strong {
    font-size: 1.2rem;
  }
`;

const AttributesSection = styled.section`
  display: grid;
  gap: 1rem;
`;

const AttributeList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const AttributeRow = styled.div`
  background: rgba(27, 27, 41, 0.6);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 1rem;
`;

const AttributeTitle = styled.h3`
  margin: 0 0 0.35rem;
  font-size: 1rem;
`;

const AttributeContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  span {
    display: block;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin-bottom: 0.35rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textPrimary};
    line-height: 1.45;
  }
`;

interface ComparePairProps {
  first: IngredientData;
  second: IngredientData;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const pairs = await getComparePairs();
  const paths = pairs.map(({ slugA, slugB }) => ({
    params: { pair: `${slugA}-vs-${slugB}` },
  }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<ComparePairProps> = async ({ params }) => {
  const pair = params?.pair as string;
  const [slugA, slugB] = pair.split('-vs-');

  if (!slugA || !slugB) {
    return { notFound: true };
  }

  const [first, second] = await Promise.all([
    getIngredientBySlug(slugA),
    getIngredientBySlug(slugB),
  ]);

  if (!first || !second) {
    return { notFound: true };
  }

  return {
    props: {
      first,
      second,
    },
  };
};

export default function ComparePairPage({ first, second }: ComparePairProps) {
  const combinedSeries = [
    toLineSeries(first.displayName, first.trend, '#8ecae6'),
    toLineSeries(second.displayName, second.trend, '#ffb703'),
  ];

  const rankDelta = first.search.rank - second.search.rank;
  const averageDelta = first.search.averageMonthlySearches - second.search.averageMonthlySearches;
  const totalDelta = first.search.totalMonthlySearches - second.search.totalMonthlySearches;

  return (
    <Layout>
      <Head>
        <title>
          {first.displayName} vs {second.displayName} demand comparison
        </title>
      </Head>
      <Header>
        <Title>
          {first.displayName} vs {second.displayName}
        </Title>
        <HeroRow>
          <HeroCard>
            {first.imageUrl ? (
              <HeroImage src={first.imageUrl} alt={first.displayName} />
            ) : (
              <HeroFallback>{first.displayName.charAt(0).toUpperCase()}</HeroFallback>
            )}
            <HeroLabel>
              <strong>{first.displayName}</strong>
              <span>Rank #{first.search.rank}</span>
            </HeroLabel>
          </HeroCard>
          <HeroCard>
            {second.imageUrl ? (
              <HeroImage src={second.imageUrl} alt={second.displayName} />
            ) : (
              <HeroFallback>{second.displayName.charAt(0).toUpperCase()}</HeroFallback>
            )}
            <HeroLabel>
              <strong>{second.displayName}</strong>
              <span>Rank #{second.search.rank}</span>
            </HeroLabel>
          </HeroCard>
        </HeroRow>
        <PairLabel>
          Search demand signals derived from Ahrefs keyword volumes (synthetic demo data) combined
          with Open Food Facts metadata.
        </PairLabel>
        <ButtonRow>
          <Link href="/compare" passHref legacyBehavior>
            <SecondaryLink>Pick a different comparison</SecondaryLink>
          </Link>
          <Link href={`/ingredients/${first.slug}`} passHref legacyBehavior>
            <SecondaryLink>View {first.displayName}</SecondaryLink>
          </Link>
          <Link href={`/ingredients/${second.slug}`} passHref legacyBehavior>
            <SecondaryLink>View {second.displayName}</SecondaryLink>
          </Link>
        </ButtonRow>
      </Header>
      <ComparisonGrid>
        <SearchTrendChart data={combinedSeries} />
        <StatCards>
          <StatCard>
            <span>{first.displayName}</span>
            <strong>{first.search.averageMonthlySearches.toLocaleString()} avg monthly searches</strong>
            <p>Rank #{first.search.rank}</p>
          </StatCard>
          <StatCard>
            <span>{second.displayName}</span>
            <strong>{second.search.averageMonthlySearches.toLocaleString()} avg monthly searches</strong>
            <p>Rank #{second.search.rank}</p>
          </StatCard>
          <StatCard>
            <span>Average volume delta</span>
            <strong>{averageDelta >= 0 ? '+' : ''}{averageDelta.toLocaleString()}</strong>
            <p>Positive values favour {averageDelta >= 0 ? first.displayName : second.displayName}</p>
          </StatCard>
          <StatCard>
            <span>12 month volume delta</span>
            <strong>{totalDelta >= 0 ? '+' : ''}{totalDelta.toLocaleString()}</strong>
            <p>Difference in summed searches across 12 months</p>
          </StatCard>
          <StatCard>
            <span>Rank differential</span>
            <strong>{rankDelta >= 0 ? '+' : ''}{rankDelta}</strong>
            <p>Lower rank = higher demand</p>
          </StatCard>
        </StatCards>
        <AttributesSection>
          <AttributeTitle>Taxonomy contrast</AttributeTitle>
          <AttributeList>
            <AttributeRow>
              <strong>Super ingredients</strong>
              <AttributeContent>
                <div>
                  <span>{first.displayName}</span>
                  <p>{first.superIngredients.join(', ') || '—'}</p>
                </div>
                <div>
                  <span>{second.displayName}</span>
                  <p>{second.superIngredients.join(', ') || '—'}</p>
                </div>
              </AttributeContent>
            </AttributeRow>
            <AttributeRow>
              <strong>Synonyms</strong>
              <AttributeContent>
                <div>
                  <span>{first.displayName}</span>
                  <p>{first.synonyms.join(', ') || '—'}</p>
                </div>
                <div>
                  <span>{second.displayName}</span>
                  <p>{second.synonyms.join(', ') || '—'}</p>
                </div>
              </AttributeContent>
            </AttributeRow>
            <AttributeRow>
              <strong>Carbon footprint (FoodGES)</strong>
              <AttributeContent>
                <div>
                  <span>{first.displayName}</span>
                  <p>
                    {first.attributes
                      .find((attribute) => attribute.label === 'Carbon footprint (kg CO₂e/kg)')?.values.join(', ') ||
                      '—'}
                  </p>
                </div>
                <div>
                  <span>{second.displayName}</span>
                  <p>
                    {second.attributes
                      .find((attribute) => attribute.label === 'Carbon footprint (kg CO₂e/kg)')?.values.join(', ') ||
                      '—'}
                  </p>
                </div>
              </AttributeContent>
            </AttributeRow>
          </AttributeList>
        </AttributesSection>
      </ComparisonGrid>
    </Layout>
  );
}
