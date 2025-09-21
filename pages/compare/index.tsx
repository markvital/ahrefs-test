import type { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Layout } from '../../components/Layout';
import { SearchTrendChart, toLineSeries } from '../../components/SearchTrendChart';
import type { IngredientData } from '../../lib/ingredients';
import { getIngredients } from '../../lib/ingredients';

const Container = styled.div`
  display: grid;
  gap: 2rem;
`;

const Form = styled.form`
  display: grid;
  gap: 1rem;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 1.5rem;
`;

const Label = styled.label`
  display: grid;
  gap: 0.5rem;
  font-weight: 600;
`;

const Select = styled.select`
  background: #0d0d12;
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 0.65rem 0.85rem;
  font-size: 1rem;
`;

const Summary = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const StatsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
`;

const Stat = styled.div`
  min-width: 180px;
  background: rgba(27, 27, 41, 0.65);
  border-radius: 14px;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};

  span {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 0.35rem;
  }

  strong {
    font-size: 1.1rem;
  }
`;

const CompareLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.4rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.accent};
  color: #0d0d12;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  width: fit-content;
`;

interface ComparePageProps {
  ingredients: IngredientData[];
}

export const getStaticProps: GetStaticProps<ComparePageProps> = async () => {
  const ingredients = await getIngredients();
  return {
    props: { ingredients },
  };
};

export default function CompareLanding({ ingredients }: ComparePageProps) {
  const router = useRouter();
  const [primary, setPrimary] = useState<string>('');
  const [secondary, setSecondary] = useState<string>('');

  useEffect(() => {
    if (ingredients.length === 0) return;
    const base = typeof router.query.base === 'string' ? router.query.base : ingredients[0].slug;
    const nextPrimary = ingredients.find((item) => item.slug === base)?.slug ?? ingredients[0].slug;
    setPrimary(nextPrimary);
    const fallbackSecondary = ingredients.find((item) => item.slug !== nextPrimary)?.slug ?? '';
    setSecondary(fallbackSecondary);
  }, [ingredients, router.query.base]);

  useEffect(() => {
    if (!ingredients.length) return;
    if (!secondary || secondary === primary) {
      const fallback = ingredients.find((item) => item.slug !== primary)?.slug ?? '';
      if (fallback && fallback !== secondary) {
        setSecondary(fallback);
      }
    }
  }, [primary, secondary, ingredients]);

  const primaryIngredient = useMemo(
    () => ingredients.find((ingredient) => ingredient.slug === primary),
    [ingredients, primary]
  );
  const secondaryIngredient = useMemo(
    () => ingredients.find((ingredient) => ingredient.slug === secondary),
    [ingredients, secondary]
  );

  const series = useMemo(() => {
    const data = [] as ReturnType<typeof toLineSeries>[];
    if (primaryIngredient) {
      data.push(toLineSeries(primaryIngredient.displayName, primaryIngredient.trend, '#8ecae6'));
    }
    if (secondaryIngredient) {
      data.push(toLineSeries(secondaryIngredient.displayName, secondaryIngredient.trend, '#ffb703'));
    }
    return data;
  }, [primaryIngredient, secondaryIngredient]);

  const compareHref =
    primaryIngredient && secondaryIngredient
      ? `/compare/${primaryIngredient.slug}-vs-${secondaryIngredient.slug}`
      : '#';

  return (
    <Layout>
      <Head>
        <title>Compare ingredient demand</title>
      </Head>
      <Container>
        <Form>
          <Label>
            Base ingredient
            <Select value={primary} onChange={(event) => setPrimary(event.target.value)}>
              {ingredients.map((ingredient) => (
                <option key={ingredient.slug} value={ingredient.slug}>
                  #{ingredient.search.rank} · {ingredient.displayName}
                </option>
              ))}
            </Select>
          </Label>
          <Label>
            Compare against
            <Select value={secondary} onChange={(event) => setSecondary(event.target.value)}>
              {ingredients
                .filter((ingredient) => ingredient.slug !== primary)
                .map((ingredient) => (
                  <option key={ingredient.slug} value={ingredient.slug}>
                    #{ingredient.search.rank} · {ingredient.displayName}
                  </option>
                ))}
            </Select>
          </Label>
          {primaryIngredient && secondaryIngredient && (
            <Link href={compareHref} passHref legacyBehavior>
              <CompareLink>
                View detailed comparison
              </CompareLink>
            </Link>
          )}
        </Form>
        {primaryIngredient && secondaryIngredient && (
          <Summary>
            <StatsRow>
              <Stat>
                <span>{primaryIngredient.displayName}</span>
                <strong>{primaryIngredient.search.averageMonthlySearches.toLocaleString()} avg searches</strong>
              </Stat>
              <Stat>
                <span>{secondaryIngredient.displayName}</span>
                <strong>{secondaryIngredient.search.averageMonthlySearches.toLocaleString()} avg searches</strong>
              </Stat>
              <Stat>
                <span>Absolute difference</span>
                <strong>
                  {Math.abs(
                    primaryIngredient.search.averageMonthlySearches -
                      secondaryIngredient.search.averageMonthlySearches
                  ).toLocaleString()}{' '}
                  searches
                </strong>
              </Stat>
            </StatsRow>
            <SearchTrendChart data={series} />
          </Summary>
        )}
      </Container>
    </Layout>
  );
}
