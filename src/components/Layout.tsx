import { ReactNode } from "react";
import { styled } from "goober";
import { theme } from "@/lib/theme";

const AppFrame = styled("div")`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled("header")`
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(8px);
`;

const HeaderInner = styled("div")`
  margin: 0 auto;
  max-width: ${theme.layout.maxWidth};
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
`;

const SiteTitle = styled("a")`
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.02em;
`;

const Nav = styled("nav")`
  display: flex;
  gap: 16px;
`;

const NavLink = styled("a")`
  font-size: 0.95rem;
  color: ${theme.colors.subtleText};
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;

  &:hover,
  &:focus-visible {
    color: ${theme.colors.text};
    border-color: ${theme.colors.text};
  }
`;

const Main = styled("main")`
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 40px 24px 80px;
`;

const Content = styled("div")`
  width: 100%;
  max-width: ${theme.layout.maxWidth};
`;

const Footer = styled("footer")`
  border-top: 1px solid ${theme.colors.border};
  background: ${theme.colors.surface};
  color: ${theme.colors.subtleText};
`;

const FooterInner = styled("div")`
  margin: 0 auto;
  max-width: ${theme.layout.maxWidth};
  padding: 18px 24px 24px;
  font-size: 0.85rem;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const Layout = ({ children }: { children: ReactNode }) => (
  <AppFrame>
    <Header>
      <HeaderInner>
        <SiteTitle href="/">Food Additives Catalogue</SiteTitle>
        <Nav>
          <NavLink href="/">Catalogue</NavLink>
          <NavLink href="/class">Classes</NavLink>
        </Nav>
      </HeaderInner>
    </Header>
    <Main>
      <Content>{children}</Content>
    </Main>
    <Footer>
      <FooterInner>
        <span>Data sourced from Open Food Facts taxonomies.</span>
        <span>Made for ingredient transparency.</span>
      </FooterInner>
    </Footer>
  </AppFrame>
);
