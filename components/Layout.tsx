import Link from 'next/link';
import { ReactNode } from 'react';
import styled from 'styled-components';

interface LayoutProps {
  title: string;
  intro?: string;
  children: ReactNode;
}

const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 600;
  letter-spacing: -0.02em;
`;

const Intro = styled.p`
  margin: ${({ theme }) => theme.spacing(2)} 0 0;
  max-width: 720px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
`;

const Content = styled.main`
  flex: 1;
  padding: 0 ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(6)};
`;

const HomeLink = styled(Link)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const NavIndicator = styled.span`
  display: inline-block;
  width: 32px;
  height: 1px;
  background: ${({ theme }) => theme.colors.textSecondary};
`;

export function Layout({ title, intro, children }: LayoutProps) {
  return (
    <Shell>
      <Header>
        <HomeLink href="/">
          <NavIndicator />
          Catalogue
        </HomeLink>
        <Title>{title}</Title>
        {intro ? <Intro>{intro}</Intro> : null}
      </Header>
      <Content>{children}</Content>
    </Shell>
  );
}
