import { GetStaticProps } from "next";
import { styled } from "goober";
import { getAdditiveClasses } from "@/lib/additives";
import { theme } from "@/lib/theme";

type ClassIndexProps = {
  classes: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    additiveCount: number;
  }>;
};

const Header = styled("header")`
  display: grid;
  gap: 20px;
  margin-bottom: 32px;
`;

const Title = styled("h1")`
  margin: 0;
  font-size: clamp(2.2rem, 2vw + 1.5rem, 3rem);
  color: ${theme.colors.text};
`;

const Intro = styled("p")`
  margin: 0;
  font-size: 1.05rem;
  color: ${theme.colors.subtleText};
  max-width: 680px;
  line-height: 1.6;
`;

const Grid = styled("div")`
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const Card = styled("a")`
  display: grid;
  gap: 14px;
  border-radius: ${theme.layout.radius};
  padding: 24px;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.surface};
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.06);
  color: ${theme.colors.text};
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-4px);
    border-color: ${theme.colors.accent};
    box-shadow: 0 20px 44px rgba(0, 0, 0, 0.12);
  }
`;

const CardTitle = styled("h2")`
  margin: 0;
  font-size: 1.3rem;
  color: ${theme.colors.text};
`;

const Description = styled("p")`
  margin: 0;
  font-size: 0.95rem;
  color: ${theme.colors.subtleText};
  line-height: 1.6;
`;

const Count = styled("span")`
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${theme.colors.subtleText};
`;

export const getStaticProps: GetStaticProps<ClassIndexProps> = async () => {
  const classes = await getAdditiveClasses();
  const summaries = classes.map((cls) => ({
    id: cls.id,
    name: cls.name,
    slug: cls.slug,
    description: cls.description ?? null,
    additiveCount: cls.additives.length,
  }));

  return {
    props: {
      classes: summaries,
    },
  };
};

export default function ClassIndexPage({ classes }: ClassIndexProps) {
  return (
    <div>
      <Header>
        <Title>Browse additive classes</Title>
        <Intro>
          Technological classes describe why an additive is used. Select a class to
          see all relevant additives and learn about their typical usage.
        </Intro>
      </Header>
      <Grid>
        {classes.map((cls) => (
          <Card key={cls.id} href={`/class/${cls.slug}`}>
            <CardTitle>{cls.name}</CardTitle>
            <Description>{cls.description ?? "No English description available yet."}</Description>
            <Count>{cls.additiveCount} additives</Count>
          </Card>
        ))}
      </Grid>
    </div>
  );
}
