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
`;

const Title = styled.h1`
  font-size: 1.75rem;
  margin: 0 0 0.5rem;
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 640px;
`;

const NavLinks = styled.nav`
  margin-top: 1rem;
  display: flex;
  gap: 1rem;

  a {
    color: ${({ theme }) => theme.colors.accentSecondary};
    font-weight: 500;
  }
`;

const Main = styled.main`
  flex: 1;
  padding: 2rem;
  margin: 0 auto;
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
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
