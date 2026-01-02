# EasyTravel Mobile

Versão mobile nativa do aplicativo EasyTravel, construída com React Native e Expo.

> **Nota:** Este projeto faz parte do monorepo EasyTravel. Consulte o [README principal](../README.md) para visão geral completa.

## 🚀 Quick Start


### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Expo Go app (para testar em dispositivo físico)
- Android Studio (para emulador Android) ou Xcode (para simulador iOS)

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start
```

### Executar Aplicativo

```bash
# Escanear QR code com Expo Go app
npm start

# Abrir no Android (requer emulador ou dispositivo)
npm run android

# Abrir no iOS (requer macOS)
npm run ios

# Abrir no navegador web
npm run web
```

## 📱 Funcionalidades

- ✅ Tela de boas-vindas com navegação
- ✅ Lista de viagens com tabs (Próximas/Passadas)
- ✅ Criar nova viagem
- ✅ Suporte a modo escuro
- ✅ Navegação com tabs inferior
- ✅ Interface responsiva

## 🏗️ Estrutura do Projeto

```
easytravel-native/
├── components/          # Componentes React Native
│   ├── WelcomeScreen.tsx
│   ├── TripListScreen.tsx
│   └── NewTripScreen.tsx
├── constants/           # Constantes e dados
│   └── index.ts
├── types/               # TypeScript types
│   └── index.ts
├── App.tsx              # Componente raiz com navegação
└── package.json
```

## 🛠️ Tecnologias

- **React Native** - Framework mobile
- **Expo** - Toolchain e SDK
- **TypeScript** - Type safety
- **React Navigation** - Navegação
  - Native Stack Navigator
  - Bottom Tabs Navigator
- **Expo Linear Gradient** - Gradientes
- **Expo Vector Icons** - Ícones Material Community
- **React Native Safe Area Context** - Safe areas

## 🎨 Componentes

### WelcomeScreen
Tela de boas-vindas com:
- Hero image com gradient overlay
- Ícones de features
- Botão de ação principal
- Indicadores de paginação

### TripListScreen
Lista de viagens com:
- Header com avatar e settings
- Segmented control (Próximas/Passadas)
- FlatList de viagens
- FAB para adicionar viagem
- Bottom tab navigation

### NewTripScreen
Formulário para nova viagem:
- Input de destino
- Seleção de datas (calendário placeholder)
- Participantes com scroll horizontal
- Campo de notas
- Keyboard avoiding view

## 🎯 Diferenças da Versão Web

### Navegação
- ❌ React Router DOM
- ✅ React Navigation (Stack + Bottom Tabs)

### Estilização
- ❌ Tailwind CSS classes
- ✅ StyleSheet API

### Componentes
- `div` → `View`
- `span`, `p`, `h1` → `Text`
- `button` → `TouchableOpacity` / `Pressable`
- `img` → `Image`
- `input` → `TextInput`
- Scroll automático → `ScrollView` / `FlatList`

### Ícones
- ❌ Material Symbols (web)
- ✅ @expo/vector-icons (MaterialCommunityIcons)

## 📝 Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| start | `npm start` | Inicia Metro bundler |
| android | `npm run android` | Abre no Android |
| ios | `npm run ios` | Abre no iOS (macOS only) |
| web | `npm run web` | Abre no navegador |

## 🐛 Debugging

### React Native Debugger
```bash
# Instalar
npm install -g react-native-debugger

# Usar
# Pressione 'j' no terminal onde rodou npm start
# Ou shake o dispositivo e selecione "Debug"
```

### Expo DevTools
Acessível através do QR code ou terminal após `npm start`

## 🚧 Próximos Passos

### Features Faltantes
- [ ] Implementar calendário real (react-native-calendars)
- [ ] Autenticação de usuários
- [ ] Backend integration (Supabase)
- [ ] Upload de fotos (expo-image-picker)
- [ ] Controle de gastos
- [ ] Galeria de memórias
- [ ] Notificações push

### Melhorias Técnicas
- [ ] State management (Zustand/Redux)
- [ ] Animações (react-native-reanimated)
- [ ] Testes (Jest + React Native Testing Library)
- [ ] CI/CD com EAS
- [ ] App icons e splash screen customizados

## 📚 Documentação

Para documentação completa, consulte a pasta `/doc` no projeto web:
- Visão geral do projeto
- Arquitetura da aplicação
- Guia de componentes
- Guia do desenvolvedor
- **Guia de conversão React Native** (06-react-native.md)

## 🔗 Links Úteis

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Vector Icons](https://icons.expo.fyi/)

## 📄 Licença

Projeto privado - Todos os direitos reservados

## 🤝 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação em `/doc`
2. Verifique issues conhecidas
3. Entre em contato com a equipe

---

**Desenvolvido com ❤️ usando React Native + Expo**

*Última atualização: Janeiro 2026*
