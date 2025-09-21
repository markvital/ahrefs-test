import Link from 'next/link';
import styled from 'styled-components';
import type { ReactNode } from 'react';

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(13, 13, 18, 0.92);
  backdrop-filter: blur(8px);
`;

const HeaderInner = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 2rem;

  @media (max-width: 900px) {
    gap: 1rem;
  }

  @media (max-width: 600px) {
    padding: 0.65rem 1.1rem;
    gap: 0.65rem;
  }
`;

const HeadingGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;

  @media (max-width: 600px) {
    gap: 0.15rem;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.75rem;
  letter-spacing: -0.01em;
  font-weight: ${({ theme }) => theme.typography.headingWeight};
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 900px) {
    font-size: 1.5rem;
  }

  @media (max-width: 600px) {
    font-size: 1.12rem;
    white-space: nowrap;
  }
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 640px;
  font-size: 1rem;
  line-height: 1.4;

  @media (max-width: 900px) {
    font-size: 0.92rem;
    max-width: 520px;
  }

  @media (max-width: 600px) {
    display: none;
  }
`;

const NavLinks = styled.nav`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.95rem;

  a {
    color: ${({ theme }) => theme.colors.accentSecondary};
    font-weight: 600;
    white-space: nowrap;
  }

  @media (max-width: 900px) {
    font-size: 0.85rem;
    gap: 0.85rem;
  }

  @media (max-width: 600px) {
    font-size: 0.72rem;
    gap: 0.6rem;
    overflow-x: auto;
    padding-bottom: 0.2rem;
    margin-left: 0;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }
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
        <HeaderInner>
          <HeadingGroup>
            <Title>Ingredient Explorer</Title>
            <Subtitle>
              Search-driven explorer that combines Ahrefs keyword demand with Open Food Facts taxonomy
              to surface ingredient insights and related metadata.
            </Subtitle>
          </HeadingGroup>
          <NavLinks>
            <Link href="/">Dashboard</Link>
            <Link href="/compare">Compare</Link>
            <a href="https://static.openfoodfacts.org/data/taxonomies/ingredients.full.json" target="_blank" rel="noreferrer">
              Taxonomy source
            </a>
          </NavLinks>
        </HeaderInner>
      </Header>
      <Main>{children}</Main>
    </Wrapper>
  );
}
