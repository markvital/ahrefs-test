import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import styled from 'styled-components';
import { Layout } from '../components/Layout';
import { getAdditiveBySlug, getAdditives, getAdditiveClassById } from '../lib/data';
import { Additive, AdditiveClass } from '../lib/types';

interface AdditivePageProps {
  additive: Additive;
  classDetails: AdditiveClass[];
}

const InfoSection = styled.section`
  max-width: 960px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing(4)};
`;

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.medium};
  padding: ${({ theme }) => theme.spacing(3)};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const PanelTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing(2)};
  font-size: 1.2rem;
  font-weight: 600;
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const Tag = styled.span`
  border-radius: ${({ theme }) => theme.radii.small};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing(0.75)} ${({ theme }) => theme.spacing(1.5)};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ExternalLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-decoration: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme }) => theme.spacing(0.5)};
  transition: border-color 0.2s ease;

  &:hover,
  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const SectionText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.7;
`;

export const getStaticPaths: GetStaticPaths = async () => {
  const additives = getAdditives();
  return {
    paths: additives.map((additive) => ({
      params: { additiveSlug: additive.slug },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<AdditivePageProps> = async ({ params }) => {
  const slug = params?.additiveSlug;
  if (typeof slug !== 'string') {
    return { notFound: true };
  }

  const additive = getAdditiveBySlug(slug);
  if (!additive) {
    return { notFound: true };
  }

  const classDetails = additive.classIds
    .map((id) => getAdditiveClassById(id))
    .filter((entry): entry is AdditiveClass => Boolean(entry));

  return {
    props: {
      additive,
      classDetails,
    },
  };
};

export default function AdditivePage({ additive, classDetails }: AdditivePageProps) {
  const intro = additive.description || 'No English description available.';

  return (
    <Layout title={additive.name} intro={intro}>
      <InfoSection>
        <Panel>
          <PanelTitle>At a glance</PanelTitle>
          <SectionText>
            {additive.code ? (
              <strong>Code: {additive.code}</strong>
            ) : (
              <strong>No E-number provided</strong>
            )}
          </SectionText>
          {additive.wikipediaUrl ? (
            <SectionText>
              <ExternalLink href={additive.wikipediaUrl} target="_blank" rel="noopener noreferrer">
                View on English Wikipedia
              </ExternalLink>
            </SectionText>
          ) : null}
        </Panel>
        <Panel>
          <PanelTitle>Synonyms</PanelTitle>
          {additive.synonyms.length ? (
            <List>
              {additive.synonyms.map((item) => (
                <li key={item}>
                  <Tag>{item}</Tag>
                </li>
              ))}
            </List>
          ) : (
            <SectionText>No synonyms available.</SectionText>
          )}
        </Panel>
        <Panel>
          <PanelTitle>Classes</PanelTitle>
          {classDetails.length ? (
            <List>
              {classDetails.map((item) => (
                <li key={item.id}>
                  <Link href={`/class/${item.slug}`} passHref legacyBehavior>
                    <Tag as="a">{item.name}</Tag>
                  </Link>
                </li>
              ))}
            </List>
          ) : (
            <SectionText>No additive class listed.</SectionText>
          )}
        </Panel>
      </InfoSection>
    </Layout>
  );
}
