import Link from 'next/link';
import styled from 'styled-components';
import type { IngredientData } from '../lib/ingredients';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.modalBackdrop};
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 4rem 1.5rem;
  z-index: 20;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 20px;
  padding: 2rem;
  width: min(680px, 100%);
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 20px 45px rgba(5, 6, 15, 0.45);
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const Title = styled.h2`
  margin: 0;
`;

const CloseButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.25rem;
  cursor: pointer;
`;

const AttributeList = styled.div`
  margin: 2rem 0 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem 1.5rem;

  h3 {
    font-weight: 600;
    font-size: 0.95rem;
    margin: 0;
  }

  p {
    margin: 0.5rem 0 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
    line-height: 1.4;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2rem;
`;

const ActionButton = styled.a`
  padding: 0.65rem 1.25rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accent};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  font-weight: 600;
`;

interface IngredientModalProps {
  ingredient: IngredientData;
  onClose: () => void;
}

export function IngredientModal({ ingredient, onClose }: IngredientModalProps) {

  return (
    <Backdrop onClick={onClose} role="dialog" aria-modal>
      <Modal onClick={(event) => event.stopPropagation()}>
        <Header>
          <div>
            <Title>{ingredient.displayName}</Title>
            {ingredient.superIngredients.length > 0 && (
              <p>Super ingredient: {ingredient.superIngredients.join(', ')}</p>
            )}
            {ingredient.wikipediaUrl && (
              <p>
                <a href={ingredient.wikipediaUrl} target="_blank" rel="noreferrer">
                  View background on Wikipedia
                </a>
              </p>
            )}
          </div>
          <CloseButton type="button" aria-label="Close" onClick={onClose}>
            ×
          </CloseButton>
        </Header>
        <AttributeList>
          {ingredient.attributes.map((attribute) => (
            <div key={attribute.label}>
              <h3>{attribute.label}</h3>
              <p>{attribute.values.join(', ')}</p>
            </div>
          ))}
        </AttributeList>
        <ButtonRow>
          <Link href={{ pathname: '/ingredients/[slug]', query: { slug: ingredient.slug } }} passHref legacyBehavior>
            <ActionButton onClick={onClose}>
              View ingredient page
            </ActionButton>
          </Link>
          <Link href={{ pathname: '/compare', query: { base: ingredient.slug } }} passHref legacyBehavior>
            <ActionButton onClick={onClose}>Compare to…</ActionButton>
          </Link>
        </ButtonRow>
      </Modal>
    </Backdrop>
  );
}
