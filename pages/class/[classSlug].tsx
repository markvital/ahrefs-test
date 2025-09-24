import { GetStaticPaths, GetStaticProps } from 'next';
import { AdditiveCard } from '../../components/AdditiveCard';
import { Grid } from '../../components/Grid';
import { Layout } from '../../components/Layout';
import {
  getAdditiveClassBySlug,
  getAdditiveClasses,
  getAdditivesByClassId,
} from '../../lib/data';
import { Additive, AdditiveClass } from '../../lib/types';

interface ClassPageProps {
  classInfo: AdditiveClass;
  additives: Additive[];
  classMap: Record<string, AdditiveClass>;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const classes = getAdditiveClasses();
  return {
    paths: classes.map((item) => ({
      params: { classSlug: item.slug },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<ClassPageProps> = async ({ params }) => {
  const slug = params?.classSlug;
  if (typeof slug !== 'string') {
    return { notFound: true };
  }

  const classInfo = getAdditiveClassBySlug(slug);
  if (!classInfo) {
    return { notFound: true };
  }

  const additives = getAdditivesByClassId(classInfo.id);
  const classes = getAdditiveClasses();
  const classMap = Object.fromEntries(classes.map((item) => [item.id, item]));

  return {
    props: {
      classInfo,
      additives,
      classMap,
    },
  };
};

export default function ClassPage({ classInfo, additives, classMap }: ClassPageProps) {
  const intro = classInfo.description || 'No English description available for this class.';

  return (
    <Layout title={classInfo.name} intro={intro}>
      <Grid>
        {additives.map((additive) => (
          <AdditiveCard key={additive.id} additive={additive} classMap={classMap} />
        ))}
      </Grid>
    </Layout>
  );
}
