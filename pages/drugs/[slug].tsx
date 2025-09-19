import { GetStaticPaths, GetStaticProps } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import styled from 'styled-components';
import { Layout } from '../../components/Layout';
import { DrugTrendChart } from '../../components/DrugTrendChart';
import { numberWithSeparators } from '../../lib/numberWithSeparators';
import { Dataset, DrugEnriched } from '../../lib/types';

const HeaderTitle = styled.h1`
  font-size: clamp(2.4rem, 3vw + 1.2rem, 3.75rem);
  margin: 0;
`;

const HeaderMeta = styled.p`
  margin: 0.75rem 0 0;
  color: #cbd5f5;
  font-size: 1rem;
  line-height: 1.5;
`;

const ContentStack = styled.div`
  display: grid;
  gap: 2rem;
`;

const Section = styled.section`
  background: rgba(30, 41, 59, 0.65);
  border: 1px solid rgba(148, 163, 255, 0.2);
  border-radius: 18px;
  padding: 1.75rem;
`;

const SectionTitle = styled.h2`
  margin: 0 0 1.25rem;
  font-size: 1.4rem;
`;

const List = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  color: #e2e8f0;
  line-height: 1.5;
`;

const ApprovalsList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  color: #e2e8f0;
  line-height: 1.5;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: #e2e8f0;

  th,
  td {
    padding: 0.65rem 0.75rem;
    text-align: left;
  }

  thead {
    background: rgba(51, 65, 85, 0.6);
  }

  tbody tr:nth-child(even) {
    background: rgba(30, 64, 175, 0.2);
  }
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Badge = styled.span`
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.25);
  border: 1px solid rgba(148, 163, 255, 0.3);
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
  color: #cbd5f5;
`;

const Footnote = styled.p`
  margin: 1.5rem 0 0;
  font-size: 0.85rem;
  color: #94a3b8;
`;

type DrugPageProps = {
  drug: DrugEnriched;
  datasetNote?: string;
};

export default function DrugPage({ drug, datasetNote }: DrugPageProps) {
  const headerContent = (
    <div>
      <HeaderTitle>{drug.genericName}</HeaderTitle>
      <HeaderMeta>
        Brand names: {drug.brandNames.length > 0 ? drug.brandNames.join(', ') : '—'}
        <br />
        Alternate names: {drug.alternateNames.length > 0 ? drug.alternateNames.join(', ') : '—'}
        <br />
        Active ingredient(s): {drug.activeIngredients.join(', ')}
        <br />
        Molecular formula: {drug.molecularFormula ?? 'Unavailable'}
        <br />
        RxCUI: {drug.rxCui ?? 'Unavailable'} | ATC: {drug.atcClasses.join(', ')}
      </HeaderMeta>
      <BadgeRow aria-label="Key metadata">
        <Badge>Ahrefs volume: {numberWithSeparators(drug.searchVolume)}</Badge>
        <Badge>{drug.metadata.llmGenerated ? 'LLM-generated seed data' : 'Dataset preview'}</Badge>
      </BadgeRow>
    </div>
  );

  return (
    <Layout
      title={`${drug.genericName} search & safety profile`}
      description={`Search interest, utilization, and safety insights for ${drug.genericName} (${drug.brandNames.join(', ') || 'generic'}).`}
      headerContent={headerContent}
    >
      <ContentStack>
        <Section aria-labelledby="trend-heading">
          <SectionTitle id="trend-heading">Search trend (Ahrefs)</SectionTitle>
          <DrugTrendChart points={drug.searchTrend} />
        </Section>

        <Section aria-labelledby="medicare-heading">
          <SectionTitle id="medicare-heading">Medicare Part D utilization</SectionTitle>
          <Table>
            <thead>
              <tr>
                <th scope="col">Year</th>
                <th scope="col">Claims</th>
                <th scope="col">Beneficiaries</th>
              </tr>
            </thead>
            <tbody>
              {drug.medicarePartD.map((row) => (
                <tr key={row.year}>
                  <td>{row.year}</td>
                  <td>{numberWithSeparators(row.claims)}</td>
                  <td>{numberWithSeparators(row.beneficiaries)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>

        <Section aria-labelledby="fda-heading">
          <SectionTitle id="fda-heading">FDA safety and approvals</SectionTitle>
          {drug.fda.boxedWarning ? <p><strong>Boxed warning:</strong> {drug.fda.boxedWarning}</p> : <p>No boxed warning listed.</p>}
          {drug.fda.warnings.length > 0 ? (
            <div>
              <strong>Warnings & cautions:</strong>
              <List>
                {drug.fda.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </List>
            </div>
          ) : null}
          {drug.fda.approvals.length > 0 ? (
            <div>
              <strong>Approval timeline:</strong>
              <ApprovalsList>
                {drug.fda.approvals.map((approval) => (
                  <li key={approval.applicationNumber}>
                    {approval.applicationNumber} — {approval.status} ({approval.approvalDate}){approval.notes ? `: ${approval.notes}` : ''}
                  </li>
                ))}
              </ApprovalsList>
            </div>
          ) : null}
        </Section>

        <Section aria-labelledby="faers-heading">
          <SectionTitle id="faers-heading">FAERS safety signals</SectionTitle>
          <p>Total reports (5y): {numberWithSeparators(drug.faers.totalReports5y)}</p>
          {drug.faers.topReactions.length > 0 ? (
            <List>
              {drug.faers.topReactions.map((reaction) => (
                <li key={reaction.name}>
                  {reaction.name}: {numberWithSeparators(reaction.count)} reports
                </li>
              ))}
            </List>
          ) : (
            <p>No adverse event summary available.</p>
          )}
        </Section>

        <Section aria-labelledby="clinical-heading">
          <SectionTitle id="clinical-heading">Clinical trials landscape</SectionTitle>
          <p>
            Total studies: {numberWithSeparators(drug.clinicalTrials.total)} | Last 5 years: {numberWithSeparators(drug.clinicalTrials.last5y)}
          </p>
          {drug.clinicalTrials.byStatus.length > 0 ? (
            <List>
              {drug.clinicalTrials.byStatus.map((entry) => (
                <li key={entry.status}>
                  {entry.status}: {numberWithSeparators(entry.count)}
                </li>
              ))}
            </List>
          ) : null}
        </Section>

        <Footnote>
          Data sources: Ahrefs (paid), RxClass/RxNorm, openFDA (label, drugsfda, FAERS), ClinicalTrials.gov, CMS (Part D), PubChem.
          Cached locally.
          {datasetNote ? ` ${datasetNote}` : ''}
        </Footnote>
      </ContentStack>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const datasetPath = path.join(process.cwd(), 'data', 'build', 'drugs_enriched.json');
  const raw = await fs.readFile(datasetPath, 'utf8');
  const dataset = JSON.parse(raw) as Dataset;

  const paths = dataset.drugs.map((drug) => ({
    params: { slug: drug.slug }
  }));

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps<DrugPageProps> = async ({ params }) => {
  const slug = params?.slug as string;
  const datasetPath = path.join(process.cwd(), 'data', 'build', 'drugs_enriched.json');
  const raw = await fs.readFile(datasetPath, 'utf8');
  const dataset = JSON.parse(raw) as Dataset;

  const drug = dataset.drugs.find((entry) => entry.slug === slug);

  if (!drug) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      drug,
      datasetNote: dataset.note
    }
  };
};
