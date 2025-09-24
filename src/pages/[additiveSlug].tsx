import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { styled } from "goober";
import { getAdditiveBySlug, getAdditives } from "@/lib/additives";
import { theme } from "@/lib/theme";
import type { Additive } from "@/lib/types";

type AdditivePageProps = {
  additive: Additive;
};

const Container = styled("article")`
  display: grid;
  gap: 32px;
`;

const BackLink = styled("a")`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: ${theme.colors.subtleText};
  transition: color 0.2s ease;

  &:hover,
  &:focus-visible {
    color: ${theme.colors.text};
  }
`;

const Panel = styled("section")`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.layout.radius};
  padding: 32px;
  background: ${theme.colors.surface};
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
  display: grid;
  gap: 24px;
`;

const HeadingGroup = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Code = styled("span")`
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${theme.colors.subtleText};
`;

const Title = styled("h1")`
  margin: 0;
  font-size: clamp(2.4rem, 2vw + 1.6rem, 3.2rem);
  color: ${theme.colors.text};
`;

const Description = styled("p")`
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: ${theme.colors.subtleText};
`;

const SectionTitle = styled("h2")`
  margin: 0;
  font-size: 1.3rem;
  color: ${theme.colors.text};
`;

const ChipList = styled("ul")`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Chip = styled("li")`
  border-radius: 999px;
  border: 1px solid ${theme.colors.border};
  padding: 8px 14px;
  background: rgba(0, 0, 0, 0.03);
  font-size: 0.9rem;
  color: ${theme.colors.text};
`;

const ClassLink = styled("a")`
  display: inline-block;
  border-radius: 999px;
  border: 1px solid ${theme.colors.border};
  padding: 8px 14px;
  background: rgba(0, 0, 0, 0.02);
  font-size: 0.9rem;
  color: ${theme.colors.text};
  transition: border-color 0.2s ease, background-color 0.2s ease;

  &:hover,
  &:focus-visible {
    border-color: ${theme.colors.accent};
    background: ${theme.colors.accent};
    color: ${theme.colors.surface};
  }
`;

const ActionRow = styled("div")`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
`;

const ExternalLink = styled("a")`
  border-radius: 999px;
  padding: 10px 20px;
  border: 1px solid ${theme.colors.text};
  background: ${theme.colors.text};
  color: ${theme.colors.surface};
  font-size: 0.9rem;
  transition: opacity 0.2s ease;

  &:hover,
  &:focus-visible {
    opacity: 0.85;
  }
`;

const SecondaryLink = styled("a")`
  font-size: 0.9rem;
  color: ${theme.colors.subtleText};

  &:hover,
  &:focus-visible {
    color: ${theme.colors.text};
  }
`;

const KeyFacts = styled("dl")`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px 24px;
  margin: 0;
`;

const FactLabel = styled("dt")`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${theme.colors.subtleText};
`;

const FactValue = styled("dd")`
  margin: 0;
  font-size: 1rem;
  color: ${theme.colors.text};
`;

export const getStaticPaths: GetStaticPaths = async () => {
  const additives = await getAdditives();
  const paths = additives.map((additive) => ({ params: { additiveSlug: additive.slug } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<AdditivePageProps> = async ({ params }) => {
  const slug = params?.additiveSlug as string;
  const additive = await getAdditiveBySlug(slug);

  if (!additive) {
    return { notFound: true };
  }

  return {
    props: {
      additive,
    },
  };
};

export default function AdditivePage({ additive }: AdditivePageProps) {
  const description =
    additive.description ??
    "An English description has not been published for this additive yet. Check back soon—we are working to enrich the taxonomy.";

  return (
    <>
      <Head>
        <title>{`${additive.name} (${additive.code}) | Food Additives Catalogue`}</title>
        <meta
          name="description"
          content={`Information about ${additive.name} (${additive.code}) from the Open Food Facts taxonomy.`}
        />
      </Head>
      <Container>
        <BackLink href="/">← Back to catalogue</BackLink>
        <Panel>
          <HeadingGroup>
            <Code>{additive.code}</Code>
            <Title>{additive.name}</Title>
          </HeadingGroup>
          <Description>{description}</Description>
          <KeyFacts>
            <FactLabel>Open Food Facts ID</FactLabel>
            <FactValue>{additive.id}</FactValue>
          </KeyFacts>
          <ActionRow>
            {additive.wikipediaUrl && (
              <ExternalLink href={additive.wikipediaUrl} target="_blank" rel="noopener noreferrer">
                View on English Wikipedia
              </ExternalLink>
            )}
            <SecondaryLink href="/class">Browse additive classes</SecondaryLink>
          </ActionRow>
        </Panel>

        {additive.synonyms.length > 0 && (
          <Panel as="section">
            <SectionTitle>Synonyms</SectionTitle>
            <ChipList>
              {additive.synonyms.map((synonym) => (
                <Chip key={synonym}>{synonym}</Chip>
              ))}
            </ChipList>
          </Panel>
        )}

        {additive.classes.length > 0 && (
          <Panel as="section">
            <SectionTitle>Technological classes</SectionTitle>
            <ChipList>
              {additive.classes.map((cls) => (
                <li key={cls.id}>
                  <ClassLink href={`/class/${cls.slug}`}>{cls.name}</ClassLink>
                </li>
              ))}
            </ChipList>
          </Panel>
        )}
      </Container>
    </>
  );
}
