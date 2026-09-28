import styled from 'styled-components/native';

export const ContainerLogin = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ##F8F6F2; 
  padding: 20px;
`;

export const CardForm = styled.View`
  background-color: #f8f6f2;
  padding: 40px;
  border-radius: 15px;
  width: 100%;
  max-width: 420px;
  shadow-color: #000;
  shadow-offset: 0px 10px;
  shadow-opacity: 0.25;
  shadow-radius: 15px;
  elevation: 10;
`;

export const Titulo = styled.Text`
  text-align: center;
  color: #26431e;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
`;

export const GroupInput = styled.View`
  margin-bottom: 15px;
  width: 100%;
`;

export const LabelInput = styled.Text`
  font-size: 14px;
  color: #26431e;
  font-weight: bold;
  margin-bottom: 8px;
`;

export const InputTexto = styled.TextInput`
  padding: 12px;
  border-width: 1px;
  border-color: #68c53c;
  border-radius: 8px;
  font-size: 16px;
  background-color: #ffffff;
  color: #121212;
  width: 100%;
`;

export const PickerWrapper = styled.View`
  border-width: 1px;
  border-color: #68c53c;
  border-radius: 8px;
  background-color: #ffffff;
  overflow: hidden;
  width: 100%;
`;

export const BotaoForm = styled.TouchableOpacity`
  background-color: #09c264;
  padding: 14px;
  border-radius: 8px;
  margin-top: 10px;
  align-items: center;
  justify-content: center;
`;

export const BotaoTexto = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

export const AlternarModo = styled.Text`
  text-align: center;
  font-size: 14px;
  color: #121212;
  margin-top: 20px;
`;

export const AlternarDestaque = styled.Text`
  color: #09c264;
  font-weight: bold;
`;