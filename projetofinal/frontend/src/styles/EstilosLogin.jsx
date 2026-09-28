import styled from 'styled-components';

export const ContainerLogin = styled.div`
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  height: 100vh !important;
  width: 100vw !important;
  background-color: #f3f4f6 !important; /* Fundo cinza claro idêntico ao mobile */
  font-family: Arial, sans-serif !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
`;

export const CardForm = styled.div`
  background: #ffffff !important; /* Força o fundo a ser BRANCO puro */
  padding: 30px !important; 
  border-radius: 12px !important; 
  
  /* Sombra idêntica e suave do mobile */
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.05) !important;
  
  width: 100% !important;
  max-width: 380px !important;
  display: flex !important;
  flex-direction: column !important;
  box-sizing: border-box !important;
`;

export const Titulo = styled.h2`
  text-align: center !important;
  color: #000000 !important; /* Força o título em PRETO puro */
  font-size: 22px !important;
  font-weight: bold !important;
  margin: 0 0 25px 0 !important;
`;

export const GroupInput = styled.div`
  display: flex !important;
  flex-direction: column !important;
  gap: 6px !important;
  margin-bottom: 18px !important;

  label {
    font-size: 14px !important;
    color: #444444 !important; /* Texto cinza escuro do mobile */
    font-weight: 500 !important;
  }

  input, select {
    padding: 12px !important;
    border: 1px solid #d1d5db !important; /* Força a borda cinza padrão (mata o contorno verde inicial) */
    border-radius: 8px !important; 
    font-size: 15px !important;
    color: #121212 !important;
    background-color: #ffffff !important;
    outline: none !important;
    box-sizing: border-box !important;
    width: 100% !important;
    transition: border-color 0.15s ease-in-out !important;

    &::placeholder {
      color: #999999 !important;
    }

    /* O verde SÓ aparece quando o usuário clica para digitar */
    &:focus {
      border-color: #00b874 !important; 
    }
  }

  select {
    height: 46px !important;
    cursor: pointer !important;
    appearance: none !important; /* Remove a setinha nativa do navegador */
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
    
    /* Desenha a setinha cinza idêntica ao mobile no canto direito */
    background-image: url("data:image/svg+xml;utf8,<svg fill='%23666666' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>") !important;
    background-repeat: no-repeat !important;
    background-position: right 12px center !important;
    padding-right: 40px !important;
  }
`;

export const BotaoForm = styled.button`
  background-color: #00b874 !important; /* Verde vivo do mobile */
  color: white !important;
  border: none !important;
  padding: 14px !important;
  font-size: 16px !important;
  font-weight: bold !important;
  border-radius: 8px !important;
  cursor: pointer !important;
  transition: background-color 0.2s, transform 0.1s !important;
  width: 100% !important;
  margin-top: 5px !important;

  &:hover {
    background-color: #00a365 !important;
  }

  &:active {
    transform: scale(0.98) !important;
  }
`;