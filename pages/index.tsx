import { GetStaticProps } from 'next';
import { AdditiveCard } from '../components/AdditiveCard';
import { Grid } from '../components/Grid';
import { Layout } from '../components/Layout';
import { getAdditiveClasses, getAdditives } from '../lib/data';
import { Additive, AdditiveClass } from '../lib/types';

interface HomePageProps {
  additives: Additive[];
  classMap: Record<string, AdditiveClass>;
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const additives = getAdditives();
  const classes = getAdditiveClasses();
  const classMap = Object.fromEntries(classes.map((item) => [item.id, item]));

  return {
    props: {
      additives,
      classMap,
    },
  };
};

export default function HomePage({ additives, classMap }: HomePageProps) {
  return (
    <Layout
      title="Food Additives Catalogue"
      intro="Explore the landscape of food additives with concise descriptions, synonyms, and classifications sourced from the Open Food Facts database."
    >
      <Grid>
        {additives.map((additive) => (
          <AdditiveCard key={additive.id} additive={additive} classMap={classMap} />
        ))}
      </Grid>
    </Layout>
  );
}
