import styled from 'styled-components';

export const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  width: 100%;
`;
