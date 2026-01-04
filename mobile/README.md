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

### Sistema Offline-First

- ✅ **Cache Offline Completo**: Funciona totalmente sem internet
- ✅ **Sincronização Automática**: Dados sincronizam ao voltar online
- ✅ **Cache de Imagens**: Imagens permanecem disponíveis offline
- ✅ **Fila de Mutações**: Alterações offline processadas quando online

### Funcionalidades Principais

- ✅ Tela de boas-vindas com navegação
- ✅ Autenticação com Supabase (Login/Logout)
- ✅ Lista de viagens (Próximas/Passadas/Concluídas)
- ✅ Criar e editar viagens (com imagem de capa)
- ✅ Gerenciamento de despesas por viagem
- ✅ Upload de fotos (Avatar e memórias)
- ✅ Perfil de usuário com estatísticas
- ✅ Suporte a modo escuro
- ✅ Navegação com tabs inferior
- ✅ Interface responsiva
- ✅ Pull-to-refresh em todas as listas

## 🏗️ Estrutura do Projeto

```
mobile/
├── components/          # Componentes e telas
│   ├── WelcomeScreen.tsx
│   ├── TripListScreen.tsx
│   ├── NewTripScreen.tsx
│   ├── TripDetailScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── CachedImage.tsx  # Cache de imagens offline
│   └── ...
├── contexts/            # Contextos React
│   ├── AuthContext.tsx  # Autenticação
│   └── NetworkContext.tsx  # Conectividade e sync
├── services/            # Camada de dados
│   ├── api.ts          # API com gravação otimista
│   ├── localDb.ts      # Banco SQLite local
│   └── syncService.ts  # Sincronização bidirecional
├── types/               # TypeScript types
│   ├── index.ts
│   └── database-types.ts  # Types do Supabase
├── constants/           # Constantes
│   └── index.ts
├── lib/                 # Configurações
│   └── supabase.ts
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
- **Supabase** - Backend e autenticação
- **Expo SQLite** - Banco de dados local
- **Expo FileSystem** - Armazenamento de arquivos
- **NetInfo** - Monitoramento de conectividade
- **Expo Linear Gradient** - Gradientes
- **Expo Vector Icons** - Ícones Material Community
- **React Native Safe Area Context** - Safe areas
- **Expo Image Picker** - Seleção de fotos

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

Para documentação completa, consulte a pasta `../doc/`:
- **Visão geral do projeto** (01-visao-geral.md)
- **Arquitetura da aplicação** (02-arquitetura.md)
- **Guia de componentes** (03-componentes.md)
- **Guia do desenvolvedor** (04-guia-dev.md)
- **Guia de conversão React Native** (06-react-native.md)
- **Sistema Offline-First** (06-react-native-offline.md) 📱

### Documentação Offline

Documentação detalhada do sistema de cache offline está disponível em:
- **Walkthrough técnico**: `C:\Users\julio\.gemini\antigravity\brain\...\walkthrough.md`
- **Guia de testes**: `C:\Users\julio\.gemini\antigravity\brain\...\testing_guide.md`

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
