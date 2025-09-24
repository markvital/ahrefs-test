import { styled } from "goober";
import { theme } from "@/lib/theme";
import type { Additive } from "@/lib/types";

const Card = styled("article")`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.layout.radius};
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 240px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover,
  &:focus-within {
    transform: translateY(-4px);
    border-color: ${theme.colors.accent};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const Code = styled("span")`
  font-size: 0.85rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${theme.colors.subtleText};
`;

const Title = styled("a")`
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.3;
  color: ${theme.colors.text};
`;

const Description = styled("p")`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${theme.colors.subtleText};
  flex: 1;
`;

const Stack = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ChipList = styled("ul")`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Chip = styled("li")`
  border: 1px solid ${theme.colors.border};
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.8rem;
  color: ${theme.colors.subtleText};
  background: rgba(0, 0, 0, 0.02);
`;

const ClassLink = styled("a")`
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.8rem;
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.text};
  transition: border-color 0.2s ease, background-color 0.2s ease;

  &:hover,
  &:focus-visible {
    background: ${theme.colors.accent};
    color: ${theme.colors.surface};
    border-color: ${theme.colors.accent};
  }
`;

const SectionTitle = styled("h3")`
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${theme.colors.subtleText};
`;

export const AdditiveCard = ({ additive }: { additive: Additive }) => {
  const descriptionSnippet =
    additive.description && additive.description.length > 220
      ? `${additive.description.slice(0, 220)}…`
      : additive.description;

  const synonymDisplay = additive.synonyms.slice(0, 3);

  return (
    <Card>
      <Stack>
        <Code>{additive.code}</Code>
        <Title href={`/${additive.slug}`}>{additive.name}</Title>
        {descriptionSnippet ? (
          <Description>{descriptionSnippet}</Description>
        ) : (
          <Description>
            No English description is available for this additive yet. Explore the
            dedicated page for more context.
          </Description>
        )}
      </Stack>
      {synonymDisplay.length > 0 && (
        <Stack>
          <SectionTitle>Synonyms</SectionTitle>
          <ChipList>
            {synonymDisplay.map((synonym) => (
              <Chip key={synonym}>{synonym}</Chip>
            ))}
          </ChipList>
        </Stack>
      )}
      {additive.classes.length > 0 && (
        <Stack>
          <SectionTitle>Classes</SectionTitle>
          <ChipList>
            {additive.classes.map((cls) => (
              <li key={cls.id}>
                <ClassLink href={`/class/${cls.slug}`}>{cls.name}</ClassLink>
              </li>
            ))}
          </ChipList>
        </Stack>
      )}
    </Card>
  );
};
