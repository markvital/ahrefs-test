import { ReactNode } from 'react';
import Head from 'next/head';
import styled from 'styled-components';

const Shell = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
`;

const Header = styled.header`
  margin-bottom: 2.5rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: clamp(2rem, 3vw + 1rem, 3.5rem);
  font-weight: 700;
  margin: 0;
`;

const Subtitle = styled.p`
  margin: 0.75rem 0 0;
  font-size: 1.1rem;
  color: #cbd5f5;
`;

type LayoutProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  headerContent?: ReactNode;
};

export function Layout({ children, title, description, headerContent }: LayoutProps) {
  const pageTitle = title ?? 'Psychiatric Drug Search Demand';
  const metaDescription =
    description ??
    'FDA-approved psychiatric medicines ranked by Ahrefs search interest with safety, utilization, and research context.';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Shell>
        <Header>
          {headerContent ?? (
            <>
              <Title>Psychiatric Drug Interest Leaderboard</Title>
              <Subtitle>
                FDA-approved psychiatric therapies ranked by Ahrefs search demand with safety, utilization, and evidence context.
              </Subtitle>
            </>
          )}
        </Header>
        <main>{children}</main>
      </Shell>
    </>
  );
}
