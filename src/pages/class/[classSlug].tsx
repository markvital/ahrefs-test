import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { styled } from "goober";
import { AdditiveCard } from "@/components/AdditiveCard";
import { getAdditiveClassBySlug, getAdditiveClasses } from "@/lib/additives";
import { theme } from "@/lib/theme";
import type { Additive } from "@/lib/types";

type ClassPageProps = {
  additiveClass: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    additives: Additive[];
  };
};

const Header = styled("header")`
  display: grid;
  gap: 16px;
  margin-bottom: 32px;
`;

const BackLink = styled("a")`
  font-size: 0.9rem;
  color: ${theme.colors.subtleText};
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s ease;

  &:hover,
  &:focus-visible {
    color: ${theme.colors.text};
  }
`;

const Title = styled("h1")`
  margin: 0;
  font-size: clamp(2.2rem, 2vw + 1.4rem, 3rem);
  color: ${theme.colors.text};
`;

const Description = styled("p")`
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: ${theme.colors.subtleText};
`;

const Count = styled("span")`
  font-size: 0.9rem;
  color: ${theme.colors.subtleText};
`;

const Grid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 28px;
`;

export const getStaticPaths: GetStaticPaths = async () => {
  const classes = await getAdditiveClasses();
  const paths = classes.map((cls) => ({ params: { classSlug: cls.slug } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<ClassPageProps> = async ({ params }) => {
  const slug = params?.classSlug as string;
  const additiveClass = await getAdditiveClassBySlug(slug);

  if (!additiveClass) {
    return { notFound: true };
  }

  const payload = {
    id: additiveClass.id,
    name: additiveClass.name,
    slug: additiveClass.slug,
    description: additiveClass.description ?? null,
    additives: additiveClass.additives,
  };

  return {
    props: {
      additiveClass: payload,
    },
  };
};

export default function AdditiveClassPage({ additiveClass }: ClassPageProps) {
  return (
    <>
      <Head>
        <title>{`${additiveClass.name} | Food Additives Catalogue`}</title>
        <meta
          name="description"
          content={
            additiveClass.description ??
            `Browse additives classified as ${additiveClass.name} in the Open Food Facts taxonomy.`
          }
        />
      </Head>
      <div>
        <Header>
          <BackLink href="/class">← Back to all classes</BackLink>
          <Title>{additiveClass.name}</Title>
          <Count>{additiveClass.additives.length} additives</Count>
          <Description>
            {additiveClass.description ??
              "An English description has not been provided for this class yet."}
          </Description>
        </Header>
        <Grid>
          {additiveClass.additives.map((additive) => (
            <AdditiveCard key={additive.id} additive={additive} />
          ))}
        </Grid>
      </div>
    </>
  );
}
