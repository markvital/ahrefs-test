import Link from 'next/link';
import styled from 'styled-components';
import { Additive, AdditiveClass } from '../lib/types';

interface AdditiveCardProps {
  additive: Additive;
  classMap: Record<string, AdditiveClass>;
}

const CardLink = styled(Link)`
  display: block;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.medium};
  padding: ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.card};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  color: inherit;

  &:hover,
  &:focus-visible {
    transform: translateY(-4px);
    box-shadow: 0 24px 40px rgba(0, 0, 0, 0.14);
  }
`;

const Title = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing(1)};
  font-size: 1.4rem;
  font-weight: 600;
`;

const Code = styled.span`
  display: inline-block;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const Description = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
  min-height: 3.6em;
`;

const SynonymList = styled.div`
  margin-top: ${({ theme }) => theme.spacing(2)};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const SynonymTag = styled.span`
  border-radius: ${({ theme }) => theme.radii.small};
  padding: ${({ theme }) => theme.spacing(0.5)} ${({ theme }) => theme.spacing(1.5)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: rgba(255, 255, 255, 0.6);
`;

const ClassList = styled.div`
  margin-top: ${({ theme }) => theme.spacing(3)};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const ClassLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.small};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing(0.5)} ${({ theme }) => theme.spacing(1.5)};
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.surface};
`;

export function AdditiveCard({ additive, classMap }: AdditiveCardProps) {
  const classRefs = additive.classIds
    .map((id) => classMap[id])
    .filter((entry): entry is AdditiveClass => Boolean(entry));

  return (
    <CardLink href={`/${additive.slug}`}>
      <Title>{additive.name}</Title>
      {additive.code ? <Code>{additive.code}</Code> : null}
      {additive.description ? (
        <Description>{additive.description}</Description>
      ) : (
        <Description>No English description available.</Description>
      )}
      {additive.synonyms.length ? (
        <SynonymList>
          {additive.synonyms.map((synonym) => (
            <SynonymTag key={synonym}>{synonym}</SynonymTag>
          ))}
        </SynonymList>
      ) : null}
      {classRefs.length ? (
        <ClassList>
          {classRefs.map((classItem) => (
            <ClassLink key={classItem.id} href={`/class/${classItem.slug}`}>
              {classItem.name}
            </ClassLink>
          ))}
        </ClassList>
      ) : null}
    </CardLink>
  );
}
