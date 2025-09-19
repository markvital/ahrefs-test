import { GetStaticProps } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import styled from 'styled-components';
import { Layout } from '../components/Layout';
import { DrugCard, DrugSummary } from '../components/DrugCard';
import { Dataset, DrugEnriched } from '../lib/types';

const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
`;

const DatasetNote = styled.p`
  margin-top: 2.5rem;
  font-size: 0.9rem;
  color: #a5b4fc;
  text-align: center;
`;

type HomeProps = {
  drugs: DrugSummary[];
  datasetNote?: string;
};

export default function Home({ drugs, datasetNote }: HomeProps) {
  return (
    <Layout>
      <Grid aria-label="Drug leaderboard">
        {drugs.map((drug) => (
          <DrugCard key={drug.slug} drug={drug} />
        ))}
      </Grid>
      {datasetNote ? <DatasetNote>{datasetNote}</DatasetNote> : null}
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const datasetPath = path.join(process.cwd(), 'data', 'build', 'drugs_enriched.json');
  const raw = await fs.readFile(datasetPath, 'utf8');
  const dataset = JSON.parse(raw) as Dataset;

  const drugs: DrugSummary[] = dataset.drugs.map((drug: DrugEnriched) => ({
    slug: drug.slug,
    rank: drug.rank,
    genericName: drug.genericName,
    brandNames: drug.brandNames,
    alternateNames: drug.alternateNames,
    molecularFormula: drug.molecularFormula,
    searchVolume: drug.searchVolume
  }));

  return {
    props: {
      drugs,
      datasetNote: dataset.note
    }
  };
};
