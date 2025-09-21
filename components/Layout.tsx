import Link from 'next/link';
import styled from 'styled-components';
import type { ReactNode } from 'react';

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(13, 13, 18, 0.95);

  @media (max-width: 600px) {
    padding: 1.1rem 1.25rem 1rem;
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  margin: 0 0 0.5rem;

  @media (max-width: 600px) {
    font-size: 1.45rem;
  }
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 640px;
  font-size: 1rem;

  @media (max-width: 600px) {
    font-size: 0.9rem;
  }
`;

const NavLinks = styled.nav`
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  a {
    color: ${({ theme }) => theme.colors.accentSecondary};
    font-weight: 500;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const Main = styled.main`
  flex: 1;
  padding: 2rem;
  margin: 0 auto;
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};

  @media (max-width: 600px) {
    padding: 1.5rem 1.25rem 3rem;
  }
`;

export function Layout({ children }: { children: ReactNode }) {
  return (
    <Wrapper>
      <Header>
        <Title>Ingredient Explorer</Title>
        <Subtitle>
          Search-driven explorer that combines Ahrefs keyword demand with Open Food Facts taxonomy
          to surface ingredient insights and related metadata.
        </Subtitle>
        <NavLinks>
          <Link href="/">Dashboard</Link>
          <Link href="/compare">Compare ingredients</Link>
          <a
            href="https://static.openfoodfacts.org/data/taxonomies/ingredients.full.json"
            target="_blank"
            rel="noreferrer"
          >
            Ingredient taxonomy source
          </a>
        </NavLinks>
      </Header>
      <Main>{children}</Main>
    </Wrapper>
  );
}
