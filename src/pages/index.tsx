import { GetStaticProps } from "next";
import { styled } from "goober";
import { AdditiveCard } from "@/components/AdditiveCard";
import { getAdditives, getAdditiveClasses } from "@/lib/additives";
import { theme } from "@/lib/theme";
import type { Additive } from "@/lib/types";

type ClassSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  additiveCount: number;
};

type HomePageProps = {
  additives: Additive[];
  classes: ClassSummary[];
};

const Hero = styled("section")`
  display: grid;
  gap: 24px;
  padding-bottom: 32px;
`;

const Title = styled("h1")`
  font-size: clamp(2rem, 3vw + 1rem, 3.2rem);
  margin: 0;
  color: ${theme.colors.text};
`;

const Intro = styled("p")`
  margin: 0;
  font-size: 1.1rem;
  max-width: 700px;
  color: ${theme.colors.subtleText};
  line-height: 1.6;
`;

const Grid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 28px;
`;

const ClassPanel = styled("section")`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.layout.radius};
  background: ${theme.colors.surface};
  padding: 28px;
  display: grid;
  gap: 20px;
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.05);
`;

const ClassList = styled("ul")`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const ClassItem = styled("li")`
  display: flex;
`;

const ClassLink = styled("a")`
  border-radius: 16px;
  border: 1px solid ${theme.colors.border};
  padding: 12px 18px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  color: ${theme.colors.text};
  background: rgba(0, 0, 0, 0.015);
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;

  span {
    font-size: 0.8rem;
    color: ${theme.colors.subtleText};
  }

  &:hover,
  &:focus-visible {
    border-color: ${theme.colors.accent};
    background: ${theme.colors.accent};
    color: ${theme.colors.surface};

    span {
      color: ${theme.colors.surface};
    }

    transform: translateY(-2px);
  }
`;

const SectionHeading = styled("h2")`
  font-size: 1.5rem;
  margin: 0;
  color: ${theme.colors.text};
`;

const SectionSubheading = styled("p")`
  margin: 0;
  color: ${theme.colors.subtleText};
`;

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const [additives, classes] = await Promise.all([
    getAdditives(),
    getAdditiveClasses(),
  ]);

  const classSummaries: ClassSummary[] = classes.map((cls) => ({
    id: cls.id,
    name: cls.name,
    slug: cls.slug,
    description: cls.description ?? null,
    additiveCount: cls.additives.length,
  }));

  return {
    props: {
      additives,
      classes: classSummaries,
    },
  };
};

export default function HomePage({ additives, classes }: HomePageProps) {
  return (
    <div>
      <Hero>
        <Title>Explore the food additives landscape.</Title>
        <Intro>
          Searchable, comparable ingredient data sourced entirely from the
          Open&nbsp;Food&nbsp;Facts taxonomy. Start with the full catalogue or
          jump straight into an additive class that interests you.
        </Intro>
        <ClassPanel>
          <SectionHeading>Browse by class</SectionHeading>
          <SectionSubheading>
            Each class groups additives by their technological role.
          </SectionSubheading>
          <ClassList>
            {classes.map((cls) => (
              <ClassItem key={cls.id}>
                <ClassLink href={`/class/${cls.slug}`}>
                  {cls.name}
                  <span>{cls.additiveCount} additives</span>
                </ClassLink>
              </ClassItem>
            ))}
          </ClassList>
        </ClassPanel>
      </Hero>
      <SectionHeading>All additives</SectionHeading>
      <SectionSubheading>
        A curated list of every additive with an English label in Open Food Facts.
      </SectionSubheading>
      <Grid>
        {additives.map((additive) => (
          <AdditiveCard key={additive.id} additive={additive} />
        ))}
      </Grid>
    </div>
  );
}
