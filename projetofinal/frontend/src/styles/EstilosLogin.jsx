import styled from 'styled-components';

export const ContainerLogin = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: ##F8F6F2;
  font-family: Arial, sans-serif;
`;

export const CardForm = styled.div`
  background: ##F8F6F2;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Titulo = styled.h2`
  text-align: center;
  color: #1e293b;
  margin: 0;
`;

export const GroupInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 14px;
    color: #475569;
    font-weight: bold;
  }

  input, select {
    padding: 10px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 16px;
    outline: none;
    &:focus {
      border-color: #10b981;
    }
  }
`;

export const BotaoForm = styled.button`
  background-color: #10b981;
  color: white;
  border: none;
  padding: 12px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: #059669;
  }
`;

export const AlternarModo = styled.p`
  text-align: center;
  font-size: 14px;
  color: #64748b;
  margin: 0;

  span {
    color: #10b981;
    cursor: pointer;
    font-weight: bold;
    &:hover {
      text-decoration: underline;
    }
  }
`;